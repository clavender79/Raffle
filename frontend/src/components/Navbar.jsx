"use client"
import { Link } from "react-router-dom"
import { Moon, Sun } from "lucide-react"

const Navbar = ({ isConnected, account, connectWallet, darkMode, setDarkMode }) => {
  // Truncate address for display
  const truncateAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h1>CryptoRaffleDApp</h1>
        </Link>
      </div>
      <div className="navbar-actions">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="connect-wallet-btn" onClick={connectWallet}>
          {isConnected ? truncateAddress(account) : "Connect Wallet"}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
