// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {DeployRaffleFactory} from "script/DeployRaffleFactory.s.sol";
import {RaffleFactory} from "src/RaffleFactory.sol";
import {Test} from "forge-std/Test.sol";
import {Script, console} from "forge-std/Script.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";
import {Raffle} from "src/Raffle.sol";
import {Vm} from "forge-std/Vm.sol";
import {CreateSubscription} from "script/Interaction.s.sol";

contract RaffleFactoryTest is Test {
    event RaffleCreated(uint256 indexed raffleId, address indexed raffleAddress, string name);
    event RaffleOpened(uint256 indexed raffleId, uint256 indexed timestamp);

    uint256 public constant LOCAL_CHAIN_ID = 31337;
    RaffleFactory private raffleFactory;
    LinkToken private linkToken;
    VRFCoordinatorV2_5Mock private vrfCoordinator;

    address private owner;
    address private constant PLAYER = address(2);
    string private constant RAFFLE_NAME = "Test Raffle";
    uint256 private constant ENTRANCE_FEE = 0.01 ether;
    uint256 private constant TIME_INTERVAL = 30 seconds;
    uint256 private constant FUND_AMOUNT = 1 ether;
    uint96 private constant UPKEEP_FUND_AMOUNT = 0.5 ether;

    function setUp() public {
        DeployRaffleFactory deployer = new DeployRaffleFactory();
        raffleFactory = deployer.deployContract();

        linkToken = LinkToken(raffleFactory.getLinkToken());
        vrfCoordinator = VRFCoordinatorV2_5Mock(raffleFactory.getVRFCoordinator());
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

        // Fund the owner
        vm.deal(owner, 100 ether);
        vm.deal(PLAYER, 10 ether);

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

    modifier notOnLocal() {
        if (block.chainid == 31337) {
            return;
        }
        _;
    }

    modifier skipFork() {
        if (block.chainid != LOCAL_CHAIN_ID) {
            return;
        }
        _;
    }

    ///////////////////////
    /////Create Raffle Tests/////
    /////////////////////

    function testCreateRaffle() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        // Check if the raffle was created
        address raffleAddress = raffleFactory.getRaffleByName(RAFFLE_NAME);
        console.log("Raffle Address: ", raffleAddress);

        assert(raffleAddress != address(0));

        // Verify raffle count
        assertEq(raffleFactory.getRaffleCount(), 1);
    }

    function testCreateRaffleEventEmission() public skipFork notOnLocal {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        // Check if the raffle was created
        address raffleAddress = raffleFactory.getRaffleByName(RAFFLE_NAME);
        console.log("Raffle Address: ", raffleAddress);
        assert(raffleAddress != address(0));

        // Verify raffle count
        assertEq(raffleFactory.getRaffleCount(), 1);

        // Verify event emission
        vm.expectEmit(true, true, false, true);
        address expectedRaffleAddress = 0x02299a3DcaB0938d0544130D054Bcbfb32B588C3;
        console.log("Expected Raffle Address: ", expectedRaffleAddress);
        emit RaffleCreated(1, expectedRaffleAddress, "Another Raffle");
        raffleFactory.CreateRaffle("Another Raffle", ENTRANCE_FEE, TIME_INTERVAL);
        address actualRaffleAddress = raffleFactory.getRaffleByName("Another Raffle");
        console.log("Actual Raffle Address: ", actualRaffleAddress);
        vm.stopPrank();
    }

    function testGetRaffleById() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        // Get the raffle ID
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        // Retrieve the raffle by ID
        address raffleAddress = raffleFactory.getRaffleById(raffleId);
        console.log("Raffle Address by ID: ", raffleAddress);
        assert(raffleAddress != address(0));
        assertEq(raffleAddress, raffleFactory.getRaffleByName(RAFFLE_NAME));
        vm.stopPrank();
    }

    function testGetRaffleByName() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        // Retrieve the raffle by name
        address raffleAddress = raffleFactory.getRaffleByName(RAFFLE_NAME);
        console.log("Raffle Address by Name: ", raffleAddress);
        assert(raffleAddress != address(0));

        // Check if the address matches the expected raffle address
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;
        assertEq(raffleAddress, raffleFactory.getRaffleById(raffleId));
        vm.stopPrank();
    }

    function testCreateRaffleRevertsIfNameExists() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_RaffleAlreadyExists.selector, RAFFLE_NAME));
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        vm.stopPrank();
    }

    function testCreateRaffleOnlyowner() public {
        vm.prank(address(3)); // Non-owner
        vm.expectRevert("Only callable by owner");

        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
    }

    function testGetPlayersTotalTickets() public skipFork {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        // Add consumer to subscription
        raffleFactory.addConsumerToSubscription(raffleId);

        vm.stopPrank();

        // Player enters raffle
        vm.deal(PLAYER, 1 ether);
        vm.startPrank(PLAYER);
        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);
        vm.stopPrank();

        // Check player's tickets
        uint256 tickets = raffleFactory.getPlayersTotalTickets(raffleId, PLAYER);
        assertEq(tickets, 1);
    }

    function testGetPlayersTotalTicketsWhenMultipleTickets() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        vm.stopPrank();

        // Player enters raffle multiple times
        vm.deal(PLAYER, 10 ether);
        vm.startPrank(PLAYER);
        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);
        vm.stopPrank();

        // Check player's tickets
        uint256 tickets = raffleFactory.getPlayersTotalTickets(raffleId, PLAYER);
        assertEq(tickets, 2);
    }

    function testGetPlayersTotalTicketsRevertsIfPlayerZeroAddress() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        vm.expectRevert(RaffleFactory.RaffleFactory_PlayerAddressCannotBeZero.selector);
        raffleFactory.getPlayersTotalTickets(raffleId, address(0));
        vm.stopPrank();
    }

    function testGetPlayersTotalTicketsRevertsIfRaffleDoesNotExist() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_RaffleDoesNotExist.selector, 0));
        raffleFactory.getPlayersTotalTickets(0, PLAYER);
    }

    ///////////////////////
    /////Upkeep Tests/////
    /////////////////////

    function testCreateUpKeepWorks() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        // Check if upkeep ID is created
        uint256 upkeepId = raffleFactory.getRaffleUpkeepId(raffleId);
        assert(upkeepId > 0);

        // Check if the upkeep ID is associated with the correct raffle
        assertEq(raffleFactory.getRaffleById(raffleId), raffleFactory.getRaffleByName(RAFFLE_NAME));
        vm.stopPrank();
    }

    function testFundUpkeep() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        raffleFactory.fundUpkeep(UPKEEP_FUND_AMOUNT, raffleFactory.getRaffleUpkeepId(raffleId));
        vm.stopPrank();
    }

    function testFundUpkeepRevertsIfAmountZero() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        console.log("Raffle ID: ", raffleId);

        uint256 upkeepId = raffleFactory.getRaffleUpkeepId(raffleId);
        console.log("Upkeep ID: ", upkeepId);

        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_AmountMustBeGreaterThanZero.selector, 0));

        raffleFactory.fundUpkeep(0, upkeepId);
        vm.stopPrank();
    }

    ///////////////////////
    /////VRF Tests////////
    /////////////////////

    function testSubscriptionCreatedAndSet() public {
        vm.prank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        // Check if subscription ID is set
        uint256 subscriptionId = raffleFactory.getSubscriptionId();
        assert(subscriptionId > 0);
    }

    function testRaffleIsAddedAsConsumer() public skipFork {
        vm.prank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        // Add consumer to subscription
        vm.prank(owner);
        raffleFactory.addConsumerToSubscription(raffleId);

        // Check if the raffle is added as a consumer
        uint256 subscriptionId = raffleFactory.getSubscriptionId();
        address raffleAddress = raffleFactory.getRaffleByName(RAFFLE_NAME);
        assert(raffleAddress != address(0));

        VRFCoordinatorV2_5Mock vrfCoordinatorMock = VRFCoordinatorV2_5Mock(raffleFactory.getVRFCoordinator());
        assert(vrfCoordinatorMock.consumerIsAdded(subscriptionId, raffleAddress));
    }

    function testFundVRFSubscription() public notOnLocal {
        vm.warp(block.timestamp + TIME_INTERVAL + 1); // Move time forward to ensure subscription is created
        vm.roll(block.number + 1); // Ensure block number is updated

        vm.prank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        console.log("Subscription Created Successfully");

        // Transfer LINK tokens from owner to RaffleFactory
        vm.prank(owner);
        LinkToken(linkToken).transfer(address(raffleFactory), FUND_AMOUNT);

        vm.prank(owner);
        raffleFactory.fundVRFSubscription(FUND_AMOUNT);
    }

    function testFundVRFSubscriptionRevertsIfAmountZero() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_AmountMustBeGreaterThanZero.selector, 0));
        raffleFactory.fundVRFSubscription(0);
        vm.stopPrank();
    }

    ///////////////////////
    /////Open Raffle Tests/////
    /////////////////////

    function testOpenRaffle() public {
        vm.startPrank(owner);

        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));
        assertEq(uint256(raffle.getRaffleState()), uint256(Raffle.RaffleState.OPEN));
        vm.stopPrank();
    }

    function testOpenRaffleAfterDraw() public skipFork {
        vm.prank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;
        vm.prank(owner);
        raffleFactory.addConsumerToSubscription(raffleId);

        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));
        vm.prank(PLAYER);
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);

        vm.prank(owner);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(raffleFactory.getSubscriptionId(), FUND_AMOUNT);

        // Simulate the upkeep call to close the raffle
        vm.warp(block.timestamp + TIME_INTERVAL + 1);
        vm.roll(block.number + 1);

        vm.recordLogs();

        vm.prank(raffle.getOwner());
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        // Simulate VRF callback
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        // Now open the raffle again
        vm.expectEmit(true, false, false, true);
        emit RaffleOpened(0, block.timestamp);
        vm.prank(owner);
        raffleFactory.openRaffle(raffleId);

        assertEq(uint256(raffle.getRaffleState()), uint256(Raffle.RaffleState.OPEN));
    }

    function testOpenRaffleRevertsIfNonExistent() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_RaffleDoesNotExist.selector, 0));
        raffleFactory.openRaffle(0);
        vm.stopPrank();
    }

    function testGetPlayersTotalTicketsRevertsIfRaffleNotOpen() public skipFork {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;
        raffleFactory.addConsumerToSubscription(raffleId);
        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));

        raffle.enterRaffle{value: ENTRANCE_FEE}(1);

        vm.stopPrank();

        vm.warp(block.timestamp + TIME_INTERVAL + 1); // Move time forward to close the raffle
        vm.roll(block.number + 1); // Ensure block number is updated

        vm.startPrank(raffle.getOwner());
        Raffle(raffleFactory.getRaffleById(raffleId)).performUpkeep(""); //goes into calculating winner state on local chain
        vm.stopPrank();

        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_RaffleNotOpen.selector, raffleId));
        raffleFactory.getPlayersTotalTickets(raffleId, PLAYER);
    }

    function testOpenRaffleOnlyowner() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        vm.stopPrank();

        vm.prank(address(3)); // Non-owner
        vm.expectRevert("Only callable by owner");
        raffleFactory.openRaffle(0);
    }

    ///withdraw ETH from RaffleFactory

    function testWithdrawETH() public skipFork {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        uint256 raffleId = raffleFactory.getRaffleCount() - 1;

        raffleFactory.addConsumerToSubscription(raffleId);

        // Player enters raffle
        vm.deal(PLAYER, 1 ether);
        vm.startPrank(PLAYER);
        Raffle raffle = Raffle(raffleFactory.getRaffleById(raffleId));
        raffle.enterRaffle{value: ENTRANCE_FEE}(1);
        vm.stopPrank();

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

        uint256 ownerInitialBalance = address(owner).balance;
        //perform upkeep to close the raffle and distribute funds
        vm.warp(block.timestamp + TIME_INTERVAL + 1);
        vm.roll(block.number + 1);

        vm.recordLogs();

        vm.prank(raffle.getOwner());
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        // Simulate VRF callback
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        // Withdraw ETH
        uint256 balanceBefore = address(raffleFactory).balance;
        assert(balanceBefore > 0);

        vm.prank(owner);
        raffleFactory.withdrawETH(payable(owner));

        uint256 balanceAfter = address(raffleFactory).balance;
        assertEq(balanceAfter, 0);

        assertEq(address(owner).balance, balanceBefore + ownerInitialBalance);
    }

    function testWithdrawETHRevertsIfRecipientIsZeroAddress() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        vm.expectRevert(RaffleFactory.RaffleFactory_PlayerAddressZero.selector);
        raffleFactory.withdrawETH(payable(address(0)));
        vm.stopPrank();
    }

    function testWithdrawETHRevertsIfBalanceIsZero() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);

        vm.expectRevert(abi.encodeWithSelector(RaffleFactory.RaffleFactory_AmountMustBeGreaterThanZero.selector, 0));
        raffleFactory.withdrawETH(payable(owner));
        vm.stopPrank();
    }

    function testWithdrawETHRevertsIfNotOwner() public {
        vm.startPrank(owner);
        raffleFactory.CreateRaffle(RAFFLE_NAME, ENTRANCE_FEE, TIME_INTERVAL);
        vm.stopPrank();

        vm.prank(address(3)); // Non-owner
        vm.expectRevert("Only callable by owner");
        raffleFactory.withdrawETH(payable(owner));
    }
}
