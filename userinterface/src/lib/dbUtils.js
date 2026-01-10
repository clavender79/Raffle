import supabase from "./supabase";
import useWalletStore from "./useWalletStore";

// //have to fetch the active lotteries , total players from them , total entries, and from revenue table total revenue ( All these value for the current month ) and then also get values for prev month if there are and give percentage rise or fall from it

// export async function getLotteryOverview() {

//     const { data: currentMonthData } = await supabase
//         .from("raffle")
//         .select("*")
//         .eq("status", "active")
//         .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1))
//         .lt("created_at", new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));

//     const { data: previousMonthData } = await supabase
//         .from("lottery")
//         .select("*")
//         .eq("status", "active")
//         .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))
//         .lt("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1));

//     const currentOverview = {
//         activeLotteries: currentMonthData.length,
//         totalPlayers: currentMonthData.reduce((acc, lottery) => acc + lottery.players, 0),
//         totalEntries: currentMonthData.reduce((acc, lottery) => acc + lottery.entries, 0),
//         totalRevenue: currentMonthData.reduce((acc, lottery) => acc + lottery.revenue, 0)
//     };

//     const previousOverview = {
//         activeLotteries: previousMonthData.length,
//         totalPlayers: previousMonthData.reduce((acc, lottery) => acc + lottery.players, 0),
//         totalEntries: previousMonthData.reduce((acc, lottery) => acc + lottery.entries, 0),
//         totalRevenue: previousMonthData.reduce((acc, lottery) => acc + lottery.revenue, 0)
//     };

//     return {
//         current: currentOverview,
//         previous: previousOverview
//     };
// }

export async function getLotteryHistoryAndRaffleDetails() {
    //we will fetch the data from raffle_history which will be (lottery Id, winneraddress, time stamp, prize) and then for that lottery id for raffles table we will fetch (raffle name , isOpen)
    //we will combine them into single object the raffle tables detail and the history data

    const { data: historyData } = await supabase
        .from("raffle_history")
        .select("raffle_id, winner_address, timestamp, prize");

    console.log("History Data:", historyData);

    const lotteryIds = historyData?.map(item => item.raffle_id);

    const { data: raffleData } = await supabase
        .from("raffles")
        .select("raffle_id, name, is_open")
        .in("raffle_id", lotteryIds);

    const combinedData = historyData.map(historyItem => {
        const raffleItem = raffleData.find(raffle => raffle.raffle_id === historyItem.raffle_id);
        //format the time in the form of day-month-year
        const formattedDate = new Date(historyItem.timestamp).toLocaleDateString("en-GB");
        return {
            raffle_id: historyItem.raffle_id,
            raffle_name: raffleItem ? raffleItem.name : null,
            winner: historyItem.winner_address,
            prize: historyItem.prize,
            timestamp: formattedDate,
            status: raffleItem ? (raffleItem.is_open ? "Open" : "Closed") : "Unknown"
        };
    });

    console.log("Combined Data:", combinedData);

    return combinedData;
}


export async function getLotteryHistoryById(lotteryId) {

    const { data: historyData } = await supabase
        .from("raffle_history")
        .select("winner_address, timestamp, prize")
        .eq("raffle_id", lotteryId);

    console.log("History Data:", historyData);

    const formattedHistoryData = historyData.map(item => {
        const formattedDate = new Date(item.timestamp).toLocaleDateString("en-GB");
        return {
            winner: item.winner_address,
            prize: item.prize,
            timestamp: formattedDate
        };
    });

    return formattedHistoryData;
}

export async function getLotteriesDetail() {
    //need (active ,balance , players )

    const res = await fetch("/api/players-count");
    const data = await res.json();
    console.log("Total Players:", data.totalPlayers);
    const playerCount = data.totalPlayers;

    console.log("Total Players:", playerCount);

    // Fetch the raffle and Accumulate the balance and active from zustand stores raffle_data


    const raffles = useWalletStore.getState().raffleContracts;
    console.log("Raffles in get Lotteries Detail", raffles)

    const { activeCount, balance } = raffles.reduce(
        (acc, raffle) => {
            if (raffle.is_open) {
                acc.activeCount++;
                acc.balance += parseFloat(raffle.total_balance || 0);
            }
            return acc;
        },
        { activeCount: 0, balance: 0 }
    );


    return {
        active: activeCount,
        balance: balance,
        players: playerCount
    };
}