import React from 'react';

const LotteryStats = ({activeLotteries=9,balance=1000,Currency="ETH",Players=100,className = '', style}) => {
    return (
        <div className={`${className}`} style={style}>
            
            <div className='text-center '>
                <p className='text-[#858585] '>Active</p>
                <h2 className="text-3xl font-medium text-[#0067A2]">{activeLotteries}</h2>
            </div>
            <div className='ml-8 ps-8 text-center border-s-1 border-gray-300 '>
                <p className='text-[#858585] '>Balance</p>
                <h2 className="text-3xl font-medium text-[#0067A2] ">{balance}</h2>
            </div>
            <div className='ml-8 ps-8 text-center border-s-1 border-gray-300 '>
                <p className='text-[#858585] '>Currency</p>
                <h2 className="text-3xl font-medium text-[#0067A2]">{Currency}</h2>
            </div>
            <div className='ml-8 ps-8 text-center border-s-1 border-gray-300 '>
                <p className='text-[#858585] '>Players</p>
                <h2 className="text-3xl font-medium text-[#0067A2]">{Players}</h2>
            </div>
        </div>
    );
}

export default LotteryStats;
