// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    error Raffle_TransferFailed();
    error Raffle_SendMoreToEnterRaffle();
    error Raffle_RaffleNotOpen();
    error Raffle_UpkeepNotNeeded(
        uint256 balance,
        uint256 noOfPlayers,
        uint256 raffleState
    );

    enum RaffleState {
        OPEN,
        CALCULATING_WINNER
    }

    uint16 private constant REQUEST_CONFORMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 private immutable i_entranceFee;
    uint256 private immutable i_timeInterval;
    bytes32 private immutable i_keyHash;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    address private immutable i_owner;

    uint256 private s_lastTimeStamp;
    RaffleState private s_raffleState;

    address payable[] private s_players;
    address payable private s_recentWinner;

    //Events
    event RaffleEntered(address indexed player);
    event WinnerPicked(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );

    event RequestedRaffleWinner(uint256 indexed requestId);

    constructor(
        uint256 entranceFee,
        uint256 timeInterval,
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_entranceFee = entranceFee;
        i_timeInterval = timeInterval;
        i_keyHash = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_owner = msg.sender;

        s_lastTimeStamp = block.timestamp;
        s_raffleState = RaffleState.OPEN;
    }

    //To Enter the Raffle
    function enterRaffle() public payable {
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle_RaffleNotOpen();
        }
        if (msg.value < i_entranceFee) {
            revert Raffle_SendMoreToEnterRaffle();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool timePassed = (block.timestamp - s_lastTimeStamp) >= i_timeInterval;
        bool raffleOpened = s_raffleState == RaffleState.OPEN;
        bool hasBalance = address(this).balance > 0;
        bool hasPlayers = s_players.length > 0;

        upkeepNeeded = timePassed && raffleOpened && hasBalance && hasPlayers;

        return (upkeepNeeded, hex"");
    }

    //Pick Winenr
    function performUpkeep(bytes calldata /*Perform Data*/) external override {
        //if enough time has passed
        (bool timeToPickWinner, ) = checkUpkeep("");
        if (!timeToPickWinner) {
            revert Raffle_UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING_WINNER;

        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient
            .RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFORMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            });

        uint256 requestId = s_vrfCoordinator.requestRandomWords(request);

        emit RequestedRaffleWinner(requestId);

        //generate random number to pick a winner

        //Automate the process
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        s_recentWinner = payable(s_players[indexOfWinner]);

        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        //storing the total balance
        uint256 totalBalance = address(this).balance;

        (bool success, ) = s_recentWinner.call{value: totalBalance}("");

        if (!success) {
            revert Raffle_TransferFailed();
        }
        emit WinnerPicked(s_recentWinner, totalBalance, s_lastTimeStamp);
    }

    function getRaffleState() external view returns (RaffleState) {
        return s_raffleState;
    }

    function getPlayer(uint256 indexOfPlayer) external view returns (address) {
        return s_players[indexOfPlayer];
    }

    function getTotalPlayers() external view returns (uint256) {
        return s_players.length;
    }

    function getTimeLeft() external view returns (uint256) {
        if (s_lastTimeStamp + i_timeInterval > block.timestamp) {
            return (s_lastTimeStamp + i_timeInterval) - block.timestamp;
        } else {
            return 0;
        }
    }

    function getLastTimeStamp() external view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }

    function getAllRaffleAttributes()
        external
        view
        returns (uint256, uint256, bytes32, uint256, uint32, uint256, uint256)
    {
        return (
            i_entranceFee,
            i_timeInterval,
            i_keyHash,
            i_subscriptionId,
            i_callbackGasLimit,
            s_lastTimeStamp,
            uint256(s_raffleState)
        );
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }
}
