// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {RaffleFactory} from "src/RaffleFactory.sol";
import {Raffle} from "src/Raffle.sol";
import {DeployRaffle} from "script/DeployRaffle.s.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";
import {MockKeeperRegistry2_1} from "@chainlink/contracts/src/v0.8/automation/mocks/MockKeeperRegistry2_1.sol";
import {Vm} from "forge-std/Vm.sol";
import {DeployRaffleFactory} from "script/DeployRaffleFactory.s.sol";
import {CreateSubscription} from "script/Interaction.s.sol";

contract RaffleIntegrationTest is Test {
    uint256 public constant LOCAL_CHAIN_ID = 31337;
    RaffleFactory raffleFactory;
    LinkToken linkToken;
    VRFCoordinatorV2_5Mock vrfCoordinator;
    MockKeeperRegistry2_1 automationRegistry;
    address owner;
    address player1 = address(0x456);
    address player2 = address(0x789);
    uint256 constant ENTRANCE_FEE = 0.01 ether;
    uint256 constant TIME_INTERVAL = 30;
    uint96 constant FUND_AMOUNT = 1 ether; // 1 LINK
    string constant RAFFLE_NAME_1 = "Raffle 1";
    string constant RAFFLE_NAME_2 = "Raffle 2";

    function setUp() public {
        // Deploy contracts using DeployRaffle script
        DeployRaffleFactory deployer = new DeployRaffleFactory();

        raffleFactory = deployer.deployContract();
        owner = raffleFactory.getOwner();

        if (block.chainid == LOCAL_CHAIN_ID) {
            vm.prank(owner);
            CreateSubscription createSubscription = new CreateSubscription();
            (uint256 subscriptionId,) =
                createSubscription.createSubscription(raffleFactory.getVRFCoordinator(), address(raffleFactory));

            vm.prank(owner);
            raffleFactory.setSubscriptionId(subscriptionId);

            console.log("Raffle factory owner", owner);
        }

        linkToken = LinkToken(raffleFactory.getLinkToken());
        vrfCoordinator = VRFCoordinatorV2_5Mock(raffleFactory.getVRFCoordinator());

        automationRegistry = MockKeeperRegistry2_1(raffleFactory.getAutomationRegistry());

        // Fund owner and players
        vm.deal(owner, 10 ether);
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);

        if (block.chainid == LOCAL_CHAIN_ID) {
            // Mint LINK tokens to owner

            linkToken.mint(owner, 100 ether);

            LinkToken(linkToken).mint(address(raffleFactory), FUND_AMOUNT);
        } else {
            vm.startPrank(owner);
            // Transfer LINK to RaffleFactory
            LinkToken(linkToken).transfer(address(raffleFactory), FUND_AMOUNT);
            vm.stopPrank();
        }
    }

    modifier skipFork() {
        if (block.chainid != LOCAL_CHAIN_ID) {
            return;
        }
        _;
    }

    function testFullRaffleLifecycle() public skipFork {
        // Step 1: Create a raffle
        vm.prank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME_1, ENTRANCE_FEE, TIME_INTERVAL);

        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        vm.startPrank(owner);
        raffleFactory.addConsumerToSubscription(raffleId);
        vm.stopPrank();

        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));
        uint256 subId = raffleFactory.getSubscriptionId();

        assert(raffle.getRaffleState() == Raffle.RaffleState.OPEN);
        assertEq(raffle.getTotalPlayers(), 0);
        assertEq(raffle.getSubId(), subId);
        assertEq(raffle.getOwner(), address(raffleFactory));

        // Step 2: Fund VRF subscription

        if (block.chainid == LOCAL_CHAIN_ID) {
            vm.prank(owner);
            VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subId, FUND_AMOUNT);
        } else {
            vm.startPrank(owner);
            linkToken.approve(address(raffleFactory), FUND_AMOUNT);
            raffleFactory.fundVRFSubscription(FUND_AMOUNT);
            vm.stopPrank();
        }

        (uint96 balance,,,,) = vrfCoordinator.getSubscription(subId);
        assert(balance == FUND_AMOUNT);

        // Step 3: Players enter the raffle
        vm.prank(player1);
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);
        vm.prank(player2);
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);

        assertEq(raffle.getTotalPlayers(), 2);
        assertEq(raffle.getPlayer(0), player1);
        assertEq(raffle.getPlayer(1), player2);
        // Step 3: Players enter the raffle
        uint256 player1Tickets = raffle.getPlayersTotalTickets(player1);
        uint256 player2Tickets = raffle.getPlayersTotalTickets(player2);
        assertEq(player1Tickets, 1);
        assertEq(player2Tickets, 1);

        // Step 4: Advance time and trigger upkeep
        vm.warp(block.timestamp + TIME_INTERVAL + 1);
        vm.roll(block.number + 1);

        (bool upkeepNeeded,) = raffle.checkUpkeep("");
        assertTrue(upkeepNeeded);

        vm.recordLogs();
        vm.prank(address(raffleFactory)); // Owner must call performUpkeep
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        // Step 5: Simulate VRF callback

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        // Step 6: Verify winner and raffle state
        assert(raffle.getRaffleState() == Raffle.RaffleState.CLOSED);
        address winner = raffle.getRecentWinner();
        assertTrue(winner == player1 || winner == player2);

        uint256 totalBalance = 2 * ENTRANCE_FEE;
        uint256 ownerShare = (totalBalance * 10) / 100;
        uint256 winnerShare = totalBalance - ownerShare;

        assertEq(address(winner).balance, winnerShare + (10 ether - ENTRANCE_FEE)); // Initial balance + winnings
        assertEq(address(raffleFactory).balance, ownerShare); // ETH accumulates in RaffleFactory

        // Step 7: Verify getPlayersTotalTickets reverts
        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_RaffleNotOpen.selector, raffleId));
        raffleFactory.getPlayersTotalTickets(raffleId, player1);

        // Step 8: Reopen raffle
        vm.prank(owner);
        raffleFactory.openRaffle(raffleId);

        assert(raffle.getRaffleState() == Raffle.RaffleState.OPEN);
        assertEq(raffle.getTotalPlayers(), 0);

        // Step 9: Verify new raffle entry
        vm.prank(player1);
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);

        assertEq(raffle.getTotalPlayers(), 1);
        assertEq(raffle.getPlayersTotalTickets(player1), 1);
    }

    function testMultipleRaffles() public skipFork {
        // Create two raffles with different parameters
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME_1, ENTRANCE_FEE, TIME_INTERVAL);
        raffleFactory.CreateRaffle(RAFFLE_NAME_2, ENTRANCE_FEE * 2, TIME_INTERVAL * 2);
        vm.stopPrank();

        vm.startPrank(owner);
        raffleFactory.addConsumerToSubscription(raffleFactory.getRaffleCount() - 2);
        raffleFactory.addConsumerToSubscription(raffleFactory.getRaffleCount() - 1);
        vm.stopPrank();

        assertEq(raffleFactory.getRaffleCount(), 2);

        // Verify raffle 1
        Raffle raffle1 = Raffle(raffleFactory.getRaffleById(0));
        assertEq(raffleFactory.getRaffleByName(RAFFLE_NAME_1), address(raffle1));
        assertEq(raffle1.getEntranceFee(), ENTRANCE_FEE);
        assertEq(raffle1.getTimeInterval(), TIME_INTERVAL);

        // Verify raffle 2
        Raffle raffle2 = Raffle(raffleFactory.getRaffleById(1));
        assertEq(raffleFactory.getRaffleByName(RAFFLE_NAME_2), address(raffle2));
        assertEq(raffle2.getEntranceFee(), ENTRANCE_FEE * 2);
        assertEq(raffle2.getTimeInterval(), TIME_INTERVAL * 2);

        // Fund subscription (shared by both raffles)

        if (block.chainid == LOCAL_CHAIN_ID) {
            vm.prank(owner);
            VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(raffleFactory.getSubscriptionId(), FUND_AMOUNT);
        } else {
            vm.startPrank(owner);
            linkToken.approve(address(raffleFactory), FUND_AMOUNT);
            raffleFactory.fundVRFSubscription(FUND_AMOUNT);
            vm.stopPrank();
        }

        // Players enter both raffles
        vm.prank(player1);
        raffle1.enterRaffle{value: ENTRANCE_FEE}(1);
        vm.prank(player1);
        raffle2.enterRaffle{value: ENTRANCE_FEE * 2}(1);

        assertEq(raffle1.getTotalPlayers(), 1);
        assertEq(raffle2.getTotalPlayers(), 1);

        // Advance time and process raffle 1
        vm.warp(block.timestamp + TIME_INTERVAL + 1);
        vm.roll(block.number + 1);

        vm.recordLogs();
        vm.prank(address(raffleFactory)); // Owner must call performUpkeep
        raffle1.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        //  Simulate VRF callback

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle1));

        assert(raffle1.getRaffleState() == Raffle.RaffleState.CLOSED);
        assertEq(raffle1.getRecentWinner(), player1);

        // Raffle 2 still open
        assert(raffle2.getRaffleState() == Raffle.RaffleState.OPEN);

        // Advance further for raffle 2
        vm.warp(block.timestamp + TIME_INTERVAL * 2 + 1);
        vm.roll(block.number + 2);

        vm.recordLogs();
        vm.prank(address(raffleFactory)); // Owner must call performUpkeep
        raffle2.performUpkeep("");
        entries = vm.getRecordedLogs();
        requestId = entries[1].topics[1];

        //  Simulate VRF callback

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle2));

        assert(raffle2.getRaffleState() == Raffle.RaffleState.CLOSED);
        assertEq(raffle2.getRecentWinner(), player1);
    }

    function testGetPlayersTotalTicketsRevertsForInvalidCases() public {
        vm.prank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME_1, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        // Invalid raffle ID
        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_RaffleDoesNotExist.selector, 999));
        raffleFactory.getPlayersTotalTickets(999, player1);

        // Zero player address
        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_PlayerAddressCannotBeZero.selector));
        raffleFactory.getPlayersTotalTickets(raffleId, address(0));
    }
}
