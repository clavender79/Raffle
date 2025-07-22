// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {DeployRaffle} from "../script/DeployRaffle.s.sol";
import {Raffle} from "./Raffle.sol";

contract RaffleFactory {
    event RaffleCreated(uint256 indexed raffleId, address indexed raffleAddress, string name);

    mapping(uint256 => address) public idToRaffle;
    mapping(string => address) public nameToRaffle;
    uint256 public raffleCount;

    function CreateRaffle(string memory name, uint256 entranceFee, uint256 timeInterval) external {
        if (nameToRaffle[name] != address(0)) {
            revert("Raffle with this name already exists");
        }
        DeployRaffle deployRaffle = new DeployRaffle();
        (Raffle raffle,) = deployRaffle.deployContract(entranceFee, timeInterval);
        raffleCount++;
        idToRaffle[raffleCount] = address(raffle);
        nameToRaffle[name] = address(raffle);
        emit RaffleCreated(raffleCount, address(raffle), name);
    }

    function openRaffle(uint256 id) external {
        Raffle raffle = Raffle(idToRaffle[id]);
        raffle.openRaffle();
    }

    function getRaffleById(uint256 id) external view returns (address) {
        return idToRaffle[id];
    }

    function getRaffleByName(string memory name) external view returns (address) {
        return nameToRaffle[name];
    }

    function getRaffleCount() external view returns (uint256) {
        return raffleCount;
    }

    function getPlayersTotalTickets(uint256 raffleId, address player) external view returns (uint256) {
        Raffle raffle = Raffle(idToRaffle[raffleId]);
        return raffle.getPlayersTotalTickets(player);
    }
}
