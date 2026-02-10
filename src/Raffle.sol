// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    error Raffle__TransferFailed();
    error Raffle__SendMoreToEnterRaffle();
    error Raffle__RaffleNotOpen();
    error Raffle__UpkeepNotNeeded(uint256 balance, uint256 noOfPlayers, uint256 raffleState);
    error Raffle__NotCreator();
    error Raffle__RaffleNotClosed();
    error Raffle__AmountCantBeZero();
    error Raffle__MinimumBalanceNotMet();

    enum RaffleState {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }

    // CONSTANTS
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 private constant PLATFORM_FEE_PERCENT = 2; // 2%
    uint256 private constant CREATOR_FEE_PERCENT = 1;  // 1%
    uint256 private constant MIN_BALANCE_FOR_DRAW = 1 ether; // Minimum 1 CRO to trigger draw

    // IMMUTABLES
    uint256 private immutable i_entranceFee;
    uint256 private immutable i_timeInterval;
    bytes32 private immutable i_keyHash;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    address private immutable i_creator; // Person who created this raffle
    address payable private immutable i_platformTreasury; // Platform fee destination
    uint256 private immutable i_raffleId;

    // STATE VARIABLES
    uint256 private s_lastTimeStamp;
    RaffleState private s_raffleState;
    address payable[] private s_players;
    address payable private s_recentWinner;
    mapping(address => uint256) private s_playerTicketCounts;

    // EVENTS
    event RaffleEntered(uint256 indexed raffleId, address indexed player, uint256 ticketCount);
    event WinnerPicked(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 winnerAmount,
        uint256 creatorAmount,
        uint256 platformAmount,
        uint256 timestamp
    );
    event RaffleOpened(uint256 indexed raffleId, uint256 indexed timestamp);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RaffleClosed(uint256 indexed raffleId, string reason);

    constructor(
        uint256 entranceFee,
        uint256 timeInterval,
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint256 raffleId,
        address creator,
        address payable platformTreasury
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_entranceFee = entranceFee;
        i_timeInterval = timeInterval;
        i_keyHash = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_creator = creator;
        i_platformTreasury = platformTreasury;
        i_raffleId = raffleId;
        s_lastTimeStamp = block.timestamp;
        s_raffleState = RaffleState.OPEN;
    }

    /**
     * @notice Buy tickets to enter the raffle
     * @param ticketCount Number of tickets to purchase
     */
    function enterRaffle(uint256 ticketCount) public payable {
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
        }
        if (ticketCount == 0) {
            revert Raffle__AmountCantBeZero();
        }
        if (msg.value < i_entranceFee * ticketCount) {
            revert Raffle__SendMoreToEnterRaffle();
        }

        // Add to players array if new player
        if (s_playerTicketCounts[msg.sender] == 0) {
            s_players.push(payable(msg.sender));
        }

        s_playerTicketCounts[msg.sender] += ticketCount;
        emit RaffleEntered(i_raffleId, msg.sender, ticketCount);
    }

    /**
     * @notice Chainlink Automation calls this to check if upkeep is needed
     */
    function checkUpkeep(bytes memory /* checkData */)
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool timePassed = (block.timestamp - s_lastTimeStamp) >= i_timeInterval;
        bool raffleOpened = s_raffleState == RaffleState.OPEN;
        bool hasBalance = address(this).balance >= MIN_BALANCE_FOR_DRAW;
        bool hasPlayers = s_players.length > 0;

        upkeepNeeded = timePassed && raffleOpened && hasBalance && hasPlayers;
        return (upkeepNeeded, hex"");
    }

    /**
     * @notice Chainlink Automation calls this to trigger winner selection
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool timeToPickWinner, ) = checkUpkeep("");
        if (!timeToPickWinner) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }

        s_raffleState = RaffleState.CALCULATING_WINNER;

        // Request randomness from Chainlink VRF
        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient
            .RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            });

        uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
        emit RequestedRaffleWinner(requestId);
    }

    /**
     * @notice Chainlink VRF calls this with random number to pick winner
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
        // Weighted random selection
        uint256 totalEntries = getTotalEntries();
        uint256 index = randomWords[0] % totalEntries;
        uint256 currentSum = 0;

        for (uint256 i = 0; i < s_players.length; i++) {
            currentSum += s_playerTicketCounts[s_players[i]];
            if (index < currentSum) {
                s_recentWinner = payable(s_players[i]);
                break;
            }
        }

        s_raffleState = RaffleState.CLOSED;

        // Calculate fee splits
        uint256 totalBalance = address(this).balance;
        uint256 platformShare = (totalBalance * PLATFORM_FEE_PERCENT) / 100; // 2%
        uint256 creatorShare = (totalBalance * CREATOR_FEE_PERCENT) / 100;   // 1%
        uint256 winnerShare = totalBalance - platformShare - creatorShare;   // 97%

        // Pay platform
        (bool platformSuccess, ) = i_platformTreasury.call{value: platformShare}("");
        if (!platformSuccess) revert Raffle__TransferFailed();

        // Pay creator
        (bool creatorSuccess, ) = payable(i_creator).call{value: creatorShare}("");
        if (!creatorSuccess) revert Raffle__TransferFailed();

        // Pay winner
        (bool winnerSuccess, ) = s_recentWinner.call{value: winnerShare}("");
        if (!winnerSuccess) revert Raffle__TransferFailed();

        emit WinnerPicked(
            i_raffleId,
            s_recentWinner,
            winnerShare,
            creatorShare,
            platformShare,
            block.timestamp
        );

        // Reset for next round
        for (uint256 i = 0; i < s_players.length; i++) {
            delete s_playerTicketCounts[s_players[i]];
        }
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
    }

    /**
     * @notice Creator can reopen the raffle after it closes
     */
    function openRaffle() external {
        if (msg.sender != i_creator) revert Raffle__NotCreator();
        if (s_raffleState != RaffleState.CLOSED) {
            revert Raffle__RaffleNotClosed();
        }

        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_recentWinner = payable(address(0));
        emit RaffleOpened(i_raffleId, s_lastTimeStamp);
    }

    // VIEW FUNCTIONS
    function getRaffleState() external view returns (RaffleState) {
        return s_raffleState;
    }

    function getPlayer(uint256 indexOfPlayer) external view returns (address) {
        return s_players[indexOfPlayer];
    }

    function getTotalPlayers() external view returns (uint256) {
        return s_players.length;
    }

    function getTotalEntries() public view returns (uint256) {
        uint256 totalEntries = 0;
        for (uint256 i = 0; i < s_players.length; i++) {
            totalEntries += s_playerTicketCounts[s_players[i]];
        }
        return totalEntries;
    }

    function getTimeLeft() external view returns (uint256) {
        if (s_lastTimeStamp + i_timeInterval > block.timestamp) {
            return (s_lastTimeStamp + i_timeInterval) - block.timestamp;
        } else {
            return 0;
        }
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }

    function getPlayersTotalTickets(address player) external view returns (uint256) {
        return s_playerTicketCounts[player];
    }

    function getCreator() external view returns (address) {
        return i_creator;
    }

    function getEntranceFee() external view returns (uint256) {
        return i_entranceFee;
    }

    function getTimeInterval() external view returns (uint256) {
        return i_timeInterval;
    }

    function getRaffleId() external view returns (uint256) {
        return i_raffleId;
    }

    function getPlatformTreasury() external view returns (address) {
        return i_platformTreasury;
    }

    function getMinBalanceForDraw() external pure returns (uint256) {
        return MIN_BALANCE_FOR_DRAW;
    }
}
