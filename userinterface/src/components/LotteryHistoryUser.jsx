"use client"

import { useState, useEffect } from "react";
import { getLotteryHistoryById } from "@/lib/dbUtils";

const LotteryHistoryUser = ({ handleCloseHistoryPopup, lottery }) => {

    const defaultData = [
        { lotteryId: '#789', winner: '0x0268F79341CB1534', prize: '3 ETH', timestamp: 'June 25, 2025', status: 'Active' },
        { lotteryId: '#456', winner: '0x0268F79341CB1534', prize: '1.5 ETH', timestamp: 'June 20, 2025', status: 'Completed' },
        { lotteryId: '#456', winner: '0x0268F79341CB1534', prize: '1.5 ETH', timestamp: 'June 20, 2025', status: 'Completed' },
    ];

    const [historyData, setHistoryData] = useState(defaultData);

    useEffect(() => {

        async function fetchHistory() {
            console.log("Lottery Id: ", lottery);
            const history = await getLotteryHistoryById(Number(lottery))
            console.log("History Data:", history);
            setHistoryData(history);
        }

        fetchHistory();
    }, []);




    return (

        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-50 top-[-50]">

            <div className={` p-8 relative flex flex-col`} style={{
                background: "linear-gradient(146deg, #FFF -8.79%, #73C5FF 19.56%, #0067A2 56.73%)",
                boxShadow: " 0 4px 10px 0 rgba(0, 0, 0, 0.25)"
            }}>

                <button className="rounded-3xl border-1 border-white bg-transparent text-white w-20 p-2 mb-4" onClick={handleCloseHistoryPopup}>Go back</button>

                <div className="flex  items-center  mt-6 mb-4 justify-between">

                    <p className="text-4xl tracking-wide font-md">Lottery History</p>
                    <p className="text-4xl tracking-wide font-md">#{lottery}</p>
                </div>

                <div>
                    {historyData.length === 0 ? (
                        <p className="w-full">No history available</p>
                    ) : (
                        historyData.map((row, index) => (
                            <div
                                key={index}
                                className="bg-white text-[#000000] bg-opacity-80 rounded-2xl p-2 mt-4 w-full shadow-lg backdrop-blur-sm mb-4 flex"
                                style={{
                                    boxShadow:
                                        "0 4px 10px 0 rgba(0, 0, 0, 0.25) inset, 0 4px 10px 0 rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <div className="flex flex-col me-12 gap-2">
                                    <p className="text-[#00000099]">Winner</p>
                                    <p>{row.winner}</p>
                                </div>

                                <div className="flex flex-col me-8 gap-2">
                                    <p className="text-[#00000099]">Prize</p>
                                    <p>{row.prize}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <p className="text-[#00000099]">Date</p>
                                    <p>{row.timestamp}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>


    );
}

export default LotteryHistoryUser;
