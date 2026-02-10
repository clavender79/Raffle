// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Raffle} from "./Raffle.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";

contract RaffleFactory {
    error RaffleFactory__InsufficientCreationFee();
    error RaffleFactory__RaffleDoesNotExist(uint256 id);
    error RaffleFactory__TransferFailed();
    error RaffleFactory__InvalidAddress();

    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed raffleAddress,
        address indexed creator,
        string name
    );
    event CreationFeeCollected(address indexed creator, uint256 amount);

    // CONSTANTS
    uint256 public constant CREATION_FEE = 0.5 ether; // 0.5 CRO to create a raffle

    // STATE VARIABLES
    mapping(uint256 => address) private s_idToRaffle;
    mapping(string => address) private s_nameToRaffle;
    uint256 private s_raffleCount;

    // Chainlink VRF Configuration (for Cronos Mainnet)
    address private immutable i_vrfCoordinator;
    address private immutable i_linkToken;
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;

    // Platform treasury (where fees go)
    address payable private immutable i_platformTreasury;

    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        address linkToken,
        uint256 subscriptionId,
        address payable platformTreasury
    ) {
        if (platformTreasury == address(0)) revert RaffleFactory__InvalidAddress();
        
        i_vrfCoordinator = vrfCoordinator;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        i_linkToken = linkToken;
        i_subscriptionId = subscriptionId;
        i_platformTreasury = platformTreasury;
    }

    /**
     * @notice Anyone can create a raffle by paying the creation fee
     * @param name Unique name for the raffle
     * @param entranceFee Cost per ticket in CRO
     * @param timeInterval How long the raffle runs (in seconds)
     */
    function createRaffle(
        string memory name,
        uint256 entranceFee,
        uint256 timeInterval
    ) external payable returns (uint256) {
        // Check creation fee
        if (msg.value < CREATION_FEE) {
            revert RaffleFactory__InsufficientCreationFee();
        }

        // Check if name is already taken
        if (s_nameToRaffle[name] != address(0)) {
            revert("Raffle name already exists");
        }

        // Deploy new raffle contract
        Raffle raffle = new Raffle(
            entranceFee,
            timeInterval,
            i_vrfCoordinator,
            i_subscriptionId,
            i_gasLane,
            i_callbackGasLimit,
            s_raffleCount,
            msg.sender, // creator
            i_platformTreasury // platform treasury
        );

        // Store raffle
        s_idToRaffle[s_raffleCount] = address(raffle);
        s_nameToRaffle[name] = address(raffle);

        // Send creation fee to platform treasury
        (bool success, ) = i_platformTreasury.call{value: msg.value}("");
        if (!success) revert RaffleFactory__TransferFailed();

        emit RaffleCreated(s_raffleCount, address(raffle), msg.sender, name);
        emit CreationFeeCollected(msg.sender, msg.value);

        s_raffleCount++;
        return s_raffleCount - 1;
    }

    // VIEW FUNCTIONS
    function getRaffleById(uint256 id) external view returns (address) {
        return s_idToRaffle[id];
    }

    function getRaffleByName(string memory name) external view returns (address) {
        return s_nameToRaffle[name];
    }

    function getRaffleCount() external view returns (uint256) {
        return s_raffleCount;
    }

    function getPlatformTreasury() external view returns (address) {
        return i_platformTreasury;
    }

    function getCreationFee() external pure returns (uint256) {
        return CREATION_FEE;
    }
}
