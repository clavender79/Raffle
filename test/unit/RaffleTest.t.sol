// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {Test} from "forge-std/Test.sol";
import {Raffle} from "src/Raffle.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {DeployRaffle} from "script/DeployRaffle.s.sol";
import {Vm} from "forge-std/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {console} from "forge-std/Script.sol";
import {FundSubscription, CreateSubscription} from "script/Interaction.s.sol";

contract RaffleTest is Test, CodeConstants {
    Raffle public raffle;
    HelperConfig public helperConfig;
    uint256 entranceFee;
    uint256 timeInterval;
    address vrfCoordinator;
    uint256 subscriptionId;
    bytes32 gasLane;
    uint32 callbackGasLimit;

    //Events
    event RaffleEntered(address indexed player);
    event WinnerPicked(address indexed player, uint256 amount, uint256 timestamp);

    address public PLAYER = makeAddr("PLAYER");
    uint256 public INITIAL_BALANCE = 10 ether;

    function setUp() external {
        DeployRaffle deployer = new DeployRaffle();
        (raffle, helperConfig) = deployer.deployContract();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        entranceFee = config.entranceFee;
        timeInterval = config.timeInterval;
        vrfCoordinator = config.vrfCoordinator;
        subscriptionId = config.subscriptionId;
        gasLane = config.gasLane;
        callbackGasLimit = config.callbackGasLimit;
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
        raffle.enterRaffle();
    }

    function testRaffleRecordPlayersWhenTheyEnter() external {
        //arrange
        vm.prank(PLAYER);

        //Act
        raffle.enterRaffle{value: 0.1 ether}();

        //assert
        assert(raffle.getPlayer(0) == PLAYER);
    }

    function testPlayerEnterEmitEvent() external {
        vm.prank(PLAYER);

        //act
        vm.expectEmit(true, false, false, false, address(raffle));
        emit RaffleEntered(PLAYER);

        //assert
        raffle.enterRaffle{value: entranceFee}();
    }

    function testDontAllowPlayersToEnterWhileRaffleIsCalculating() external {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);
        raffle.performUpkeep("");

        //Act/assert

        vm.expectRevert(Raffle.Raffle_RaffleNotOpen.selector);
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
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
        raffle.enterRaffle{value: entranceFee}();
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);
        raffle.performUpkeep("");

        //Act
        (bool upkeepNeeded,) = raffle.checkUpkeep("");

        //Assert
        assert(!upkeepNeeded);
    }

    // PERFORM UPKEEP //

    function testPerformUpkeepOnlyRunsWhenUpkeepIsTrue() external {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
        vm.warp(block.timestamp + 30 + 1);
        vm.roll(block.number + 1);

        //Act, Assert
        raffle.performUpkeep("");
    }

    function testPerformUpkeepRevertsWhenUpkeepNotNeeded() external {
        //Arrange
        uint256 balance = 0;
        uint256 noOfPlayers = 0;
        Raffle.RaffleState raffleState = raffle.getRaffleState();

        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
        balance += entranceFee;
        noOfPlayers = 1;

        //Assert
        vm.expectRevert(
            abi.encodeWithSelector(Raffle.Raffle_UpkeepNotNeeded.selector, balance, noOfPlayers, uint256(raffleState))
        );
        raffle.performUpkeep("");
    }

    modifier playerEnteredRaffle() {
        //Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
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
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();

        //using second index bcz first event was actually emitted by vrfCoordinator and in topics first index is always reserved
        bytes32 requestId = entries[1].topics[1];

        //assert
        assert(uint256(requestId) > 0);
        assert(uint256(raffle.getRaffleState()) == 1);
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
        // console.log("Expected Winner : ", expectedWinner);

        for (uint160 i = 1; i <= morePlayersToEnter; i++) {
            address add = address(i);
            hoax(add, 10 ether);
            raffle.enterRaffle{value: entranceFee}();
        }

        uint256 winnerStartingBalance = expectedWinner.balance;
        uint256 lastTimeStamp = raffle.getLastTimeStamp();

        //act
        vm.recordLogs();
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        //check for recent winner picket emitted
        vm.expectEmit(true, false, false, true);
        emit WinnerPicked(expectedWinner, entranceFee * (morePlayersToEnter + 1), block.timestamp);

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        //assert
        address recentWinner = raffle.getRecentWinner();
        // console.log("Recent Winner : ", recentWinner);
        uint256 winnerBalance = recentWinner.balance;
        uint256 prize = entranceFee * (morePlayersToEnter + 1);
        // console.log("Prize : ", prize);
        // console.log("Winner Starting Balance : ", winnerStartingBalance);
        // console.log("Winner Balance : ", winnerBalance);

        assert((winnerStartingBalance + prize) == winnerBalance);

        assert(recentWinner == expectedWinner);

        assert(raffle.getLastTimeStamp() > lastTimeStamp);

        assert(uint256(raffle.getRaffleState()) == 0);
    }

    // Subscription Tests //
    function testSubscriptionWorks() external {
        FundSubscription fundSubscription = new FundSubscription();

        fundSubscription.fundSubscription(
            vrfCoordinator, subscriptionId, helperConfig.getConfig().link, helperConfig.getConfig().account
        );
    }
}
