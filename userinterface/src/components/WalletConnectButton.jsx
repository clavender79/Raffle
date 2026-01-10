"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import useWalletStore from "../lib/useWalletStore";
import { useWalletAuth } from "../lib/auth"; // Import the custom hook for wallet authentication
import { useRouter } from "next/navigation";
import { toast } from "sonner";



export default function WalletConnectButton({ className = "", type = "" }) {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdmin, updateWallet } = useWalletStore();

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending, pendingConnector, error } = useConnect();
  const router = useRouter();
  const { login, logout, supabase } = useWalletAuth(); // Use the custom hook for 
  // wallet authentication

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleDisconnect = async () => {
    try {
      disconnect();
      await logout();
      updateWallet({ isConnected: false, isAdmin: false, address: null });
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  const handleConnect = async () => {

    const metaMaskConnector = connectors.find((c) => c.id === "metaMaskSDK");
    if (!metaMaskConnector) {
      console.error("MetaMask connector not found");
      return;
    }
    try {
      connect(
        { connector: metaMaskConnector },
        {
          onSuccess: async (data) => {
            const walletAddress = data.accounts[0];
            console.log("Connected wallet:", walletAddress);
            const token = await login(walletAddress);
            
            if (!token) {
              console.error("Login failed, no token received");
              return;
            }
            else {
              console.log("Login successful, token received:", token);
              toast.success("Login successful!");
              if (isAdmin) {
                // If the user is an admin, redirect to the admin dashboard
                router.push("/admin/overview");
              } 
            }
            console.log("Connection and login successful");
          },
        }
      );
    } catch (error) {
      console.error("Connect failed:", error);
    }
  };



  if (!isMounted) return <div style={{ height: "42px" }} />;


  if (isConnected) {
    return (
      <button
        onClick={handleDisconnect}
        className={`px-4 py-2 bg-white text-black rounded-full ${className}`}
      >
        Disconnect ({address.slice(0, 6)}...{address.slice(-4)})
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      type={type}
      disabled={isPending}
      className={`px-4 py-2 bg-white text-black rounded-full ${className} ${isPending ? "opacity-50" : ""
        }`}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}