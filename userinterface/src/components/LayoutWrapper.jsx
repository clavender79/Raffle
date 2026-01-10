// src/app/LayoutWrapper.jsx
"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import useWalletStore from "../lib/useWalletStore";
import NavigationBar from "@/components/NavigationBar";
import AdminSidebar from "@/components/admin/Sidebar";
import Footer from "@/components/Footer";
import RaffleEventListener from "@/lib/eventListeners";
import  supabase  from "@/lib/supabase";

export default function LayoutWrapper({ children }) {
  const { address, isConnected } = useAccount();

  const { isAdmin, updateWallet,raffle } = useWalletStore();

  const fetchRaffleContracts = useWalletStore(state => state.fetchRaffleContracts);

useEffect(() => {
  const channel = supabase
    .channel("raffle-contracts-listener")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "raffles" },
      (payload) => {
        console.log("Raffle contracts updated:", payload);
        fetchRaffleContracts();
      }
    )
    .subscribe();

  // Initial fetch
  fetchRaffleContracts();

  return () => {
    supabase.removeChannel(channel);
  };
}, [fetchRaffleContracts]);

  useEffect(() => {
    if (!isConnected || !address) {
      useWalletStore.getState().clearTokens();
    }
  }, [isConnected, address]);



  return (
    <>
      <RaffleEventListener />
      {!isAdmin ? (
        <>
          <NavigationBar
            className="custom-gradient border-0 rounded-4xl"
            navFirstOption="Lotteries"
            navSecondOption="Community"
            navThirdOption="About Us"
          />
          {children}
          <Footer />
        </>
      ) : (

        <>
          <NavigationBar
            className=" "
            navFirstOption="Overview"
            navSecondOption="Active"
            navThirdOption="History"
            path="/admin"
          />

          <div className="flex p-4">

            <AdminSidebar />

            <div className="py-6 ps-16 pe-4 flex-1">

              {children}
            </div>
          </div>

        </>

      )}
    </>
  );
}