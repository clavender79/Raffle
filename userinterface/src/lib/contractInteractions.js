
import { wagmiConfig } from "./wagmiConfig";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { RAFFLE_ABI } from "./contractData";


export async function handleBuyTickets(contractAddress,ticketCount,ticketPrice) {

    try {
        // First verify the contract exists
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
            throw new Error("Invalid contract address");
        }

        // Try to read from contract to verify it exists
        try {
            await readContract(wagmiConfig, {
                address: contractAddress,
                abi: RAFFLE_ABI,
                functionName: "getRaffleState",
            });
        } catch (readError) {
            throw new Error("Contract not found or not accessible");
        }

        const totalCost = BigInt(Math.floor(ticketPrice * ticketCount * 1e18));

        const txHash = await writeContract(wagmiConfig,{
            abi: RAFFLE_ABI,
            address: contractAddress,
            functionName: "enterRaffle",
            args: [ticketCount],
            value: totalCost,
        });

        // Wait for transaction confirmation
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash,
        });

        if (receipt.status === 'reverted') {
            throw new Error("Transaction failed");
        }

        return { success: true, receipt };
    } catch (error) {
        console.error("Error buying tickets:", error);
        // Re-throw with more user-friendly message
        if (error.message.includes("user rejected")) {
            throw new Error("Transaction cancelled by user");
        } else if (error.message.includes("insufficient funds")) {
            throw new Error("Insufficient funds for this transaction");
        } else if (error.message.includes("Contract not found")) {
            throw error;
        } else {
            throw new Error(error.message || "Failed to purchase tickets. Please try again.");
        }
    }
}
     
