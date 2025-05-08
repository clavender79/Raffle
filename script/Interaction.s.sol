// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {HelperConfig, CodeConstants} from "./HelperConfig.s.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";
import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";
import {Raffle} from "src/Raffle.sol";

contract CreateSubscription is Script {
    function createSubscriptionUsingConfig() public returns (uint256, address) {
        HelperConfig helperConfig = new HelperConfig();
        
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        address account = helperConfig.getConfig().account;

        (uint256 subId, ) = createSubscription(vrfCoordinator, account);

        console.log("Subscription in the create subs: ", subId);

        return (subId, vrfCoordinator);
    }

    function createSubscription(
        address vrfCoordinator,
        address account
    ) public returns (uint256, address) {
        console.log("block number: ", block.number);
        vm.startBroadcast(account);
        uint256 subId = VRFCoordinatorV2_5Mock(vrfCoordinator)
            .createSubscription();
        vm.stopBroadcast();
        console.log("Subscirption in create after mock call : ", subId);

        console.log("Subscription: ", subId);
        return (subId, vrfCoordinator);
    }

    function run() public {
        createSubscriptionUsingConfig();
    }
}

contract FundSubscription is Script, CodeConstants {
    uint256 FUND_AMOUNT = 1 ether; //ether is just for e18 decimals so for us it is 3 link as it also has 18 decimals

    function fundSubscriptionUsingConfig() public {
        HelperConfig helperConfig = new HelperConfig();
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        uint256 subscriptionId = helperConfig.getConfig().subscriptionId;
        address link = helperConfig.getConfig().link;
        address account = helperConfig.getConfig().account;

        console.log("vrf Coordinator: ", vrfCoordinator);
        console.log("Subscription: ", subscriptionId);
        console.log("LINK : ", link);

        fundSubscription(vrfCoordinator, subscriptionId, link, account);
    }

    function fundSubscription(
        address vrfCoordinator,
        uint256 subscriptionId,
        address linkToken,
        address account
    ) public {
        console.log("Chain Id", block.chainid);
        console.log("Funding Subscription: ", subscriptionId);
        if (block.chainid == LOCAL_CHAIN_ID) {
            vm.startBroadcast(account);
            VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(
                subscriptionId,
                FUND_AMOUNT
            );
            vm.stopBroadcast();
        }
        //link token has a transfer and call function
        else {
            vm.startBroadcast(account);
            LinkToken(linkToken).transferAndCall(
                vrfCoordinator,
                FUND_AMOUNT,
                abi.encode(subscriptionId)
            );
            vm.stopBroadcast();
        }
    }

    function run() public {
        fundSubscriptionUsingConfig();
    }
}

contract AddConsumer is Script {
    function addConsumerUsingConfig(address mostRecentDeployed) public {
        HelperConfig helperConfig = new HelperConfig();
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        uint256 subscriptionId = helperConfig.getConfig().subscriptionId;
        address account = helperConfig.getConfig().account;

        addConsumer(
            mostRecentDeployed,
            vrfCoordinator,
            subscriptionId,
            account
        );
    }

    function addConsumer(
        address consumerToAdd,
        address vrfCoordinator,
        uint256 subscriptionId,
        address account
    ) public {
        console.log("Chain Id", block.chainid);
        console.log("Funding Subscription: ", subscriptionId);
        console.log("Consumer to add: ", consumerToAdd);

        vm.startBroadcast(account);
        VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(
            subscriptionId,
            consumerToAdd
        );
        vm.stopBroadcast();
    }

    function run() public {
        address mostRecentDeployed = DevOpsTools.get_most_recent_deployment(
            "Raffle",
            block.chainid
        );
        addConsumerUsingConfig(mostRecentDeployed);
    }
}

contract GetRaffleAttributes is Script {
    function run() public view {
        address mostRecentDeployed = DevOpsTools.get_most_recent_deployment(
            "Raffle",
            block.chainid
        );
        console.log("Most recent deployed Raffle: ", mostRecentDeployed);
        Raffle raffle = Raffle(mostRecentDeployed);
        (
            uint256 entranceFee,
            uint256 timeInterval,
            ,
            uint256 subscriptionId,
            uint32 callbackGasLimit,
            uint256 lastTimeStamp,
            uint256 raffleState
        ) = raffle.getAllRaffleAttributes();

        console.log("Entrance Fee: ", entranceFee);
        console.log("Time Interval: ", timeInterval);

        console.log("Subscription Id: ", subscriptionId);
        console.log("Callback Gas Limit: ", callbackGasLimit);
        console.log("Last Time Stamp: ", lastTimeStamp);
        console.log("Raffle State: ", raffleState);
    }
}
