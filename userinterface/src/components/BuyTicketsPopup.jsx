
"use client";
import { useState } from "react";
import { handleBuyTickets } from "@/lib/contractInteractions";
import { toast } from "sonner";

const BuyTicketsPopup = ({ lottery, onClose }) => {


    const [ticketCount, setTicketCount] = useState(1);
    const totalCost = (lottery.fees * ticketCount).toFixed(3); // Calculate total cost

    const handleBuyingTickets = async () => {
        // Placeholder for smart contract integration with wagmi
        console.log(`Buying ${ticketCount} tickets for lottery ${lottery.id} at ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}. Total cost: ${totalCost} ETH`);

        try {
            // Show loading toast
            const loadingToast = toast.loading("Processing transaction...");

            const result = await handleBuyTickets(lottery.contractAddress || lottery.address, ticketCount, lottery.fees);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (result.success) {
                toast.success("Tickets purchased successfully!");
                onClose(); // Close popup after purchase
            }
        } catch (error) {
            console.error("Error in handleBuyingTickets:", error);
            toast.error(error.message || "Failed to purchase tickets");
        }
    };

    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-50 top-[-50]">
            <div className={`w-[60vh] p-12 relative`} style={{
                background: "linear-gradient(146deg, #FFF -8.79%, #73C5FF 19.56%, #0067A2 56.73%)",
                boxShadow: " 0 4px 10px 0 rgba(0, 0, 0, 0.25)"
            }}>


                <div className="flex justify-between items-center mb-6 ">

                    <button
                        className=" hover:text-gray-900 text-3xl transition-colors duration-200 rounded-full w-7 h-7 font-extralight absolute top-4 right-4 bg-white text-gray-600 flex items-center justify-center"
                        onClick={onClose}

                    >
                        ×
                    </button>
                </div>

                <div className="mb-6 flex flex-col gap-2">
                    <p className="text-4xl tracking-wide font-md">Enter Quantity</p>
                    <p className="text-[#F3F3F3] text-sm">Enter how many tickets you want to buy</p>
                </div>


                <div className="flex flex-col gap-6 items-start">

                    <div className="relative w-full flex items-center justify-center">
                        {/* Input */}
                        <input
                            type="number"
                            min="1"
                            value={ticketCount}
                            onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full pl-10 pr-10 py-3 rounded-3xl bg-white placeholder-[#000000] text-[#000000] text-lg appearance-none"
                            placeholder="Enter number of tickets"
                            id="ticketCountInput"
                            name="ticketCountInput"
                        />

                        {/* Minus Button */}
                        <button
                            type="button"
                            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                            className="absolute right-12 top-1/2 -translate-y-1/2 text-xl  border rounded-full w-7 h-7 flex items-center justify-center text-[#000000] bg-[#D1D1D1]"
                        >
                            –
                        </button>

                        {/* Plus Button */}
                        <button
                            type="button"
                            onClick={() => setTicketCount(ticketCount + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xl  border rounded-full w-7 h-7 flex items-center justify-center text-[#000000] bg-[#D1D1D1]"
                        >
                            +
                        </button>
                    </div>


                    <div className="grid grid-cols-2">


                        <label className="block text-base font-medium mb-2 text-[#C1E5FF] ">Total Cost</label>

                        <p className="text-[#C1E5FF] text-end">Check History</p>

                        <p className="text-6xl font-semibold ">{totalCost}<sub className="text-sm align-sub relative bottom-3 right-0">ETH</sub></p>

                    </div>

                    <button
                        className={`w-full py-4 text-white mb-2 rounded-3xl font-semibold`}
                        style={{
                            background: "linear-gradient(90deg, #73C5FF 0%, #0067A2 100%)",

                            boxShadow: " 0 4px 10px 0 rgba(0, 0, 0, 0.25)"
                        }}
                        onClick={handleBuyingTickets}
                    >
                        Confirm Transaction
                    </button>


                </div>
            </div>
        </div >
    );
};

export default BuyTicketsPopup;