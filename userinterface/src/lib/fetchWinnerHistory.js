import { abi, contractAddress } from "./contractData.js"
import { getAbiItem, getLogs } from 'viem'

import { wagmiConfig } from "./wagmiConfig.js"
import { getPublicClient } from '@wagmi/core'
import { sepolia } from 'wagmi/chains'

export const fetchWinnerHistory = async () => {
  try {

    
    const publicClient = getPublicClient(wagmiConfig, { chainId: sepolia.id })
    const latestBlock = await publicClient.getBlockNumber()


    const winnerPickedAbi = getAbiItem({
      abi: abi,
      name: 'WinnerPicked',
      type: 'event',
    })

   



    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: winnerPickedAbi,
      fromBlock: latestBlock - 9000n, 
    })



    console.log("Logs", logs);

    const history = logs.map((log) => {
      const winner = log.args.player
      const amount = Number(log.args.amount) / 1e18 // equivalent to formatEther
      const timestamp = Number(log.args.timestamp)

      return {
        winner,
        amount,
        date: new Date(timestamp * 1000).toISOString().split('T')[0]
      }
    })

    return history

  } catch (error) {
    console.error("Error fetching winner history:", error)
    return []
  }
}
