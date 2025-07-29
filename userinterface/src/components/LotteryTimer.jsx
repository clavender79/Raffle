"use client"

import { useState, useEffect } from "react"



export default function LotteryTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = endTime.getTime() - now

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="flex justify-center items-center">
      <div className="flex bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden relative">
        {/* Hours Section */}
        <div className="px-6 py-4 text-center relative">
          <div className="text-3xl font-bold text-gray-900">{timeLeft.hours.toString().padStart(2, "0")}</div>
          <div className="text-sm text-gray-500 mt-1">Hours</div>

          {/* Right notch */}
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white/95 rounded-full"></div>
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-transparent rounded-full border-4 border-white/95"></div>
        </div>

        {/* Minutes Section */}
        <div className="px-6 py-4 text-center relative">
          <div className="text-3xl font-bold text-gray-900">{timeLeft.minutes.toString().padStart(2, "0")}</div>
          <div className="text-sm text-gray-500 mt-1">Minutes</div>

          {/* Left notch */}
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-transparent rounded-full"></div>

          {/* Right notch */}
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white/95 rounded-full"></div>
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-transparent rounded-full border-4 border-white/95"></div>
        </div>

        {/* Seconds Section */}
        <div className="px-6 py-4 text-center relative">
          <div className="text-3xl font-bold text-gray-900">{timeLeft.seconds.toString().padStart(2, "0")}</div>
          <div className="text-sm text-gray-500 mt-1">Seconds</div>

          {/* Left notch */}
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
