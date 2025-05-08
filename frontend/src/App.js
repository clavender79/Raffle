"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import Home from "./pages/Home"
import About from "./pages/About"
import AdminPanel from "./pages/AdminPanel"
import "./App.css"
import { ethers } from "ethers"
import { contractAddress, abi } from "./contractData.js"

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [contract, setContract] = useState(null)

  // Connect wallet and set provider/signer/contract
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()

        const contractInstance = new ethers.Contract(contractAddress, abi, signer)

        setAccount(userAddress)
        setContract(contractInstance)
        setIsConnected(true)
      } catch (error) {
        console.error("Error connecting to wallet:", error)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet!")
    }
  }

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount("")
        setIsConnected(false)
        setContract(null)
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()
        const contractInstance = new ethers.Contract(contractAddress, abi, signer)

        setAccount(userAddress)
        setContract(contractInstance)
        setIsConnected(true)
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  return (
    <Router>
      <div className={`app ${darkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar
          isConnected={isConnected}
          account={account}
          connectWallet={connectWallet}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <div className="content-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home isConnected={isConnected} account={account} contract={contract} />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<AdminPanel isConnected={isConnected} account={account} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
