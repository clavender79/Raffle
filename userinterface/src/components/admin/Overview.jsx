"use client"

import AdminTable from "./AdminTable";
import { TrendingUp } from "lucide-react"
import UserTicketsSoldGraph from "./UserTicketsSoldGraph";
import useWalletStore from "@/lib/useWalletStore";
import { formatRemainingTime } from "@/lib/utils";
import {useState,useEffect} from "react"

const activeLotteryData = [
  { "Lottery Id": "L011", "Lottery Name": "Spring Raffle", Entries: 160, "Total Balance": "2.7 ETH", "Time Remaining": "1d 8h", Status: "Open" },
  { "Lottery Id": "L012", "Lottery Name": "Summer Draw", Entries: 90, "Total Balance": "1.6 ETH", "Time Remaining": "15h 20m", Status: "Open" },
  { "Lottery Id": "L013", "Lottery Name": "Fall Jackpot", Entries: 245, "Total Balance": "4.2 ETH", "Time Remaining": "2d 5h", Status: "Open" },
  { "Lottery Id": "L014", "Lottery Name": "Winter Spin", Entries: 110, "Total Balance": "1.8 ETH", "Time Remaining": "8h 10m", Status: "Closed" },
  { "Lottery Id": "L015", "Lottery Name": "Year-End Draw", Entries: 80, "Total Balance": "1.4 ETH", "Time Remaining": "3d 12h", Status: "Open" },
];


const Overview = () => {
  const lottery = {
    "Active": 12,
    "Players": 1000,
    "Entries": 5000,
    "Total Revenue": 10000
  }

  //Fetch the lottery Data from zustand
    const raffleContracts = useWalletStore(state => state.raffleContracts);
    const openRaffles = raffleContracts?.filter(r => r.is_open);
    const [activeLotteryData, setActiveLotteryData] = useState([]);

    if (!openRaffles || openRaffles.length === 0) {
      return <div>No active lotteries found.</div>;
    }

    useEffect(() => {

      async function fetchActiveLotteries() {
        const activeLotteries = openRaffles.map(r => {
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
            status: r.is_open? "Open" : "CLOSED"
          };
        });

        setActiveLotteryData(activeLotteries);
      }
      fetchActiveLotteries();
      
    }, [raffleContracts]);

    



  return (
    <div className="flex flex-col">

      <div className="flex mb-8 me-8">


        <div className="grid grid-cols-2 gap-4 w-3/6">


          <div className="bg-[#101010] border border-[#4C4C4C] rounded-lg px-4 py-2 text-center flex flex-col items-start justify-between h-40 gap-4" style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }}>

            <p className="text-[#DADADA99] text-2xl mb-1">Active</p>
            <div className="mb-2">

              <p className="text-white text-5xl font-medium text-start">{lottery.Active}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">

                <p className="border-[#40FF4D] bg-[#00990A] rounded-xl flex items-center gap-2 px-3 py-1"> +2.2%
                  <TrendingUp size={20} />  </p>
                <p className="text-[#FFFFFF99]">In November</p>
              </div>
            </div>
          </div>

          <div className="bg-[#101010] border border-[#4C4C4C]  rounded-lg px-4 h-40 py-2 text-center flex flex-col items-start justify-between " style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }}>
            <p className="text-[#DADADA99] mb-1 text-2xl">Players</p>
            <div className="mb-2">

              <p className="text-white text-5xl font-medium text-start">{lottery.Players}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">

                <p className="border-[#40FF4D] bg-[#00990A] rounded-xl flex items-center gap-2 px-3 py-1"> +2.2%
                  <TrendingUp size={20} />  </p>
                <p className="text-[#FFFFFF99]">In November</p>
              </div>
            </div>
          </div>

          <div className="bg-[#101010] border border-[#4C4C4C] rounded-lg px-4 h-40 py-2 text-center flex flex-col items-start justify-between" style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }} >
            <p className="text-[#DADADA99]  mb-1 text-2xl">Entries</p>
            <div className="mb-2">

              <p className="text-white text-5xl font-medium text-start">{lottery.Entries}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">

                <p className="border-[#40FF4D] bg-[#00990A] rounded-xl flex items-center gap-2 px-3 py-1"> +2.2%
                  <TrendingUp size={20} />  </p>
                <p className="text-[#FFFFFF99]">In November</p>
              </div>
            </div>
          </div>

          <div className="bg-[#101010] border border-[#4C4C4C]  rounded-lg px-4 h-40 py-2  text-center flex flex-col items-start justify-between " style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }}>
            <p className="text-[#DADADA99]  mb-1 text-2xl">Total Revenue</p>
            <div className="mb-2">

              <p className="text-white text-5xl font-medium text-start">{lottery["Total Revenue"]}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">

                <p className="border-[#40FF4D] bg-[#00990A] rounded-xl flex items-center gap-2 px-3 py-1"> +2.2%
                  <TrendingUp size={20} />  </p>
                <p className="text-[#FFFFFF99]">In November</p>
              </div>
            </div>
          </div>
        </div>

        <UserTicketsSoldGraph />




      </div>



      <div>
        <p className="mb-4 text-2xl">Active Lotteries</p>

        <AdminTable headers={["Lottery Id", "Lottery Name", "Entries", "Total Balance", "Time Remaining", "Status"]} data={activeLotteryData} lastColumnType="status"></AdminTable>
      </div>





    </div>
  );
}

export default Overview;


