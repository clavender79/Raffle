import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY 
  );

  // Count players
  const { count: playerCount, error } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching players count:", error);
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }

  return NextResponse.json({ totalPlayers: playerCount });
}
