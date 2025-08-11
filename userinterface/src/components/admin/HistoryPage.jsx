"use client"
import LotterySearchFilter from "../LotterySearchFilter";
import AdminTable from "./AdminTable";
import AddMoreLotteries from "./AddMoreLotteries";
import useWalletStore from "@/lib/useWalletStore";
import { formatRemainingTime } from "@/lib/utils";
import { useEffect,useState } from "react";
import { getLotteryHistoryAndRaffleDetails } from "@/lib/dbUtils";


const HistoryPage = () => {

     const [completedLotteryData, setCompletedLotteryData] = useState([]);

    // useEffect to fetch the data
    useEffect(() => {
        const fetchData = async () => {
           const LotteryData = await getLotteryHistoryAndRaffleDetails();
           setCompletedLotteryData(LotteryData)
            console.log("Lottery Data History Page:", completedLotteryData)
        }

        fetchData();
    }, []);

    

    return (
        <>
            <LotterySearchFilter className="text-[#585858] bg-black border-gray w-1/3" FilterClassName="border-1 border-[#585858]" structureClassName="justify-between" />
            <div className="mt-4">

                <AdminTable
                    headers={["Lottery Id", "Lottery Name", "Winner", "Prize", "Time", "Status",]}
                    lastColumnType="status"
                    data={completedLotteryData}
                    tbodyClassName="scroll-smooth overflow-y-auto max-h-60 scrollbar-dark"
                    tablepaddingX="px-4"
                />

                <AddMoreLotteries />
            </div>
        </>
    );
}

export default HistoryPage;
