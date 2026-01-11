// lib/wagmiConfig.js
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { createConfig } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { anvil } from './chains'; // import your custom chain

export const wagmiConfig = createConfig({
  autoConnect: true,
  chains: [mainnet, sepolia, anvil],  
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(process.env.SEPOLIA_RPC_URL),
    [anvil.id]: http(process.env.ANVIL_RPC_URL),  
  },
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask({ shimDisconnect: true }),
  ],
});
