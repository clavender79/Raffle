"use client"

import { useState } from "react"
import LotteryBanner from "@/components/LotteryBanner"
import LotteryCard from "@/components/LotteryCard"
import LotterySearchFilter from "@/components/LotterySearchFilter"

// Mock data
const mockLotteries = [
  {
    id: "457",
    name: "Community Fox",
    prizePot: 3.15,
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
    prizePot: 3.15,
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
    prizePot: 3.15,
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
    prizePot: 3.15,
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
    prizePot: 3.15,
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
    prizePot: 3.15,
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

  const filteredLotteries = mockLotteries.filter(
    (lottery) => lottery.name.toLowerCase().includes(searchTerm.toLowerCase()) || lottery.id.includes(searchTerm)
  )

  const handleLotteryClick = (lottery) => {
    // Convert lottery card data to banner format
    const bannerData = {
      id: lottery.id,
      name: lottery.name,
      players: lottery.players,
      totalBalance: lottery.prizePot,
      fees: lottery.fees,
      winPrediction: Math.floor(Math.random() * 40) + 50, // Random prediction between 50-90%
      endTime: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000), // Random time up to 48 hours
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
          <LotteryBanner lottery={selectedLottery} />
        </div>

        {/* Search and Filter */}
        <LotterySearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterClick={() => console.log("Filter clicked")}
        />

        {/* Lottery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredLotteries.slice(0, visibleLotteries).map((lottery) => (
            <LotteryCard key={lottery.id} lottery={lottery} onClick={handleLotteryClick} />
          ))}
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
