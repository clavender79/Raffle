"use client"



const colorClasses = {
  blue: "from-blue-400 to-blue-600",
  orange: "from-orange-400 to-orange-600",
  green: "from-green-400 to-green-600",
  red: "from-red-400 to-red-600",
  purple: "from-purple-400 to-purple-600",
  pink: "from-pink-400 to-pink-600",
}

export default function LotteryCard({ lottery, onClick }) {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[lottery.color]} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-lg`}
      onClick={() => onClick(lottery)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">🏆 Prize Pot</div>
        <div className="text-right">
          <div className="text-2xl font-bold">{lottery.prizePot}</div>
          <div className="text-sm opacity-80">ETH</div>
        </div>
      </div>

      {/* Decorative Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🎲</span>
        </div>
      </div>

      {/* Check History button */}
      <div className="text-center mb-4">
        <button variant="ghost" size="sm" className="text-white hover:bg-white/20 text-xs">
          Check history
        </button>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="opacity-80">🎫 LotteryId</span>
          <span className="font-semibold">#{lottery.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">👤 LotteryName</span>
          <span className="font-semibold">{lottery.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">👥 Players</span>
          <span className="font-semibold">{lottery.players}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">💰 Fees</span>
          <span className="font-semibold">{lottery.fees} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">⛓️ Chain</span>
          <span className="font-semibold">{lottery.chain}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">⏰ Time Remaining</span>
          <span className="font-semibold">{lottery.timeRemaining}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">🏆 Last winner</span>
          <span className="font-semibold">{lottery.lastWinner}</span>
        </div>
      </div>

      {/* Buy Tickets button */}
      <button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-none">Buy tickets</button>
    </div>
  )
}
