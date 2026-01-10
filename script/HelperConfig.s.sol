// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";
import {MockAutomationRegistry} from "../test/mocks/MockAutomationRegistry.sol";

contract CodeConstants {
    uint256 public SEPOLIA_CHAIN_ID = 11155111;
    uint256 public LOCAL_CHAIN_ID = 31337;

    //Mock constants
    uint96 public ANVIL_BASE_FEE = 0.1 ether;
    uint96 public ANVIL_GAS_PRICE = 1e1;
    int256 public ANVIL_WEI_PER_UNIT_LINK = 1e18;
}

contract HelperConfig is Script, CodeConstants {
    struct NetworkConfig {
        address vrfCoordinator;
        uint256 subscriptionId;
        bytes32 gasLane;
        uint32 callbackGasLimit;
        address link;
        address account;
        address automationRegistrar;
        address automationRegistry;
    }

    mapping(uint256 chainId => NetworkConfig) public networkConfigs;
    NetworkConfig public localNetworkConfig;

    constructor() {
        networkConfigs[SEPOLIA_CHAIN_ID] = getSepoliaNetworkConfig();
    }

    function getSepoliaNetworkConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig(
            0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B,
            97885952563417521112045702853058881314840222887341758736713635074066445282871,
            0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            200000,
            0x779877A7B0D9E8603169DdbD7836e478b4624789,
            0x8943F7348E2559C6E69eeCb0dA932424C3E6dC66, //burner wallet address
            0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976, //Automation Registrar address
            0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad //Automation Registry address
        );
    }

    function getConfigByChainID(uint256 chainID) public returns (NetworkConfig memory) {
        // console.log("chain Id : ", chainID);
        NetworkConfig memory config = networkConfigs[chainID];
        // console.log("config.vrf: ", config.vrfCoordinator);
        // console.log("config.link: ", config.link);
        // console.log("config.subId: ", config.subscriptionId);

        if (config.vrfCoordinator != address(0)) {
            return config;
        } else if (chainID == LOCAL_CHAIN_ID) {
            //for anvil
            config = getOrCreateAnvilEthConfig();
        }
        return config;
    }

    function getConfig() public returns (NetworkConfig memory) {
        return getConfigByChainID(block.chainid);
    }

    function setConfig(uint256 chainId, NetworkConfig memory networkConfig) public {
        networkConfigs[chainId] = networkConfig;
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
        if (localNetworkConfig.vrfCoordinator != address(0)) {
            return localNetworkConfig;
        } else {
            vm.startBroadcast();
            VRFCoordinatorV2_5Mock vrfCoordinator =
                new VRFCoordinatorV2_5Mock(ANVIL_BASE_FEE, ANVIL_GAS_PRICE, ANVIL_WEI_PER_UNIT_LINK);

            LinkToken link = new LinkToken();

            //both registrar and registry for anvil as we deployed such a mock
            MockAutomationRegistry mockAutomationRegistry = new MockAutomationRegistry(address(link));

            vm.stopBroadcast();
            localNetworkConfig = NetworkConfig(
                address(vrfCoordinator),
                0,
                0,
                500000,
                address(link),
                0x70997970C51812dc3A010C7d01b50e0d17dc79C8, //default foundary address
                address(mockAutomationRegistry),
                address(mockAutomationRegistry)
            );
            return localNetworkConfig;
        }
    }
}
