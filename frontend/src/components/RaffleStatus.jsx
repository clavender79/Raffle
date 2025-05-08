"use client"

import { useState } from "react"

const RaffleStatus = ({ status, onEnterRaffle }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionMessage, setTransactionMessage] = useState("")

  const handleEnterRaffle = async () => {
    setIsProcessing(true)
    setTransactionMessage("Processing transaction...")

    try {
      await onEnterRaffle()
      setTransactionMessage("Successfully entered the raffle!")
    } catch (error) {
      setTransactionMessage(`Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
      // Clear message after 5 seconds
      setTimeout(() => {
        setTransactionMessage("")
      }, 5000)
    }
  }

  return (
    <div className="raffle-status-card">
      <h2>
        Raffle Status: <span className={`status-${status.toLowerCase()}`}>{status}</span>
      </h2>

      <button
        className="enter-raffle-btn"
        onClick={handleEnterRaffle}
        disabled={isProcessing || status.toLowerCase() !== "open"}
      >
        {isProcessing ? "Processing..." : "Enter Raffle"}
      </button>

      {transactionMessage && <p className="transaction-message">{transactionMessage}</p>}

      <p className="transaction-note">*Real-time transaction feedback and error messages will be displayed here.</p>
    </div>
  )
}

export default RaffleStatus
