// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Raffle} from "src/Raffle.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {CreateSubscription, FundSubscription, AddConsumer} from "./Interaction.s.sol";

contract DeployRaffle is Script {
    constructor() {}

    function run() public {
        deployContract(0.05 ether, 30 seconds); // for testing purposes
    }

    function deployContract(uint256 entranceFee, uint256 timeInterval) public returns (Raffle, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();

        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        if (config.subscriptionId == 0) {
            //get a new subscription
            CreateSubscription createSubscription = new CreateSubscription();

            (config.subscriptionId, config.vrfCoordinator) =
                createSubscription.createSubscription(config.vrfCoordinator, config.account);

            //fund the subscription

            FundSubscription fundSubscription = new FundSubscription();
            fundSubscription.fundSubscription(config.vrfCoordinator, config.subscriptionId, config.link, config.account);

            helperConfig.setConfig(block.chainid, config);
        }

        vm.startBroadcast(config.account);

        Raffle raffle = new Raffle(
            entranceFee,
            timeInterval,
            config.vrfCoordinator,
            config.subscriptionId,
            config.gasLane,
            config.callbackGasLimit,
            1
        );

        vm.stopBroadcast();

        // add Consumer
        AddConsumer addConsumer = new AddConsumer();
        addConsumer.addConsumer(address(raffle), config.vrfCoordinator, config.subscriptionId, config.account);

        console.log("Raffle deployed to: ", address(raffle));
        console.log("Link : ", config.link);

        return (raffle, helperConfig);
    }
}
