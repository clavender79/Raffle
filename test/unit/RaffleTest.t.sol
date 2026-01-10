// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {Test} from "forge-std/Test.sol";
import {Raffle} from "src/Raffle.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {DeployRaffle} from "script/DeployRaffle.s.sol";
import {Vm} from "forge-std/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {Script, console} from "forge-std/Script.sol";
import {FundSubscription, CreateSubscription} from "script/Interaction.s.sol";

contract RaffleTest is Script, Test, CodeConstants {
    uint256 public constant ENTRANCE_FEE = 0.05 ether;
    uint256 public constant TIME_INTERVAL = 30 seconds;
    Raffle public raffle;
    HelperConfig public helperConfig;
    uint256 entranceFee;
    uint256 timeInterval;
    address vrfCoordinator;
    uint256 subscriptionId;
    bytes32 gasLane;
    uint32 callbackGasLimit;
    address owner;

    //Events
    event RaffleEntered(uint256 indexed raffleId, address indexed player, uint256 ticketCount);
    event WinnerPicked(uint256 indexed raffleId, address indexed player, uint256 amount, uint256 timestamp);
    event RaffleOpened(uint256 indexed raffleId, uint256 indexed timestamp);

    address public PLAYER = makeAddr("PLAYER");
    uint256 public INITIAL_BALANCE = 10 ether;

    function setUp() external {
        DeployRaffle deployer = new DeployRaffle();
        (raffle, helperConfig) = deployer.deployContract(ENTRANCE_FEE, TIME_INTERVAL);
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        entranceFee = ENTRANCE_FEE;
        timeInterval = TIME_INTERVAL;
        vrfCoordinator = config.vrfCoordinator;
        subscriptionId = config.subscriptionId;
        gasLane = config.gasLane;
        callbackGasLimit = config.callbackGasLimit;
        owner = config.account;
        vm.deal(PLAYER, INITIAL_BALANCE);
    }

    function testRaffleStateOpen() external view {
        assert(raffle.getRaffleState() == Raffle.RaffleState.OPEN);
    }

    function testRaffleRevertsWhenYouDontPayEnough() external {
        //arrange
        vm.prank(PLAYER);
        //act/assert
        vm.expectRevert(Raffle.Raffle_SendMoreToEnterRaffle.selector);
        raffle.enterRaffle(1);
    }

    function testRaffleRecordPlayersWhenTheyEnter() external {
        //arrange
        vm.prank(PLAYER);

        //Act
        raffle.enterRaffle{value: 0.1 ether}(1);

        //assert
        assert(raffle.getPlayer(0) == PLAYER);
    }

    function testPlayerEnterEmitEvent() external {
        vm.prank(PLAYER);

        //act
        vm.expectEmit(true, true, false, false, address(raffle));
        emit RaffleEntered(1, PLAYER, 1);

        //assert
        raffle.enterRaffle{value: entranceFee}(1);
    }

    function testDontAllowPlayersToEnterWhileRaffleIsCalculating() external {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}(1);
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);

        vm.prank(owner);
        raffle.performUpkeep("");

        //Act/assert

        vm.expectRevert(Raffle.Raffle_RaffleNotOpen.selector);
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}(1);
    }

    // UPKEEP TESTS //

    function testCheckUpKeepReturnsFalseIfNoBalance() external {
        //Arrange
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);

        //Act
        (bool upkeepNeeded,) = raffle.checkUpkeep("");

        //Assert
        assert(!upkeepNeeded);
    }

    function testCheckUpKeepReturnsFalseIfNotOpen() external {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}(1);
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);
        vm.prank(owner);
        raffle.performUpkeep("");

        vm.prank(owner);
        //Act
        (bool upkeepNeeded,) = raffle.checkUpkeep("");

        //Assert
        assert(!upkeepNeeded);
    }

    function testUpKeepClosesRaffleIfNoPlayersAndTimePassed() external {
        //Arrange
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);

        //Act

        raffle.checkUpkeep("");

        //Assert
        assert(uint256(raffle.getRaffleState()) == 1); //Closed
        assert(raffle.getRecentWinner() == address(0));
    }

    // PERFORM UPKEEP //

    function testPerformUpkeepOnlyRunsWhenUpkeepIsTrue() external {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}(1);
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);

        //Act, Assert
        vm.prank(owner);
        raffle.performUpkeep("");
    }

    function testPerformUpkeepRevertsWhenUpkeepNotNeeded() external {
        //Arrange
        uint256 balance = 0;
        uint256 noOfPlayers = 0;
        Raffle.RaffleState raffleState = raffle.getRaffleState();

        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}(1);
        balance += entranceFee;
        noOfPlayers = 1;

        //Assert
        vm.expectRevert(
            abi.encodeWithSelector(Raffle.Raffle_UpkeepNotNeeded.selector, balance, noOfPlayers, uint256(raffleState))
        );
        vm.prank(owner);
        raffle.performUpkeep("");
    }

    modifier playerEnteredRaffle() {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}(1);
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);
        _;
    }

    modifier skipFork() {
        if (block.chainid != LOCAL_CHAIN_ID) {
            return;
        }
        _;
    }

    function testPerformUpkeepEmitsRequestIdAndUpdateRaffleState() external playerEnteredRaffle {
        //Act
        vm.recordLogs();
        vm.prank(owner); // Owner must call performUpkeep
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();

        //using second index bcz first event was actually emitted by vrfCoordinator and in topics first index is always reserved
        bytes32 requestId = entries[1].topics[1];

        //assert
        assert(uint256(requestId) > 0);
        assert(uint256(raffle.getRaffleState()) == 2); //Calculating winner
    }

    // REQUEST RANDOM WORDS //

    function testFulfillRandomWordsWorkOnlyAfterPerformUpkeep(uint256 randomRequestId)
        external
        skipFork
        playerEnteredRaffle
    {
        vm.expectRevert(VRFCoordinatorV2_5Mock.InvalidRequest.selector);

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(randomRequestId, address(raffle));
    }

    function testFulfillRandomWordsPicksAWinnerResetsAndSendsMoney() external skipFork playerEnteredRaffle {
        uint256 morePlayersToEnter = 3;
        address expectedWinner = address(1);
        console.log("Expected Winner : ", expectedWinner);

        for (uint160 i = 1; i <= morePlayersToEnter; i++) {
            address add = address(i);
            hoax(add, 10 ether);
            raffle.enterRaffle{value: entranceFee}(1);
        }

        uint256 raffleBalance = address(raffle).balance;
        console.log("Raffle Balance : ", raffleBalance);

        uint256 ownerShare = raffleBalance * 10 / 100; // 10% of the total entrance fees
        console.log("Owner Share : ", ownerShare);

        uint256 winnerShare = raffleBalance * 90 / 100; // 90% of the total entrance fees
        console.log("Winner Share : ", winnerShare);

        uint256 winnerStartingBalance = expectedWinner.balance;
        uint256 lastTimeStamp = raffle.getLastTimeStamp();

        //act
        vm.recordLogs();
        vm.prank(owner); // Owner must call performUpkeep
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        uint256 winnerPrize = ((entranceFee * (morePlayersToEnter + 1)) * 90) / 100; // 90% of the total entrance fees
        console.log("Winner Prize : ", winnerPrize);

        //check for recent winner picker emitted
        vm.expectEmit(true, true, false, true);
        emit WinnerPicked(1, expectedWinner, winnerPrize, block.timestamp);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        //assert
        address recentWinner = raffle.getRecentWinner();
        // console.log("Recent Winner : ", recentWinner);
        uint256 winnerBalance = recentWinner.balance;

        // console.log("Prize : ", prize);
        // console.log("Winner Starting Balance : ", winnerStartingBalance);
        // console.log("Winner Balance : ", winnerBalance);

        assert((winnerStartingBalance + winnerPrize) == winnerBalance);

        assert(recentWinner == expectedWinner);

        assert(raffle.getLastTimeStamp() > lastTimeStamp);

        assert(uint256(raffle.getRaffleState()) == 1); //closed
    }

    // Subscription Tests //
    function testSubscriptionWorks() external {
        FundSubscription fundSubscription = new FundSubscription();

        fundSubscription.fundSubscription(
            vrfCoordinator, subscriptionId, helperConfig.getConfig().link, helperConfig.getConfig().account
        );
    }

    function testRaffleResetsTicketCountsAndPlayersAfterWinnerIsPicked() external skipFork playerEnteredRaffle {
        // Arrange
        uint256 morePlayersToEnter = 3;
        for (uint160 i = 1; i <= morePlayersToEnter; i++) {
            address add = address(i);
            hoax(add, 10 ether);
            raffle.enterRaffle{value: entranceFee}(1);
        }

        // Act
        vm.recordLogs();
        vm.prank(owner); // Owner must call performUpkeep
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();

        bytes32 requestId = entries[1].topics[1];
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        // Assert
        assert(raffle.getPlayersTotalTickets(PLAYER) == 0);
        assert(raffle.getTotalEntries() == 0);
    }

    function testMultiplePlayersCanBuyMultipleTickets() external {
        // Arrange
        uint256 morePlayersToEnter = 3;
        for (uint160 i = 1; i <= morePlayersToEnter; i++) {
            address add = address(i);
            hoax(add, 10 ether);
            raffle.enterRaffle{value: entranceFee * 2}(2);
        }

        assert(raffle.getPlayersTotalTickets(address(1)) == 2);
        assert(raffle.getTotalEntries() == 6);
    }

    function testRaffleIdIsSetProperly() external view {
        uint256 raffleId = raffle.getRaffleId();
        assert(raffleId == 1);
    }
}
