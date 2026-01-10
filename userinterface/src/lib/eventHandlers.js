import supabase from './supabase';
import useWalletStore from './useWalletStore';
import { writeContract } from 'wagmi/actions'
import { RAFFLE_FACTORY_ADDRESS, RAFFLE_FACTORY_ABI, RAFFLE_ABI } from './contractData';
import { wagmiConfig } from './wagmiConfig';
import { useWatchContractEvent } from 'wagmi';
import { watchContractEvent } from 'wagmi/actions';

// Handle RaffleCreated event
export async function handleRaffleCreated(raffleId, raffleAddress, name, accessToken) {
  try {
    // Store raffle address in Zustand
    useWalletStore.getState().addRaffleContract(raffleAddress);

    // Update Supabase raffles table
    if (accessToken) {
      const { error } = await supabase
        .from('raffles')
        .insert({
          raffle_id: raffleId,
          raffle_address: raffleAddress,
          name,
          is_open: true,
          last_opened_at: new Date().toISOString(),
          total_balance: 0,
          total_entries: 0,
          chain: "Sepolia",

          time_interval: 5, //updated later

          ticket_price: 100, // updated later
          players: 0
        });

      const raffle = {
        id: raffleId,
        raffle_address: raffleAddress,
        name,
        isOpen: true,
        last_opened_at: new Date().toISOString(),
        total_balance: 0,
        total_entries: 0,
        chain: "Sepolia",
        time_interval: 5,
        ticket_price: 100,
        players: 0,
        recent_winner: null,
      };

      useWalletStore.getState().addRaffle(raffle);
      if (error) {
        console.error('Failed to update raffles table:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error handling RaffleCreated:', error);
    throw error;
  }
}

// Player Enters Raffle Event
export async function playerEntersRaffleHandler(raffleId, playerAddress, ticketsBought) {

  //check if the playerAddress is in the supabase if it is just update the tickets with current tickets + tickets

  // Check if playerAddress exists in players table
  const { data: existingPlayer, error: checkError } = await supabase
    .from('players')
    .select('tickets')
    .eq('player_address', playerAddress)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking player:', checkError);
    throw checkError;
  }

  // If player exists, update ticket count
  if (existingPlayer) {
    const { error: updateError } = await supabase
      .from('players')
      .update({ tickets: existingPlayer.tickets + ticketsBought })

      .eq('player_address', playerAddress);

    if (updateError) {
      console.error('Error updating tickets:', updateError);
      throw updateError;
    }
  } else {
    //if the playerAddress is not in the table then we create a player object with (id(has defualt value in supabase),playerAddress,tickets,createdAt)
    const { error: insertError } = await supabase
      .from('players')
      .insert({

        player_address: playerAddress,
        tickets: ticketsBought,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting player:', insertError);
      throw insertError;
    }
  }

  //now we update the ticket history table update with (id(has default value), raffleId,playerAddress,tickets,timeStamp)
  const { error: historyError } = await supabase
    .from('ticket_history')
    .insert({
      raffle_id: raffleId.toString(),
      player_address: playerAddress,
      tickets: ticketsBought,
      timestamp: new Date(timeStamp * 1000).toISOString(),
    });

  if (historyError) {
    console.error('Error updating ticket history:', historyError);
    throw historyError;
  }

  //Retrive the existing Raffle
  const { data: existingRaffle, error: fetchError } = await supabase
    .from('raffles')
    .select('*')
    .eq('raffle_id', raffleId)
    .single();

  if (fetchError) {
    console.error('Error fetching existing raffle:', fetchError);
    throw fetchError;
  }

  //check whether the players has already bought tickets of raffle before but after the last opened at

  const { data: existingEntry, error: entryError } = await supabase
    .from('ticket_history')
    .select('*')
    .eq('raffle_id', raffleId)
    .eq('player_address', playerAddress)
    .gt('timestamp', existingRaffle.last_opened_at)
    .single();

  if (entryError && entryError.code !== 'PGRST116') {
    console.error('Error checking ticket history:', entryError);
    throw entryError;
  }

  //Update the raffle table for entries and players
  const { error: updateError } = await supabase
    .from('raffles')
    .update({
      total_entries: existingRaffle.total_entries + ticketsBought,
      players: existingRaffle.players + (entryError ? 1 : 0)
    })
    .eq('raffle_id', raffleId);

  if (updateError) {
    console.error('Error updating raffle:', updateError);
    throw updateError;
  }

}


//Event handler in case of WinnerPicked

export async function handleWinnerPicked(raffleId, winnerAddress, amount, timestamp) {
  try {
    // Update Supabase raffles table
    const { error } = await supabase
      .from('raffles')
      .update({
        is_open: false,
        last_opened_at: null,
        total_balance: 0,
        total_entries: 0,
        players: 0,
        recent_winner: winnerAddress
      })
      .eq('raffle_id', raffleId);

    if (error) {
      console.error('Failed to update raffles table:', error);
      throw error;
    }

    // Update Zustand state

    useWalletStore.getState().updateRaffle(raffleId, {
      is_open: false,
      last_opened_at: null,
      total_balance: 0,
      total_entries: 0,
      players: 0,
      recent_winner: winnerAddress
    });

    // update the raffle_history table

    const { error: historyError } = await supabase
      .from('raffle_history')
      .insert({
        raffle_id: raffleId,
        winner_address: winnerAddress,
        prize: amount,
        timestamp: new Date(timestamp * 1000).toISOString(),
      });

    if (historyError) {
      console.error('Error updating raffle history:', historyError);
      throw historyError;
    }

    // update the revenue table
    const revenue = amount / 0.9 - amount;
    const { error: revenueError } = await supabase
      .from('revenue')
      .insert({
        raffle_id: raffleId,
        amount: revenue,
        timestamp: new Date(timestamp * 1000).toISOString(),
      });

    if (revenueError) {
      console.error('Error updating revenue table:', revenueError);
      throw revenueError;
    }

  } catch (error) {
    console.error('Error handling WinnerPicked:', error);
    throw error;
  }
}

export async function handleOpenRaffle(raffleId, timeStamp) {
  try {
    // Update Supabase raffles table
    const { error } = await supabase
      .from('raffles')
      .update({
        is_open: true,
        last_opened_at: new Date(timeStamp * 1000).toISOString(),
      })
      .eq('raffle_id', raffleId);

    if (error) {
      console.error('Failed to update raffles table:', error);
      throw error;
    }
    // Update Zustand state
    useWalletStore.getState().updateRaffle(raffleId, {
      is_open: true,
      last_opened_at: new Date(timeStamp * 1000).toISOString(),
    });

  } catch (error) {
    console.error('Error handling OpenRaffle:', error);
    throw error;
  }
}

// Hook to register upkeep (used by admins)
export async function registerUpkeep(raffleId, name) {


  const txhash = await writeContract(wagmiConfig, {
    address: RAFFLE_FACTORY_ADDRESS,
    abi: RAFFLE_FACTORY_ABI,
    functionName: 'registerUpKeep',
    args: [raffleId, name],
  });

  return txhash;
}

export async function createVrf() {
  try {
    const txhash = await writeContract(wagmiConfig, {
      address: RAFFLE_FACTORY_ADDRESS,
      abi: RAFFLE_FACTORY_ABI,
      functionName: 'createVRFSubscription',
    });
    return txhash;
  } catch (error) {
    console.error('Error registering VRF:', error);
    throw error;
  }
}

export async function addConsumerToSubscription(raffleId) {
  try {
    const txhash = await writeContract(wagmiConfig, {
      address: RAFFLE_FACTORY_ADDRESS,
      abi: RAFFLE_FACTORY_ABI,
      functionName: 'addConsumerToSubscription',
      args: [raffleId],
    });
    return txhash;
  } catch (error) {
    console.error('Error adding consumer to subscription:', error);
    throw error;
  }
}


//Event Watchers Setup 
//Watch event for tickets bought 
export const setupRaffleEventWatchers = async () => {
  const unsubscribes = [];

  //  Fetch open raffles (is_open = true)
  const { data: openRaffles, error: openError } = await supabase
    .from("raffles")
    .select("raffle_address")
    .eq("is_open", true);

  if (openError) {
    console.error("Error fetching open raffles:", openError);
  } else {
    for (const { raffle_address } of openRaffles) {
      unsubscribes.push(watchEnterRaffle(raffle_address));
      unsubscribes.push(watchWinnerPicked(raffle_address));
    }
  }

  //  Fetch closed raffles (is_open = false)
  const { data: closedRaffles, error: closedError } = await supabase
    .from("raffles")
    .select("raffle_address")
    .eq("is_open", false);

  if (closedError) {
    console.error("Error fetching closed raffles:", closedError);
  } else {
    for (const { raffle_address } of closedRaffles) {
      unsubscribes.push(watchOpenRaffle(raffle_address));
    }
  }

  return unsubscribes;
};


function watchEnterRaffle(raffleAddress) {
  const unsubscribeEnterRaffle = watchContractEvent(wagmiConfig, {
    address: raffleAddress,
    abi: RAFFLE_ABI,
    eventName: 'RaffleEntered',
    pollingInterval: 15000, 
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        const { args } = log;
        const { raffleId, playerAddress, ticketsBought } = args;

        console.log("Raffle Id:", raffleId, "Player Address:", playerAddress, "Tickets Bought:", ticketsBought);

        await playerEntersRaffleHandler(raffleId, playerAddress, ticketsBought);
      });
    }
  });

  console.log("Watch Enter Raffle run for: ", raffleAddress);

  return unsubscribeEnterRaffle;
}

