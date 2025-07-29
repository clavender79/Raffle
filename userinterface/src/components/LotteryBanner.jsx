
import CryptoIcon from "./CryptoIcon"
import LotteryTimer from "./LotteryTimer"
import Image from "next/image";
import BuyYourTicketsButton from "./BuyYourTicketsButton";

export default function LotteryBanner({ lottery }) {
    return (
        <div
            className="relative h-[80vh] w-[97vw] flex items-center justify-center rounded-4xl overflow-hidden mt-2"
        >
            <Image
                src="/lotterypanel.svg"
                alt="LuckyChain Background"
                sizes="100vw"
                fill
                className="object-cover rounded-4xl  "
            />
            {/* Decorative Coins */}
            <CryptoIcon
                type="eth"
                width={60}
                height={60}
                className="absolute top-4 left-8"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
            <CryptoIcon
                type="btc"
                width={50}
                height={50}
                className="absolute top-16 right-30"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
            <CryptoIcon
                type="btc"
                width={50}
                height={50}
                className="absolute top-16 right-12"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
            <CryptoIcon
                type="eth"
                width={40}
                height={40}
                className="absolute bottom-20 right-20"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />

            {/* Main Content */}
            <div className="absolute inset-0 flex  justify-between items-center p-8">
                {/* Top Section */}
                <div className="flex justify-between items-start ">
                    <div>
                        <div className="text-white/80 text-sm mb-1">LotteryId</div>
                        <div className="text-white text-3xl font-bold mb-2">#{lottery.id}</div>
                        <div className="text-white/80 text-sm mb-1">Lottery name</div>
                        <div className="text-white text-2xl font-semibold mb-4">{lottery.name}</div>
                        <BuyYourTicketsButton />
                    </div>


                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">


                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center ">
                        <p className="text-white/80 text-xs mb-1">Players</p>
                        <p className="text-white text-2xl font-bold">{lottery.players}</p>
                    </div> 

                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center ">
                        <p className="text-white/80 text-xs mb-1">Total Balance</p>
                        <p className="text-white text-xl font-bold">{lottery.totalBalance} ETH</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <p className="text-white/80 text-xs mb-1">Fees</p>
                        <p className="text-white text-lg font-bold">{lottery.fees} ETH</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <p className="text-white/80 text-xs mb-1">Win Prediction</p>
                        <p className="text-white text-lg font-bold">{lottery.winPrediction}%</p>
                    </div>

                </div>
            </div>

             <div className="absolute bottom-[5vh] right-5">
                  
                    {/* Timer */}
                    <LotteryTimer endTime={lottery.endTime} />
                </div>

        </div>
    )
}
