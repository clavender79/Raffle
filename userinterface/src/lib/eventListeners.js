"use client"
import { useWatchContractEvent } from 'wagmi'
import { readContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import useWalletStore from './useWalletStore';
import supabase from './supabase';
import { handleRaffleCreated, registerUpkeep, setupRaffleEventWatchers } from './eventHandlers';
import { RAFFLE_FACTORY_ADDRESS, RAFFLE_FACTORY_ABI, RAFFLE_ABI } from './contractData';
import { wagmiConfig } from './wagmiConfig';
import { useEffect } from 'react';

const RaffleEventListener = () => {
    const { accessToken, isAdmin } = useWalletStore();

    // Listen for RaffleCreated event
    useWatchContractEvent({
        address: RAFFLE_FACTORY_ADDRESS,
        abi: RAFFLE_FACTORY_ABI,
        eventName: 'RaffleCreated',
        onLogs: (logs) => {

            logs.forEach(async (log) => {

                console.log('RaffleCreated event detected:', log);


                const { args } = log
                const { raffleId, raffleAddress, name } = args;

                console.log('RaffleCreated:', { raffleId, raffleAddress, name });



                // Handle raffle creation (update Zustand and Supabase)
                await handleRaffleCreated(Number(raffleId), raffleAddress, name, accessToken);

                const entranceFee = await readContract(wagmiConfig, {
                    address: "0x2319fa6f046929f5ca3b97a78bd0486544fdf231",
                    abi: RAFFLE_ABI,
                    functionName: 'getEntranceFee'
                });


                console.log("Entrace Fee", Number(entranceFee))

                const timeInterval = await readContract(wagmiConfig, {
                    address: raffleAddress,
                    abi: RAFFLE_ABI,
                    functionName: 'getTimeInterval',
                });

                console.log("Entrance Fee", entranceFee?.toString());
                console.log("Time Interval", timeInterval?.toString());
                console.log("Entrance Fee", Number(entranceFee?.toString()));
                console.log("Time Interval", Number(timeInterval?.toString()));



                console.log("Time Interval", Number(timeInterval))

                // Update Supabase with additional data
                if (accessToken) {
                    const { error } = await supabase
                        .from('raffles')
                        .update({
                            time_interval: Number(timeInterval),
                            ticket_price: Number(entranceFee),

                        })
                        .eq('raffle_id', raffleId);
                    if (error) {
                        console.error('Failed to update raffle details:', error);
                    }
                }
                //update the zustand state
                useWalletStore.getState().updateRaffle(raffleId, {
                    timeInterval: Number(timeInterval),
                    ticketPrice: Number(entranceFee),
                });

                // Register upkeep for admins
                if (isAdmin) {


                    const subId = await readContract(wagmiConfig, {
                        address: raffleAddress,
                        abi: RAFFLE_ABI,
                        functionName: 'getSubId',
                    });

                    console.log("Subscription ID:", subId);

                    const vrfCoordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B"

                    const tx = await writeContract(wagmiConfig, {
                        address: vrfCoordinatorAddress,
                        abi: [
                            {
                                inputs: [
                                    { internalType: 'uint64', name: 'subId', type: 'uint64' },
                                    { internalType: 'address', name: 'consumer', type: 'address' },
                                ],
                                name: 'addConsumer',
                                outputs: [],
                                stateMutability: 'nonpayable',
                                type: 'function',
                            },
                        ],
                        functionName: 'addConsumer',
                        args: [subId, raffleAddress],
                    });

                    await waitForTransactionReceipt(wagmiConfig, { hash: tx });

                    console.log("Everything is set up for the raffle:", { raffleId, raffleAddress, name, entranceFee, timeInterval, subId });

                }
            });


        },
    });





    useEffect(() => {
  let unsubscribes = [];

  const init = async () => {
    // Prevent duplicate setups
    if (unsubscribes.length > 0) return;

    unsubscribes = await setupRaffleEventWatchers();
  };

  init();

  return () => {
    // Clean up all watchers
    unsubscribes.forEach((unsub) => unsub && unsub());
    unsubscribes = [];
  };
}, []); // Empty dependency = run once




    return null; // Headless component
};

export default RaffleEventListener;