// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";
import {RaffleFactory} from "src/RaffleFactory.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";
import {CreateSubscription} from "script/Interaction.s.sol";

contract DeployRaffleFactory is Script {
    function run() public {
        deployContract();
    }

    function deployContract() public returns (RaffleFactory raffleFactory) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        vm.startBroadcast(config.account);

        raffleFactory = new RaffleFactory(
            config.vrfCoordinator,
            config.gasLane,
            config.callbackGasLimit,
            config.link,
            config.automationRegistrar,
            config.automationRegistry,
            config.subscriptionId
        );

        vm.stopBroadcast();
    }
}
