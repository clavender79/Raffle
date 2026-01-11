import Image from 'next/image';

const LotteryHistoryTable = ({ data = [] }) => {
  const defaultData = [
    { lotteryId: '#789', lastWinner: '0x0268F79341CB1534', prize: '3 ETH', date: 'June 25, 2025', status: 'Active' },
    { lotteryId: '#456', lastWinner: '0x0268F79341CB1534', prize: '1.5 ETH', date: 'June 20, 2025', status: 'Completed' },
    { lotteryId: '#456', lastWinner: '0x0268F79341CB1534', prize: '1.5 ETH', date: 'June 20, 2025', status: 'Completed' },
  ];

  const tableData = data.length > 0 ? data : defaultData;



  return (
    <div className="relative bg-[#1A1A1AB2] bg-opacity-80 rounded-lg p-4 mt-4 w-3.5/5 mx-auto shadow-lg backdrop-blur-sm">
      {/* Inner glow effect using pseudo-element */}
      <div className="absolute inset-0 rounded-lg" style={{
        boxShadow: 'inset 0 4px 10px 0px #143E5B',
        zIndex: -1,
      }}></div>

      {/* Bitcoin Image */}
      <Image src="/bitcoinWithGpu.svg" alt="Bitcoin" width={300} height={300} className="absolute top-[1vh] right-20 opacity-100 z-5" />

     
      <table className="w-full text-sm relative z-10">
        <thead className="text-[#FFFFFFB2]">
          <tr className="border-b border-gray-500">
            <th className="py-2 text-left px-2">Lottery ID</th>
            <th className="py-2 text-left px-2">Last Winner Address</th>
            <th className="py-2 text-left px-2">Prize</th>
            <th className="py-2 text-left px-2">Date</th>
            <th className="py-2 text-left px-2">Status</th>
          </tr>
        </thead>
        <tbody className="text-[#FFFFFF]">
          {tableData.map((row, index) => (
            <tr key={`${row.lotteryId}-${index}`} className="border-b border-gray-600">
              <td className="py-2 px-2">{row.lotteryId}</td>
              <td className="py-2 px-2">{row.lastWinner}</td>
              <td className="py-2 px-2">{row.prize}</td>
              <td className="py-2 px-2">{row.date}</td>
              <td className="py-2 px-2">
                <span
                  className={`px-2 py-1 rounded-full ${row.status === 'Active' ? 'bg-[#1EA200]' : 'bg-[#A28F00]'
                    } text-white text-xs font-semibold`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryHistoryTable;