"use client"

import Image from "next/image";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <main className="max-w-6xl mx-auto p-8">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">About RaffleRun</h1>
          <p className="text-gray-300 mb-4">
            RaffleRun is a production-minded Web3 project that showcases end-to-end
            dApp development: audited-like Solidity contracts (Foundry), deterministic tests,
            Chainlink VRF for verifiable randomness, and a modern frontend backed by Supabase for fast queries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded p-4">
              <h3 className="font-semibold">Fair & Transparent</h3>
              <p className="text-gray-300 text-sm">Winners are selected using Chainlink VRF v2.5 to ensure unbiased randomness.</p>
            </div>
            <div className="bg-white/5 rounded p-4">
              <h3 className="font-semibold">Event-driven</h3>
              <p className="text-gray-300 text-sm">On-chain events are synced to Supabase to enable real-time dashboards and history pages.</p>
            </div>
            <div className="bg-white/5 rounded p-4">
              <h3 className="font-semibold">Admin-ready</h3>
              <p className="text-gray-300 text-sm">A RaffleFactory enables multiple independent raffles and upkeep registration.</p>
            </div>
            <div className="bg-white/5 rounded p-4">
              <h3 className="font-semibold">Tested & Scripted</h3>
              <p className="text-gray-300 text-sm">Foundry scripts and integration tests keep behavior reproducible across networks.</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/community" className="bg-white text-black px-4 py-2 rounded">Join the community</Link>
            <Link href="/" className="border border-white/20 px-4 py-2 rounded hover:bg-white/5">Explore raffles</Link>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-lg">
          <Image src="/appPhotos/lotteryHomePage.png" alt="Admin dashboard" width={900} height={840} className="object-cover rounded-xl" priority />
        </div>
      </section>

      <section className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded">
          <h4 className="font-semibold mb-2">Mission</h4>
          <p className="text-gray-300 text-sm">Build a transparent, auditable raffle platform that demonstrates best practices for Web3 products: testability, reproducibility, and a good developer experience.</p>
        </div>

        <div className="bg-white/5 p-6 rounded">
          <h4 className="font-semibold mb-2">Tech Stack</h4>
          <ul className="text-gray-300 text-sm list-disc list-inside">
            <li>Solidity + Foundry</li>
            <li>Chainlink VRF v2.5 + Automation</li>
            <li>Next.js (App Router) + wagmi/viem</li>
            <li>Supabase for event sync</li>
          </ul>
        </div>

        <div className="bg-white/5 p-6 rounded">
          <h4 className="font-semibold mb-2">Get Involved</h4>
          <p className="text-gray-300 text-sm">Open issues, suggest features, or contribute PRs. See the repository README for development instructions.</p>
        </div>
      </section>
    </main>
  );
}
