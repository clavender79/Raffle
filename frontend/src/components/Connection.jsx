import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../contractData.js';
import { contractAddress } from '../contractData.js';

const Connection = () => {
    const [connection, setConnection] = useState(null);
    const [error, setError] = useState(null);
    const [entranceFee, setEntranceFee] = useState(0);
    const [contract,SetContract]=useState(null);
   
    

    const enterRaffle = async (amount) => {


        try {
            console.log("Entering the raffle");
            const tx = await contract.enterRaffle({ value: ethers.parseEther(amount) });
            console.log("Transaction Hash: ", tx.hash);
            await tx.wait(1);
            console.log("Transaction Confirmed");
        } catch (err) {
            console.error("Transaction Failed", err);
            setError(err.message);
        }

    }

    const getEntranceFee = async () => {
        const allAttributes = await contract.getAllRaffleAttributes();
        console.log(" All : ", allAttributes);
        console.log("typeof Entrance Fee: ", typeof allAttributes[0]);
        setEntranceFee(allAttributes[0]);
    }

    const handleConnect = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                setConnection(accounts[0]);
                console.log("HELLO")
                const contract = new ethers.Contract(contractAddress, abi, signer);
                SetContract(contract);

                getEntranceFee();
                console.log(entranceFee)


            } catch (err) {
                setError(err.message);
            }
        }
        else {
            setError("Please install MetaMask");

        }
    }
    return (
        <div>

            <h1>Connect to MetaMask</h1>
            <button onClick={handleConnect}>Connect</button>
            {connection && <p>Connected: {connection}</p>}

        </div>
    );



}



export default Connection;
