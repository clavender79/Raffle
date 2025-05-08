"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { contractAddress, abi } from "../contractData.js"


const AdminPanel = ({ isConnected, account }) => {
  const [isOwner, setIsOwner] = useState(true)
  const [contract, setContract] = useState(null)

  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const checkOwner = async () => {

      if (isConnected) {
        console.log("ABI at runtime: ", abi);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setContract(contract);
        const owner = await contract.getOwner();
        console.log("Contract Owner: ");
        console.log("Owner: ", owner)
        console.log("Account: ", account)
        setIsOwner(owner.toLowerCase() === account.toLowerCase());

      }
      else {
        setIsOwner(false);
      }
    };
    checkOwner();


  }, [account, isConnected]);



  const handleGetWinner = async () => {
    try {
      if (!contract || !contract.performUpkeep) {
        console.error("Contract or performUpkeep function not available");
        return;
      }
      else {
        console.log("Contract and performUpkeep function are available");
      }

      setIsProcessing(true);
      console.log("Checking upkeep conditions...");
      
      // Check if upkeep is needed (optional)
      const [upkeepNeeded] = await contract.checkUpkeep("0x");
      console.log("Upkeep Needed: ", upkeepNeeded);

      // Try simulating performUpkeep
      console.log("contract",contract)
      console.log("contract oerfirn",contract.performUpkeep);
      console.log("Simulating performUpkeep...");
      await contract.performUpkeep("0x");

      console.log("Winner Selected")
      const recentWinner = await contract.getRecentWinner();
      console.log("Recent Winner: ", recentWinner);






      setIsProcessing(false);
      alert("Winner picked!");
    } catch (error) {
      console.error("Error in upkeep logic:", error);

      // Check if the error contains a revert reason
      if (error.reason) {
        alert("Revert Reason: " + error.reason);
      } else if (error.error && error.error.message) {
        alert("Detailed Error: " + error.error.message);
      } else {
        alert("Unknown Error: " + error.message);
      }

      setIsProcessing(false);
    }
  };




  if (!isConnected) {
    return (
      <div className="admin-page">
        <h1>Admin Panel</h1>
        <div className="admin-notice">Please connect your wallet to access the admin panel.</div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="admin-page">
        <h1>Admin Panel</h1>
        <div className="admin-notice">Only the contract owner can access the admin panel.</div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>

      <div className="admin-actions">
        <div className="admin-card">
          <h2>Contract Actions</h2>
          <button onClick={handleGetWinner} className="admin-btn">
            Pick Winner
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
