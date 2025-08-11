"use client"
import { toast } from "sonner";
import { useAccount } from "wagmi";



const BuyYourTicketsButton = ({ onClick, className="", activeParam=true }) => {
    const { isConnected } = useAccount();

    if(!isConnected){
       onClick = () => toast.error("Please connect your wallet to buy tickets.");
    }

    return (<>
      
        <button onClick={onClick} title={!activeParam ? "Raffle is closed" : ""} className={`mt-6 px-6 py-3 bg-gradient-to-r from-[#ffffffeb] via-[#73C5FF] to-[#73C5FF] text-black rounded-full ${className}  ${!activeParam ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!activeParam} >
             {activeParam ? "Buy your Tickets" : "Lottery Closed"}
          </button>
    </>
    );
    
}

export default BuyYourTicketsButton;
