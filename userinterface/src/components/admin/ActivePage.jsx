"use client"

import LotterySearchFilter from "../LotterySearchFilter";
import AdminTable from "./AdminTable";
import AddMoreLotteries from "./AddMoreLotteries";
import useWalletStore from "@/lib/useWalletStore";
import { formatRemainingTime } from "@/lib/utils";
import { useState, useEffect } from "react"





const lotteryData = [
    { "Lottery Id": "L006", "Lottery Name": "Summer Raffle", Entries: 150, "Total Balance": "2.5 ETH", "Time Remaining": "12h 30m" },
    { "Lottery Id": "L002", "Lottery Name": "Winter Draw", Entries: 85, "Total Balance": "1.8 ETH", "Time Remaining": "3d 2h" },
    { "Lottery Id": "L003", "Lottery Name": "Golden Ticket", Entries: 230, "Total Balance": "4.0 ETH", "Time Remaining": "1d 15h" },
    { "Lottery Id": "L004", "Lottery Name": "Holiday Jackpot", Entries: 120, "Total Balance": "2.0 ETH", "Time Remaining": "5h 45m" },
    { "Lottery Id": "L005", "Lottery Name": "New Year Spin", Entries: 90, "Total Balance": "1.5 ETH", "Time Remaining": "2d 10h" },
];




const ActivePage = () => {

    //Fetch the lottery Data from zustand
    const raffleContracts = useWalletStore(state => state.raffleContracts);
    const openRaffles = raffleContracts.filter(r => r.is_open);
    const [searchTerm, setSearchTerm] = useState("");

    if(!openRaffles || openRaffles.length === 0) {
        return <div>No active lotteries found.</div>;
    }

    const lotteryData = openRaffles
        .map(r => {
            const lastOpened = new Date(r.last_opened_at).getTime();
            const intervalMs = r.time_interval * 1000;
            const now = Date.now();

            const remainingMs = Math.max(lastOpened + intervalMs - now, 0);

            return {
                id: r.raffle_id,
                name: r.name,
                total_entries: r.total_entries,
                total_balance: r.total_balance + " ETH",
                formatted_remaining_time: formatRemainingTime(remainingMs),
                remainingMs: remainingMs
            };
        })
        .filter(lottery => lottery.remainingMs > 0); // Filter out expired lotteries

    console.log("Lottery Data:" ,lotteryData)


    return (
        <>
            <LotterySearchFilter searchTerm={searchTerm}
            onSearchChange={setSearchTerm} className="text-[#585858] bg-black border-gray w-1/3" FilterClassName="border-1 border-[#585858]" structureClassName="justify-between" />
            <div className="mt-4">

                <AdminTable
                    headers={["Lottery Id", "Lottery Name", "Entries", "Total Balance", "Time Remaining"]}
                    data={lotteryData}
                    lastColumnType="history"
                    

                />

                <AddMoreLotteries />
            </div>
        </>
    );
}

export default ActivePage;

