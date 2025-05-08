import { ethers } from "ethers"
import { abi, contractAddress } from "../contractData.js"

export const fetchWinnerHistory = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, abi, provider)

    const filter = contract.filters.WinnerPicked(null) // Optional: pass nulls if needed for indexed args

    // You can narrow it down to a range like fromBlock: 0 or "latest" etc
    const logs = await contract.queryFilter(filter, 0, "latest")

    console.log("Logs", logs);

    const history = logs.map((log) => {
      const winner = log.args[0];
      const amount = log.args[1];
      const timestamp = log.args[2];

      console.log("Winner: ", winner)
      console.log("Amount: ", amount)
      console.log("Timestamp: ", timestamp)

      return {
        winner,
        amount: Number(ethers.formatEther(amount)), // Convert BigNumber to float
        date: new Date(Number(timestamp) * 1000).toISOString().split("T")[0] // Format to YYYY-MM-DD
      }
    })

    return history
  } catch (error) {
    console.error("Error fetching winner history:", error)
    return []
  }
}
