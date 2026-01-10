
import CryptoIcon from "./CryptoIcon"
import LotteryTimer from "./LotteryTimer"
import Image from "next/image";
import BuyYourTicketsButton from "./BuyYourTicketsButton";

export default function LotteryBanner({ lottery, handleCloseBuyPopup, handleOpenBuyPopup }) {
    return (
        <div
            className="relative h-[75vh] w-[97vw] flex items-center justify-center rounded-4xl  mt-2"
        >
            <Image
                src="/lotterypanel.svg"
                alt="RaffleRun Background"
                sizes="100vw"
                fill
                className="object-cover rounded-4xl  "
            />
            {/* Decorative Coins */}
           
            <CryptoIcon
                type="btc"
                width={80}
                height={80}
                className="absolute top-40 right-40 opacity-80"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
            <CryptoIcon
                type="btc"
                width={100}
                height={100}
                className="absolute top-16 left-[-2vh] rotate-120"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
            <CryptoIcon
                type="eth"
                width={60}
                height={60}
                className="absolute bottom-38 left-80 opacity-50"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
             <CryptoIcon
                type="eth"
                width={60}
                height={60}
                className="absolute bottom-34 left-76 opacity-40"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
             <CryptoIcon
                type="ethLogo"
                width={120}
                height={120}
                className="absolute bottom-30 right-95 rotate-[270deg] opacity-60"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />


            {/* Main Content */}
            <div className="absolute inset-0 flex justify-between p-8">
                {/* Top Section */}
                <div className="flex justify-between items-start self-center ms-12">
                    <div>
                        <div className="text-white/80 text-md mb-1 font-semibold">LotteryId</div>
                        <div className="text-white text-5xl font-bold mb-2">#{lottery.id}</div>
                        <div className="text-white/80 text-md mb-1 font-semibold">Lottery name</div>
                        <div className="text-white text-5xl font-semibold mb-4">{lottery.name}</div>
                        <BuyYourTicketsButton onClick={handleOpenBuyPopup} activeParam={lottery.open} />
                        
                    </div>


                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 w-1/3 mt-6 h-3/4">


                    <div className="bg-[#38B4FF]/30  rounded-lg px-4 py-8 text-center flex flex-col items-start justify-between " style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }}>
                        <p className="text-white/80  text-2xl mb-1">Players</p>
                        <p className="text-white text-2xl font-medium">{lottery.players}</p>
                    </div>

                    <div className="bg-[#8CD0FF]/40  rounded-lg px-4 py-8 text-center flex flex-col items-start justify-between " style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }}>
                        <p className="text-white/80  mb-1 text-2xl">Total Balance</p>
                        <p className="text-white text-2xl font-medium">{lottery.totalBalance} ETH</p>
                    </div>

                    <div className="bg-[#1279BF]/30  rounded-lg px-4 py-8  text-center flex flex-col items-start justify-between" style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }} >
                        <p className="text-white/80  mb-1 text-2xl">Fees</p>
                        <p className="text-white text-2xl font-medium">{lottery.fees} ETH</p>
                    </div>

                    <div className="bg-[#8CD0FF]/40  rounded-lg px-4 py-8  text-center flex flex-col items-start justify-between " style={{ "boxShadow": "0px 4px 10px rgba(0, 0, 0, 0.25)" }}>
                        <p className="text-white/80  mb-1 text-2xl">Win Prediction</p>
                        <p className="text-white text-2xl font-medium">{lottery.winPrediction}%</p>
                    </div>,

                    <div className="absolute bottom-[5vh] right-15">

                        {/* Timer */}
                        <LotteryTimer endTime={lottery.endTime} />
                    </div>

                </div>


            </div>



        </div>
    )
}
