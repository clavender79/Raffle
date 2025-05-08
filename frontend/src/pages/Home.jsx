"use client"

import { useState, useEffect } from "react"
import RaffleDetails from "../components/RaffleDetails"
import RaffleStatus from "../components/RaffleStatus"
import RaffleHistory from "../components/RaffleHistory"
import CountdownTimer from "../components/CountdownTimer"
import { ethers } from "ethers"
import { contractAddress, abi } from "../contractData.js"
import { fetchWinnerHistory } from "../utils/fetchWinnerHistory.js"


// Mock data - in a real app, this would come from your smart contract


const mockData = {
  entranceFee: 0.1,
  players: 128,
  contractBalance: 12.8,
  lastWinner: "0xA3B4...8F9D",
  status: "Open",
  endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  history: [
    { date: "2023-04-15", winner: "0xA3B4...8F9D", amount: 10.5 },
    { date: "2023-04-08", winner: "0xC4D5...7E8F", amount: 8.2 },
    { date: "2023-04-01", winner: "0xE5F6...9A0B", amount: 9.7 },
  ],
}

const Home = ({ isConnected, account, contract }) => {
  const [raffleData, setRaffleData] = useState(mockData)

  const [history, setHistory] = useState([])

  // 1. Fetch existing history on load
  useEffect(() => {
    const getHistory = async () => {
      console.log("Here in get history")
      const data = await fetchWinnerHistory()
      console.log("Fetched history:", data)
      setHistory(data)
    }

    getHistory()
  }, [isConnected,account])

  // 2. Listen for new WinnerPicked events
  useEffect(() => {
    const setupListener = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)

      const handleWinnerPicked = (winner, amount, timestamp) => {
        const newEntry = {
          winner,
          amount: Number(ethers.formatEther(amount)),
          date: new Date(Number(timestamp) * 1000).toISOString().split("T")[0]
        }

        // Prepend to history list
        setHistory((prevHistory) => [newEntry, ...prevHistory])
      }

      contract.on("WinnerPicked", handleWinnerPicked)

      // Clean up the listener on unmount
      return () => {
        contract.off("WinnerPicked", handleWinnerPicked)
      }
    }

    setupListener()
  }, [])


  // In a real app, you would fetch data from your smart contract here
  useEffect(() => {
    // Simulating data fetch
    const fetchData = async () => {
      if (isConnected && contract) {
        try {

          const provider = new ethers.BrowserProvider(window.ethereum);


          // Fetch data
          console.log("here")
          console.log(contract)
          const players = await contract.getTotalPlayers();
          console.log("players", players)
          console.log("players done")
          const allAttributes = await contract.getAllRaffleAttributes();
          console.log(allAttributes)
          const entranceFee = allAttributes[0];
          const status = allAttributes[6] == 0 ? "Open" : "Closed";

          const contractBalance = await provider.getBalance(contractAddress); // Use provider here
          const lastWinner = await contract.getRecentWinner();
          const endTime = await contract.getTimeLeft();

          console.log("Fetched data:", {
            entranceFee,
            players: players,
            contractBalance: ethers.formatEther(contractBalance),
            lastWinner,
            status,
            endTimeex: Number(endTime),
            endTime: new Date(Date.now() + Number(endTime) * 1000).toISOString(), // fixed timestamp math
            endTimeeee: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          });
          // Update state with fetched data

          setRaffleData({
            entranceFee: ethers.formatEther(entranceFee),
            players: Number(players),
            contractBalance: ethers.formatEther(contractBalance),
            lastWinner,
            status,
            endTime: new Date(Date.now() + Number(endTime) * 1000).toISOString(), // fixed timestamp math
            history: history, // optional
          });
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      } else {
        setRaffleData(mockData); // fallback
      }
    };


    fetchData()

    // Set up an interval to refresh data
    const interval = setInterval(fetchData, 30000) // every 30 seconds

    return () => clearInterval(interval)
  }, [isConnected, contract, account])



  const handleEnterRaffle = async () => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first")
    }
    if (!contract) {
      throw new Error("Contract not found")
    }

    if (raffleData.status !== "Open") {
      throw new Error("Raffle is closed")
    }
    try {
      console.log("Entering the raffle");
      console.log("Entrace Fee : ", ethers.parseEther(raffleData.entranceFee.toString()))
      console.log("account add: ", account)
      const tx = await contract.enterRaffle({ value: ethers.parseEther(raffleData.entranceFee.toString()) });
      console.log("Transaction Hash: ", tx.hash);
      await tx.wait(1);

      setRaffleData((prev) => ({
        ...prev,
        players: prev.players + 1,
        contractBalance: Number(prev.contractBalance) + Number(prev.entranceFee),
      }))
      console.log("Transaction Confirmed");
    } catch (err) {
      console.error("Transaction Failed", err);

    }



  }

  return (
    <div className="home-page">
      <RaffleDetails
        entranceFee={raffleData.entranceFee}
        players={raffleData.players}
        contractBalance={raffleData.contractBalance}
        lastWinner={raffleData.lastWinner}
      />

      <div className="raffle-info-row">
        <RaffleStatus status={raffleData.status} onEnterRaffle={handleEnterRaffle} />
        <CountdownTimer endTime={raffleData.endTime} />
      </div>

      <RaffleHistory history={raffleData.history} />
    </div>
  )
}

export default Home
