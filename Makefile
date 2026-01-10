-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

DEFAULT_ANVIL_KEY := 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

DEFAULT_ANVIL_ACCOUNT := 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

RAFFLE_FACTORY_ADDRESS := 0x712516e61C8B383dF4A63CFe83d7701Bce54B03e

RAFFLE_FACTORY_ADDRESS_SEPOLIA := 0x2ea3a205B3C45E7a99C4CAe26f83763F92D94647

SEP_ACC := 0x8943F7348E2559C6E69eeCb0dA932424C3E6dC66


help:
	@echo "Usage:"
	@echo "  make deploy [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""
	@echo ""
	@echo "  make fund [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install :; forge install cyfrin/foundry-devops@0.2.2 --no-commit && forge install smartcontractkit/chainlink-brownie-contracts@1.1.1 --no-commit && forge install foundry-rs/forge-std@v1.8.2 --no-commit && forge install transmissions11/solmate@v6 --no-commit

# Update Dependencies
update:; forge update

build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast -vvvv


deploy-sepolia:; forge script script/DeployRaffleFactory.s.sol:DeployRaffleFactory --rpc-url $(SEPOLIA_RPC_URL) --account sepkey --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv

deploy-anvil:
	forge script script/DeployRaffleFactory.s.sol:DeployRaffleFactory $(NETWORK_ARGS)

deploy-raffle-anvil:
	forge script script/DeployRaffle.s.sol:DeployRaffle $(NETWORK_ARGS)

	
createSubscription:
	forge script script/Interaction.s.sol:CreateSubscription $(NETWORK_ARGS)

addConsumer:
	@forge script script/Interaction.s.sol:AddConsumer $(NETWORK_ARGS)

fundSubscription:
	@forge script script/Interaction.s.sol:FundSubscription $(NETWORK_ARGS)

createRaffle:
	cast send $(RAFFLE_FACTORY_ADDRESS) "CreateRaffle(string memory,uint256,uint256)" "Test Raffle" 1000000000000000 180 --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) -vvvvv

createRaffleSepolia:
	cast send $(RAFFLE_FACTORY_ADDRESS_SEPOLIA) "CreateRaffle(string memory,uint256,uint256)" "Raffle S" 1000000000000000 600 --rpc-url $(SEPOLIA_RPC_URL) --account sepkey -vvvvvv


getRaffle:
	cast call $(RAFFLE_FACTORY_ADDRESS) "getRaffleById(uint256)" 0 --rpc-url http://localhost:8545 

getRaffleSepolia:
	cast call $(RAFFLE_FACTORY_ADDRESS_SEPOLIA) "getRaffleById(uint256)" 0 --rpc-url $(SEPOLIA_RPC_URL)

enterRaffle:
	cast send "0x27D668603c635f85A667149a8b10ad4729F75A34" "enterRaffle()"  --value 1000000000000000 --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) -vvvvv

enterRaffleSepolia:
	cast send "0x2319Fa6F046929f5cA3B97A78BD0486544fdF231" "enterRaffle()" --value 1000000000000000 --rpc-url $(SEPOLIA_RPC_URL) --account sepkey -vvvvvv

getRaffleStateSepolia:
	cast call "0x97FA4BB76375825223875D873Da62838aa281447" "getRaffleState()" --rpc-url $(SEPOLIA_RPC_URL) 

getEntraceFeeSepolia:
	cast call "0x08fff9d526ebc327282d3f24cc596055fe29ab88" "getEntranceFee()" --rpc-url $(SEPOLIA_RPC_URL)

getRaffleTimeLeftSepolia:
	cast call "0x9f38bd12a8fca91ed36c2cc3f87fe94532f31ead" "getTimeLeft()" --rpc-url $(SEPOLIA_RPC_URL) 

checkUpKeepSeplia:
	cast call "0x9f38bd12a8fca91ed36c2cc3f87fe94532f31ead" "checkUpkeep(bytes memory)" 0x --rpc-url $(SEPOLIA_RPC_URL)

upKeepSepolia:
	cast send "0x9f38bd12a8fca91ed36c2cc3f87fe94532f31ead" "performUpkeep(bytes memory)" 0x --rpc-url $(SEPOLIA_RPC_URL) --account sepkey -vvvvvv



getPlayersSepolia:
	cast call $(RAFFLE_FACTORY_ADDRESS_SEPOLIA) "getPlayersTotalTickets(uint256,address)" 3 $(SEP_ACC) --rpc-url $(SEPOLIA_RPC_URL)


getPlayers:
	cast call $(RAFFLE_FACTORY_ADDRESS) "getPlayersTotalTickets(uint256,address)" 0 $(DEFAULT_ANVIL_ACCOUNT) --rpc-url http://localhost:8545
