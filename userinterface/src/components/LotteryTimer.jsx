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

      <div className="flex rounded-2xl shadow-lg justify-center items-center gap-4">

        {/* Hours Section */}
        <div className="px-6 py-4 text-center bg-[#FFFFFF]  rounded-xl w-25">
          <p className="text-3xl font-bold text-gray-900">{timeLeft.hours.toString().padStart(2, "0")}</p>
          <p className="text-sm text-gray-500 mt-1">Hours</p>
        </div>

       

       
        
        {/* Minutes Section */}
        <div className="px-6 py-4 text-center bg-[#FFFFFF] rounded-xl w-25">
          <p className="text-3xl font-bold text-gray-900">{timeLeft.minutes.toString().padStart(2, "0")}</p>
          <p className="text-sm text-gray-500 mt-1">Minutes</p>
        </div>

        


        {/* Seconds Section */}
        <div className="px-6 py-4 text-center bg-[#FFFFFF] rounded-xl w-25">
          <p className="text-3xl font-bold text-gray-900">{timeLeft.seconds.toString().padStart(2, "0")}</p>
          <p className="text-sm text-gray-500 mt-1">Seconds</p>
        </div>

        
      </div>
  
  )
}
