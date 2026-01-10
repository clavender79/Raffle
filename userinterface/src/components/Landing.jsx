import Image from 'next/image';
import CryptoIcon from './CryptoIcon'; // Adjust the import path
import LotteryStats from './LotteryStats'
import FeatureCard from './FeatureCard';

import LotteryHistoryTable from './LotteryHistoryTable';
import BuyYourTicketsButton from './BuyYourTicketsButton';
import { useRouter } from 'next/navigation';
import { getLotteriesDetail, getLotteryHistoryAndRaffleDetails } from '@/lib/dbUtils';
import {useState,useEffect} from 'react';


const Landing = () => {

  const router = useRouter();
  const [activeCount, setActiveCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [players, setPlayers] = useState(0);
  const [lotteryHistoryData,setLotteryHistoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { activeCount, balance, players } = await getLotteriesDetail();
      console.log("Lottery Details:", { activeCount, balance, players });
      setActiveCount(activeCount);
      setBalance(balance);
      setPlayers(players);

    const lotteryHistory = await getLotteryHistoryAndRaffleDetails();
    const formattedLotteryData=lotteryHistory.map(item => {
      // Map the data to the desired format
      return {
        lotteryId: "#" + item.raffle_id,
        lastWinner: item.winner,
        prize: item.prize,
        date: item.timestamp,
        status: item.status=="Open"? "Active" : "Closed",
      };
    });
    setLotteryHistoryData(formattedLotteryData);

    };
    fetchData();
    
  }, []);

  return (
    <>
      <div className="relative h-[80vh] w-[97vw] flex items-center justify-center mt-4 bg-gradient-to-b from-blue-200 to-blue-500 rounded-4xl m-2">
        <Image
          src="/homePageImage.png"
          alt="RaffleRun Background"
          sizes="100vw"
          fill
          className="object-cover rounded-4xl  "
        />
        <div className="relative z-10 flex flex-col items-center text-white top-[-10vh]">
          <p className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm">
            Trusted by over 12,000 players
          </p>
          <h1 className="text-5xl font-bold text-center mt-4">
            First-ever blockchain <br />powered lottery platform
          </h1>
          <BuyYourTicketsButton onClick={()=> router.push('/lotteries')}/>
        </div>

        {/* Dashed Lines and Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical dashed lines with custom heights */}
          {[10, 17, 24, 31, 38, 95, 86, 77, 68].map((position, index) => {
            let height;
            let style = { left: `${position}%` };

            if (index < 5) {
              // First 5 lines: height up to 40% of parent (20vh)
              const heights1 = ['15%', '30%', '35%', '50%', '20%']; // Small to large
              height = heights1[index];
            }
            else {
              // Last 3 lines: increase height, peaking at 50% (25vh)
              const heights = ['15%', '20%', '50%', '30%']; // Small to large
              height = heights[index - 5];
            }

            return (
              <div
                key={position}
                className="absolute top-0 w-px border-l border-dashed border-white opacity-50"
                style={{ ...style, height }}
              ></div>
            );
          })}
        </div>

        <div className="absolute top-10 left-10">
          <CryptoIcon type="btc" className=" rotate-[120deg] opacity-50" />
        </div>
        <div className="absolute left-70 z-2">
          <CryptoIcon type="eth" className="animate-float" />
        </div>
        <div className="absolute  left-64 bottom-42">
          <CryptoIcon type="eth" className="animate-float" />
        </div>
        <div className="absolute top-30 right-70 z-20" >
          <CryptoIcon type="" className="" width={100} height={100} />
        </div>
        <div className="absolute bottom-25 right-85">
          <CryptoIcon type="btc" className="" width={100} height={100} />
        </div>
        <div className="absolute bottom-35 right-25 ">
          <CryptoIcon type="ethLogo" className="rotate-[100deg] opacity-50" width={120} height={120} />
        </div>
        <div className="absolute bottom-30 left-30">
          <CryptoIcon type="ethLogo" className="" width={150} height={150} />
        </div>


        <LotteryStats className="p-6 px-10 bg-white rounded-2xl absolute flex bottom-[-8vh] z-20 gap-5  " activeLotteries={activeCount} balance={balance} Players={players}
        
        style={{
          boxShadow: `
      inset 0 4px 20px 0px #A9DCFF,
      inset 0 -4px 4px 0px #A9DCFF
    `,

        }} />


      </div>

      {/* Features Section  */}
      <div className='my-20 flex flex-col items-center gap-4 relative overflow-hidden'>
        <Image
          src="/backgroundEllipse.svg"
          alt="RaffleRun Background"
          sizes="10vw"
          fill
          className="object-center rounded-2xl "
        />
        {/* Ethereum Blockchain Description */}

        <div className='flex flex-col items-center px-25 '>
          <CryptoIcon type="ethActual" width={40} />
          <p className="text-center text-md tracking-wide mt-6 z-10 px-40 w-3/4 ">
            Built on Ethereum blockchain—ensuring trust, transparency, and decentralization for every lottery draw. <span className='text-[#616161]'>Smart contracts handle ticket purchases, prize distribution, and winner selection without human intervention.
            </span>
          </p>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-2 gap-8 mt-10 z-10  relative ">
          <FeatureCard
            title="Fair draws"
            description="Every lottery draw is powered by smart contracts ensuring 100% transparency and fairness—auditable on the Ethereum blockchain."
            className='bg-[#38B4FF] w-80 h-80 flex flex-col pt-14 gap-2 relative'
            paraClasses='w-60'
            imgSrc="/coinsBox.svg" imgAlt="coinsBox"
            imgWidth='120'
            imgHeight='120'
          />


          <FeatureCard
            title="Instant Payouts"
            description="Winners get rewards directly to their wallets without delays. No intermediaries. No hidden fees."
            className='bg-[#38B4FF] w-80 h-80 flex flex-col pt-14 gap-2 relative'
            paraClasses='w-55'
            imgSrc="/giftBoxImage.svg" imgAlt="giftBoxImage"
          />

          <FeatureCard
            title="Multiple Lotteries"
            description="Join lotteries running simultaneously—more chances to win, more excitement every day."
            className='bg-[#1279BF] w-80 h-80  flex flex-col pt-14 gap-2 relative'
            imgSrc="/multipleLotteries.svg" imgAlt="multipleLotteries"
          />
          <FeatureCard
            title="Low Entrance Fees"
            description="Play for as little as a few cents in ETH. Fair participation for everyone, no matter the budget."
            className='bg-[#73CDFF] w-80 h-80  flex flex-col pt-14 gap-2 relative'
            imgSrc="lowEntranceFees.svg" imgAlt="lowEntranceFees"
          />
        </div>

        <div className="absolute bottom-70 right-[-15vh]">
          <CryptoIcon type="ethLogo" className="rotate-[280deg] " width={350} height={350} />
        </div>
        <div className="absolute left-[-12vh] bottom-10">
          <CryptoIcon type="ethLogo" className="" width={350} height={350} />
        </div>

      </div>

      {/* Lottery History Table */}

      <div className="relative h-[50vh] flex flex-col items-center justify-center my-12">
        <CryptoIcon
          type="ethLogo"
          width={350}
          height={350}
          className="absolute rotate-[137deg] right-[28rem] top-0 opacity-40 z-0"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(0, 163, 255, 0.8)) drop-shadow(0 0 20px rgba(0, 163, 255, 0.6))',
          }}
        />
        <LotteryHistoryTable data={lotteryHistoryData} />
        <p className="font-bold text-[#FFFFFF] text-5xl mt-6 z-20">Play & Win</p>
         <BuyYourTicketsButton onClick={()=> router.push('/lotteries')} className="relative z-30"/>
      </div>

      

    </>

  );
};

export default Landing;