function watchWinnerPicked(raffleAddress) {

  const unsubscribeWinnerPicked = watchContractEvent(wagmiConfig, {
    address: raffleAddress,
    abi: RAFFLE_ABI,
    eventName: 'WinnerPicked',
    pollingInterval: 15000, 
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        const { args } = log;
        const { raffleId, winnerAddress, amount, timestamp } = args;

        console.log("Raffle Id:", raffleId, "Winner Address:", winnerAddress, "Amount:", amount, "Timestamp:", timestamp);

        await handleWinnerPicked(raffleId, winnerAddress, amount, timestamp);
      });
    }
  });

  console.log("Watch Winner picked run for: ", raffleAddress);

  return unsubscribeWinnerPicked;
}

function watchOpenRaffle(raffleAddress) {
  const unsubscribeOpenRaffle = watchContractEvent(wagmiConfig, {
    address: raffleAddress,
    abi: RAFFLE_ABI,
    eventName: 'RaffleOpened',
    pollingInterval: 15000, 
    onLogs: (logs) => {
      logs.forEach(async (log) => {
        const { args } = log;
        const { raffleId, timestamp } = args;

        console.log("Raffle Id:", raffleId, "Timestamp:", timestamp);

        await handleOpenRaffle(raffleId, timestamp);
      });
    }
  });

  console.log("Watch Open Raffle run for: ", raffleAddress);

  return unsubscribeOpenRaffle;
}
