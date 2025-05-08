"use client"

import { useState, useEffect } from "react"

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime()

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="countdown-timer">
      <h3>Next Draw In:</h3>
      <div className="timer-display">
        <div className="timer-segment">
          <span className="timer-number">{timeLeft.days}</span>
          <span className="timer-label">Days</span>
        </div>
        <div className="timer-segment">
          <span className="timer-number">{timeLeft.hours}</span>
          <span className="timer-label">Hours</span>
        </div>
        <div className="timer-segment">
          <span className="timer-number">{timeLeft.minutes}</span>
          <span className="timer-label">Minutes</span>
        </div>
        <div className="timer-segment">
          <span className="timer-number">{timeLeft.seconds}</span>
          <span className="timer-label">Seconds</span>
        </div>
      </div>
    </div>
  )
}

export default CountdownTimer
