
"use client";


import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminTable from "@/components/admin/AdminTable";
import AddMoreLotteries from "@/components/admin/AddMoreLotteries";
import { getLotteryHistoryById } from "@/lib/dbUtils";

export default function LotteryHistoryPage() {
    const params = useParams();
    const { id } = params; // Extract the lottery ID from the URL
    const [historyData, setHistoryData] = useState(null);



    useEffect(() => {
        const fetchData = async () => {
            const LotteryData = await getLotteryHistoryById(Number(id))

            setHistoryData(LotteryData);
            console.log("Matched Items:", LotteryData); // log here, not after setState

        }

        fetchData();
    }, [id]);



    if (!historyData) return <div className="p-4">Loading history...</div>;



    return (
        <div>
            <p className="mb-4">{`Active Lotteries > ${id} `} </p>


            <div className="mt-4">

                <AdminTable
                    headers={["Winner", "Prize", "Time", ]}
                    data={historyData}

                />

                <AddMoreLotteries />
            </div>
        </div>
    );
}









