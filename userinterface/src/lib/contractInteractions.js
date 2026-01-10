
import { wagmiConfig } from "./wagmiConfig";
import { writeContract,waitForTransactionReceipt } from "wagmi/actions";
import { RAFFLE_ABI } from "./contractData";


export async function handleBuyTickets(contractAddress,ticketCount,ticketPrice) {

    try {
        const totalCost = (ticketPrice * ticketCount);

        const tx = await writeContract(wagmiConfig,{
            abi: RAFFLE_ABI,
            address: contractAddress,
            functionName: "enterRaffle",
            args: [ticketCount],
            value: totalCost,
        });

        await waitForTransactionReceipt(tx);
    } catch (error) {
        console.error("Error buying tickets:", error);
    }
}
     
