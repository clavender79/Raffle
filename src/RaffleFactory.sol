// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {DeployRaffle} from "../script/DeployRaffle.s.sol";
import {Raffle} from "./Raffle.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {AutomationRegistrarInterface} from "../test/mocks/AutomationRegistrarInterface.sol";
import {MockKeeperRegistry2_1} from "@chainlink/contracts/src/v0.8/automation/mocks/MockKeeperRegistry2_1.sol";
import {AutomationStructs} from "../test/mocks/AutomationStructs.sol";

contract RaffleFactory is ConfirmedOwner {
    error RaffleFactory_RaffleAlreadyExists(string name);
    error RaffleFactory_RaffleDoesNotExist(uint256 id);
    error RaffleFactory_RaffleNotOpen(uint256 id);
    error RaffleFactory_PlayerAddressCannotBeZero();
    error RaffleFactory_SubscriptionIdNotSet(uint256 subscriptionId);
    error RaffleFactory_AmountMustBeGreaterThanZero(uint256 amount);
    error RaffleFactory_PlayerAddressZero();
    error RaffleFactory_WithdrawFailed();

    event RaffleCreated(uint256 indexed raffleId, address indexed raffleAddress, string name);
    event ETHReceived(address indexed sender, uint256 amount);
    event ETHWithdrawn(address indexed recipient, uint256 amount);

    uint96 private constant UPKEEP_LINK_INITIAL_FUNDS = 0.5 ether; //LINK
    mapping(uint256 => address) private idToRaffle;
    mapping(string => address) private nameToRaffle;
    mapping(uint256 => uint256) private raffleToUpkeepId;
    uint256 private s_raffleCount;
    address private s_vrfCoordinator;
    address private s_linkToken;
    uint256 private s_subscriptionId;
    bytes32 private s_gasLane;
    uint32 private s_callbackGasLimit;
    address private s_automationRegistrar;
    address private s_automationRegistry;

    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        address linkToken,
        address automationRegistrar,
        address automationRegistry,
        uint256 subscriptionId
    ) ConfirmedOwner(msg.sender) {
        s_vrfCoordinator = vrfCoordinator;
        s_gasLane = gasLane;
        s_callbackGasLimit = callbackGasLimit;
        s_linkToken = linkToken;
        s_automationRegistrar = automationRegistrar;
        s_automationRegistry = automationRegistry;
        s_subscriptionId = subscriptionId;
    }

    function CreateRaffle(string memory name, uint256 entranceFee, uint256 timeInterval) external onlyOwner {
        if (nameToRaffle[name] != address(0)) {
            revert RaffleFactory_RaffleAlreadyExists(name);
        }

        Raffle raffle = new Raffle(
            entranceFee, timeInterval, s_vrfCoordinator, s_subscriptionId, s_gasLane, s_callbackGasLimit, s_raffleCount
        );

        idToRaffle[s_raffleCount] = address(raffle);
        nameToRaffle[name] = address(raffle);

        // Register upkeep
        uint256 upkeepId = registerUpKeep(s_raffleCount, name);
        raffleToUpkeepId[s_raffleCount] = upkeepId;

        s_raffleCount++;
        emit RaffleCreated(s_raffleCount - 1, address(raffle), name);
    }

    function createVRFSubscription() external onlyOwner {
        uint256 subscriptionId = VRFCoordinatorV2_5Mock(s_vrfCoordinator).createSubscription();
        setSubscriptionId(subscriptionId);
    }

    function fundVRFSubscription(uint256 amount) external onlyOwner {
        if (amount <= 0) {
            revert RaffleFactory_AmountMustBeGreaterThanZero(amount);
        }

        LinkToken(s_linkToken).transferAndCall(s_vrfCoordinator, amount, abi.encode(s_subscriptionId));
    }

    function addConsumerToSubscription(uint256 raffleId) external onlyOwner {
        address raffleAddress = idToRaffle[raffleId];

        VRFCoordinatorV2_5Mock(s_vrfCoordinator).addConsumer(s_subscriptionId, raffleAddress);
    }

    function setSubscriptionId(uint256 subscriptionId) public onlyOwner {
        s_subscriptionId = subscriptionId;
    }

    function registerUpKeep(uint256 raffleId, string memory name) internal returns (uint256) {
        Raffle raffle = Raffle(idToRaffle[raffleId]);
        if (address(raffle) == address(0)) {
            revert RaffleFactory_RaffleDoesNotExist(raffleId);
        }

        LinkToken(s_linkToken).approve(s_automationRegistrar, UPKEEP_LINK_INITIAL_FUNDS);

        AutomationStructs.RegistrationParams memory config = AutomationStructs.RegistrationParams({
            name: name,
            encryptedEmail: "",
            upkeepContract: address(raffle),
            gasLimit: s_callbackGasLimit,
            adminAddress: msg.sender,
            triggerType: 1,
            checkData: "",
            triggerConfig: "",
            offchainConfig: "",
            amount: UPKEEP_LINK_INITIAL_FUNDS
        });

        uint256 upKeepId = AutomationRegistrarInterface(s_automationRegistrar).registerUpkeep(config);

        raffleToUpkeepId[raffleId] = upKeepId;

        return upKeepId;
    }

    function fundUpkeep(uint96 amount, uint256 upKeepId) external onlyOwner {
        if (amount <= 0) {
            revert RaffleFactory_AmountMustBeGreaterThanZero(amount);
        }

        LinkToken(s_linkToken).approve(s_automationRegistry, amount);

        MockKeeperRegistry2_1(s_automationRegistry).addFunds(upKeepId, amount);
    }

    function openRaffle(uint256 id) external onlyOwner {
        Raffle raffle = Raffle(idToRaffle[id]);
        if (address(raffle) == address(0)) {
            revert RaffleFactory_RaffleDoesNotExist(id);
        }

        raffle.openRaffle();
    }

    // Receive ETH and accumulate
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    // Withdraw accumulated ETH to owner
    function withdrawETH(address payable recipient) external onlyOwner {
        if (recipient == address(0)) {
            revert RaffleFactory_PlayerAddressZero();
        }
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert RaffleFactory_AmountMustBeGreaterThanZero(0);
        }
        (bool success,) = recipient.call{value: balance}("");
        if (!success) {
            revert RaffleFactory_WithdrawFailed();
        }
        emit ETHWithdrawn(recipient, balance);
    }

    function getRaffleById(uint256 id) external view returns (address) {
        return idToRaffle[id];
    }

    function getRaffleByName(string memory name) external view returns (address) {
        return nameToRaffle[name];
    }

    function getRaffleCount() external view returns (uint256) {
        return s_raffleCount;
    }

    function getPlayersTotalTickets(uint256 raffleId, address player) external view returns (uint256) {
        Raffle raffle = Raffle(idToRaffle[raffleId]);
        if (address(raffle) == address(0)) {
            revert RaffleFactory_RaffleDoesNotExist(raffleId);
        }
        if (player == address(0)) {
            revert RaffleFactory_PlayerAddressCannotBeZero();
        }
        if (raffle.getRaffleState() != Raffle.RaffleState.OPEN) {
            revert RaffleFactory_RaffleNotOpen(raffleId);
        }
        return raffle.getPlayersTotalTickets(player);
    }

    function getRaffleUpkeepId(uint256 raffleId) external view returns (uint256) {
        return raffleToUpkeepId[raffleId];
    }

    function getSubscriptionId() external view returns (uint256) {
        return s_subscriptionId;
    }

    function getVRFCoordinator() external view returns (address) {
        return s_vrfCoordinator;
    }

    function getLinkToken() external view returns (address) {
        return s_linkToken;
    }

    function getOwner() external view returns (address) {
        return owner();
    }

    function getAutomationRegistrar() external view returns (address) {
        return s_automationRegistrar;
    }

    function getAutomationRegistry() external view returns (address) {
        return s_automationRegistry;
    }
}
