"use client";

import { useAccount } from "wagmi";
import { toast } from "sonner";

import { useState } from "react";
const colorClasses = {
  blue: {
    header: "bg-gradient-to-b from-[#1E40AF] to-[#3B82F6]", 
    body: "bg-gradient-to-b from-[#1E3A8A] to-[#2563EB]", 
    buyButtonGradient: {
      background: "linear-gradient(91deg, #1E3A8A -43.8%, #2563EB 22.19%, #1D4ED8 99.18%)"
    }
  },
  orange: {
    header: "bg-gradient-to-b from-[#B45309] to-[#F59E0B]", 
    body: "bg-gradient-to-b from-[#78350F] to-[#D97706]", 
    buyButtonGradient: {
      background: "linear-gradient(91deg, #78350F -43.8%, #D97706 22.19%, #B45309 99.18%)"
    }
  },
  green: {
    header: "bg-gradient-to-b from-[#065F46] to-[#10B981]", 
    body: "bg-gradient-to-b from-[#064E3B] to-[#059669]", 
    buyButtonGradient: {
      background: "linear-gradient(91deg, #064E3B -43.8%, #059669 22.19%, #047857 99.18%)"
    }
  },
  red: {
    header: "bg-gradient-to-b from-[#7F1D1D] to-[#EF4444]", 
    body: "bg-gradient-to-b from-[#991B1B] to-[#DC2626]", 
    buyButtonGradient: {
      background: "linear-gradient(91deg, #7F1D1D -43.8%, #DC2626 22.19%, #B91C1C 99.18%)"
    }
  },
  purple: {
    header: "bg-gradient-to-b from-[#4C1D95] to-[#8B5CF6]", 
    body: "bg-gradient-to-b from-[#5B21B6] to-[#7C3AED]", 
    buyButtonGradient: {
      background: "linear-gradient(91deg, #4C1D95 -43.8%, #7C3AED 22.19%, #5B21B6 99.18%)"
    }
  },
  pink: {
    header: "bg-gradient-to-b from-[#831843] to-[#EC4899]", 
    body: "bg-gradient-to-b from-[#9D174D] to-[#DB2777]", 
    buyButtonGradient: {
      background: "linear-gradient(91deg, #831843 -43.8%, #DB2777 22.19%, #9D174D 99.18%)"
    }
  }
,
  StyleButton: {
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
    borderRadius: "50px"
  },
  Images: {
    1: { src: "/lotteryCards/boxWithCoupons.svg", alt: "box with coupons" },
    2: { src: "/lotteryCards/coinsBox.svg", alt: "coins box" },
    3: { src: "/lotteryCards/coupons.svg", alt: "coupons" },
    4: { src: "/giftBoxImage.svg", alt: "gift box" },
    5: { src: "/lotteryCards/walletWithCoins.svg", alt: "wallet with coins" }
  }
};


export default function LotteryCard({ lottery, onClick, handleOpenHistoryPopup, handleOpenBuyPopup }) {

  const { isConnected } = useAccount();
  if(!isConnected){
     window.scrollTo({ top: 0, behavior: "smooth" });
       handleOpenBuyPopup = () => toast.error("Please connect your wallet to buy tickets.");
    }
  
  const [randomImage] = useState(() => {
    const keys = Object.keys(colorClasses.Images);
    const randomKey = keys[1];
    return colorClasses.Images[randomKey];
  });

  const { header, body, buyButtonGradient } = colorClasses[lottery.color] || colorClasses.blue;
  const buttonStyle = colorClasses.StyleButton;

  return (
    <div
      className={`bg-gradient-to-br ${body} rounded-4xl  text-white cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-lg `}
      onClick={() => onClick(lottery)}
    >
      {/* Header */}
      <div className={`flex justify-between items-center mb-4 ${header} rounded-4xl relative w-full p-4`}>

        <div className="flex flex-col items-start justify-center">

          <div className=" flex rounded-full px-3 py-1 text-md gap-1 items-center"><img src="/lotteryCards/Stats/prizePot.svg" alt="Lottery Id" className="h-5" /> Prize Pot</div>

          <div className="text-right px-3 py-1">
            <p className="text-6xl font-semibold ">{lottery.prizePot}<sub className="text-sm align-sub relative bottom-3 right-0">ETH</sub></p>
          </div>

        </div>

        {/* Decorative Image */}
        <div className="flex justify-center mb-4">
          <img src={randomImage.src} alt={randomImage.alt} className="w-30 h-30 object-contain" />
        </div>


        {/* Check History button */}
        <div className="text-center mb-4 absolute bottom-[-4vh] right-5">
          <button
            className="text-white hover:bg-white/20 text-xs px-4 py-1 rounded-full border-1 border-white"
            style={buttonStyle}
            onClick={  handleOpenHistoryPopup }
          >
            Check history
          </button>
        </div>


      </div>



      {/* Details */}
      <div className={`space-y-2 text-sm {$body} p-4`}>
        <div className="flex justify-between">
          <span className="opacity-80 flex gap-1 "><img src="/lotteryCards/Stats/lotteryId.svg" alt="Lottery Id" className="h-5" />  LotteryId</span>
          <span className="font-semibold ">{`#${lottery.id}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80 flex gap-1"><img src="/lotteryCards/Stats/lotteryName.svg" alt="Lottery Name" className="h-5" /> LotteryName</span>
          <span className="font-semibold">{lottery.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80 flex gap-1"><img src="/lotteryCards/Stats/players.svg" alt="players" className="h-5" />  Players</span>
          <span className="font-semibold">{lottery.players}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80 flex items-center gap-1"><img src="/lotteryCards/Stats/fees.svg" alt="Fees" className="h-5" />  Fees</span>
          <span className="font-semibold">{lottery.fees} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80 flex gap-1"><img src="/lotteryCards/Stats/chains.svg" alt="chain" className="h-5" />  Chain</span>
          <span className="font-semibold">{lottery.chain}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80 flex gap-1"><img src="/lotteryCards/Stats/timer.svg" alt="time remaining" className="h-5" />  Time Remaining</span>
          <span className="font-semibold">{lottery.timeRemaining}</span>
        </div>

        

      </div>

      {/* Buy Tickets button */}
      <div className="flex justify-center "
      title={!lottery.open ? "Raffle is closed" : ""}>
        <button
          className={`w-14/15 my-4 px-10 py-3 text-black rounded-full ${buyButtonGradient} ${!lottery.open ? "opacity-50 cursor-not-allowed " : ""}`}
          style={{ ...buttonStyle, ...buyButtonGradient }}
          onClick={handleOpenBuyPopup}
          disabled={!lottery.open}
        >
          {lottery.open ? "Buy Tickets" : "Closed"}
         
        </button>

      </div>
    </div>
  );
}