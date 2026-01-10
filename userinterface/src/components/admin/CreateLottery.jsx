
"use client";

import { useState, useEffect } from "react";
import CreateLotteriesButton from "./CreateLotteriesButton";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";

import { wagmiConfig } from "@/lib/wagmiConfig";
import { RAFFLE_FACTORY_ADDRESS, RAFFLE_FACTORY_ABI,RAFFLE_ABI } from "@/lib/contractData";
import { useAdmin } from '@/lib/useAdmin';
import { toast } from 'sonner';






const CreateLottery = () => {
    // State for form fields
    const [lotteryId, setLotteryId] = useState("");
    const [lotteryName, setLotteryName] = useState("");
    const [blockchain, setBlockchain] = useState("Ethereum");
    const [entryFee, setEntryFee] = useState("");
    const [days, setDays] = useState("");
    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState("");
    

    // Simulate fetching lottery ID (replace with real data fetch)
    useEffect(() => {
        const fetchLotteryId = async () => {
            // Mock API call (replace with wagmi or contract call)
            console.log("Raffle Factory Address:", RAFFLE_FACTORY_ADDRESS);
            const result = await readContract(wagmiConfig, {
                address: RAFFLE_FACTORY_ADDRESS,
                abi: RAFFLE_FACTORY_ABI,
                functionName: "getRaffleCount",
            });
            const newId = Number(result);
            console.log("Fetched Lottery ID:", newId);
            setLotteryId(newId);


        };
        fetchLotteryId();
    }, []);


    const { canWrite } = useAdmin();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Guard: only owners (isAdmin) can write
        if (!canWrite) {
            toast.error('Demo mode: Connect owner wallet to enable this action.');
            return;
        }

        console.log({
            lotteryId,
            lotteryName,
            entryFee,
            timeInterval: `${days} days, ${minutes} minutes, ${seconds} seconds`,
        });

        try {
            // Show loading toast
            const loadingToast = toast.loading("Creating lottery...");

            //convert time interval to seconds
            const totalSeconds = parseInt(days) * 86400 + parseInt(minutes) * 60 + parseInt(seconds);
            console.log("Total Time Interval in seconds:", totalSeconds);

            if (totalSeconds <= 0) {
                toast.dismiss(loadingToast);
                toast.error("Time interval must be greater than 0");
                return;
            }

            //convert entry fee to wei
            const entryFeeInWei = BigInt(Math.floor(parseFloat(entryFee) * 1e18)); // Assuming entry fee is in ETH
            console.log("Entry Fee in Wei:", entryFeeInWei);

            if (!RAFFLE_FACTORY_ADDRESS || RAFFLE_FACTORY_ADDRESS === '0x0000000000000000000000000000000000000000') {
                toast.dismiss(loadingToast);
                toast.error("Factory contract not found");
                return;
            }

            const txHash = await writeContract(wagmiConfig, {
                address: RAFFLE_FACTORY_ADDRESS,
                abi: RAFFLE_FACTORY_ABI,
                functionName: 'CreateRaffle',
                args: [lotteryName, entryFeeInWei, totalSeconds],
            });

            const receipt = await waitForTransactionReceipt(wagmiConfig, {
                hash: txHash,
            });

            toast.dismiss(loadingToast);

            if (receipt.status === 'reverted') {
                toast.error("Transaction failed");
                return;
            }

            console.log("Lottery created successfully with txHash:", txHash);
            toast.success("Lottery created successfully!");

            // Reset form
            setLotteryName("");
            setEntryFee("");
            setDays("");
            setMinutes("");
            setSeconds("");

        } catch (error) {
            console.error("Error creating lottery:", error);
            if (error.message.includes("user rejected")) {
                toast.error("Transaction cancelled by user");
            } else if (error.message.includes("insufficient funds")) {
                toast.error("Insufficient funds for this transaction");
            } else {
                toast.error(error.message || "Failed to create lottery. Please try again.");
            }
        }
    };

    return (
        <div className="w-2/3">

            <form onSubmit={handleSubmit} className="">
                {/* First Row: Lottery ID and Currency */}
                <div className="flex space-x-4  mb-6">
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-medium text-[#FFFFFF]">Lottery ID</label>
                        <input
                            type="text"
                            value={lotteryId}
                            readOnly
                            className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl  text-[#747474]"
                            placeholder="Id"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-medium text-[#FFFFFF]">Blockchain</label>
                        <select
                            value={blockchain}
                            onChange={(e) => setBlockchain(e.target.value)}
                            className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl   text-[#FFFFFF]"
                        >
                            <option value="Ethereum">Ethereum</option>


                        </select>
                    </div>
                </div>

                {/* Second Row: Lottery Name */}
                <div className=" mb-6">
                    <label className="block mb-2 text-sm font-medium text-[#FFFFFF]">Lottery Name</label>
                    <input
                        type="text"
                        value={lotteryName}
                        onChange={(e) => setLotteryName(e.target.value)}
                        className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl "
                        placeholder="Enter lottery name"
                        required
                    />
                </div>

                {/* Third Row: Entry Fee */}
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-[#FFFFFF]">Entry Fee</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={entryFee}
                            onChange={(e) => setEntryFee(e.target.value)}
                            className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl  pr-16"
                            placeholder="0.00"
                            step="any"
                            min="0"
                            required
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700">
                            ETH
                        </span>
                    </div>
                </div>

                {/* Fourth Row: Time Interval */}
                <div className="mb-12">
                    <label className="block mb-2 text-sm font-medium text-[#FFFFFF]">Time Interval</label>
                    <div className="flex space-x-4 ">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl "
                                placeholder="Days"
                                min="0"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl"
                                placeholder="Minutes"
                                min="0"
                                max="59"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={seconds}
                                onChange={(e) => setSeconds(e.target.value)}
                                className="mt-1 block w-full p-2 border-2 border-[#131313] rounded-xl"
                                placeholder="Seconds"
                                min="0"
                                max="59"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Create Lottery Button */}
                <CreateLotteriesButton className="font-semibold" />
            </form>
        </div>
    );
};

export default CreateLottery;