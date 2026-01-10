"use client"

import { useState, useEffect } from "react"
import LotteryBanner from "@/components/LotteryBanner"
import LotteryCard from "@/components/LotteryCard"
import LotterySearchFilter from "@/components/LotterySearchFilter"
import BuyTicketPopup from "@/components/BuyTicketsPopup"
import LotteryHistoryUser from "@/components/LotteryHistoryUser"
import useWalletStore from "@/lib/useWalletStore"

// Mock data
const mockLotteries = [
  {
    id: "457",
    name: "Community Fox",
    prizePot: 3.17,
    players: 70,
    fees: 0.005,
    chain: "Ethereum",
    timeRemaining: "45:24:32",
    lastWinner: "-",
    color: "blue",
  },
  {
    id: "458",
    name: "Community Tiger",
    prizePot: 3.17,
    players: 85,
    fees: 0.005,
    chain: "Ethereum",
    timeRemaining: "32:15:45",
    lastWinner: "-",
    color: "orange",
  },
  {
    id: "459",
    name: "Community Wolf",
    prizePot: 3.17,
    players: 92,
    fees: 0.005,
    chain: "Ethereum",
    timeRemaining: "28:45:12",
    lastWinner: "-",
    color: "green",
  },
  {
    id: "460",
    name: "Community Bear",
    prizePot: 3.17,
    players: 65,
    fees: 0.005,
    chain: "Ethereum",
    timeRemaining: "41:30:20",
    lastWinner: "-",
    color: "red",
  },
  {
    id: "461",
    name: "Community Eagle",
    prizePot: 3.17,
    players: 78,
    fees: 0.005,
    chain: "Ethereum",
    timeRemaining: "35:22:18",
    lastWinner: "-",
    color: "purple",
  },
  {
    id: "462",
    name: "Community Lion",
    prizePot: 3.17,
    players: 88,
    fees: 0.005,
    chain: "Ethereum",
    timeRemaining: "29:15:33",
    lastWinner: "-",
    color: "pink",
  },


]

const selectedLotteryData = {
  id: "785",
  name: "Community Fox",
  players: 35,
  totalBalance: 3.7,
  fees: 0.002,
  winPrediction: 65,
  endTime: new Date(Date.now() + 45 * 60 * 60 * 1000 + 35 * 60 * 1000 + 7 * 1000), // 45h 35m 7s from now
}

export default function LotteryPage() {
  const [selectedLottery, setSelectedLottery] = useState(selectedLotteryData)
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleLotteries, setVisibleLotteries] = useState(6)

  const [isBuyPopupOpen, setIsBuyPopupOpen] = useState(false);
  const [isHistoryPopupOpen, setIsHistoryPopupOpen] = useState(false);
  // const [lotteries,setLotteries]=useState(mockLotteries);
  const { raffleContracts } = useWalletStore()
  const [lotteries,setLotteries] = useState(raffleContracts)



  useEffect(() => {

    

    const updatedLotteries = raffleContracts.map((contract) =>{ 

      const lastOpened = new Date(contract.last_opened_at).getTime();
      const intervalMs = contract.time_interval * 1000;
      const now = Date.now();

      const remainingMs = Math.max(lastOpened + intervalMs - now, 0);
      const isExpired = remainingMs <= 0;

      return {
        id: String(contract.raffle_id),
        name: contract.name,
        prizePot: contract.ticket_price * contract.total_entries,
        players: contract.players,
        fees: contract.ticket_price,
        chain: contract.chain,
        timeRemaining: remainingMs,
        lastWinner: contract.recent_winner,
        color: "blue",
        totalEntries: contract.total_entries,
        open: contract.is_open && !isExpired, // Mark as closed if time expired
        address: contract.address,
      };
    });

    setLotteries(updatedLotteries);
    if (updatedLotteries.length > 0) {
    handleLotteryClick(updatedLotteries[0]);
  }
    console.log("Updated lotteries:", updatedLotteries[0]);

    console.log("Updated raffleContracts:", raffleContracts);
  }, [raffleContracts]);




  const handleOpenBuyPopup = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsBuyPopupOpen(true), 500);

  };

  const handleCloseBuyPopup = () => {
    setIsBuyPopupOpen(false);
  };
  const handleOpenHistoryPopup = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsHistoryPopupOpen(true), 500); // Adjust delay to match scroll duration
    ;
  };
  const handleCloseHistoryPopup = () => {
    setIsHistoryPopupOpen(false);
  };

  const filteredLotteries = lotteries.filter(
    (lottery) => lottery.name.toLowerCase().includes(searchTerm.toLowerCase()) || lottery.id.includes(searchTerm)
  )

  const handleLotteryClick = (lottery) => {
    // Convert lottery card data to banner format
    
    // Check if lottery time has expired
    const isExpired = lottery.timeRemaining <= 0;
    
    const bannerData = {
      id: lottery.id,
      name: lottery.name,
      players: lottery.players,
      totalBalance: lottery.prizePot,
      fees: lottery.fees,
      winPrediction: (1 / lottery.totalEntries).toFixed(2),
      endTime: new Date(Date.now() + lottery.timeRemaining),
      open: lottery.open && !isExpired, // Mark as closed if time expired
      address: lottery.address,
      contractAddress: lottery.address,
    }
    setSelectedLottery(bannerData)
  }

  const loadMore = () => {
    setVisibleLotteries((prev) => prev + 6)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Banner Section */}
        <div className="mb-12">
          <LotteryBanner lottery={selectedLottery} handleCloseBuyPopup={handleCloseBuyPopup}
            handleOpenBuyPopup={handleOpenBuyPopup} />
          {isBuyPopupOpen ? <BuyTicketPopup onClose={handleCloseBuyPopup} lottery={selectedLottery} /> : null
          }

        </div>

        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-8 mx-20">

          <h1 className="text-2xl font-bold text-white">All Lotteries</h1>
          <LotterySearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => console.log("Filter clicked")}
            className="text-[#585858]  bg-[#FFFFFF] border-white"
            inputClassName="bg-white/10 border-white/20 "
            FilterClassName="text-[#585858]  bg-[#FFFFFF] border-white"
          />
        </div>

        {/* Lottery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mx-20">
          {filteredLotteries.slice(0, visibleLotteries).map((lottery) => (
            <LotteryCard  key={lottery.id} lottery={lottery} onClick={handleLotteryClick} handleOpenHistoryPopup={handleOpenHistoryPopup} handleOpenBuyPopup={handleOpenBuyPopup} />
          ))}

          {isHistoryPopupOpen ? <LotteryHistoryUser handleCloseHistoryPopup={handleCloseHistoryPopup} lottery={selectedLottery.id} /> : null}
        </div>

        {/* Load More Button */}
        {visibleLotteries < filteredLotteries.length && (
          <div className="text-center">
            <button onClick={loadMore} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
