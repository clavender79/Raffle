// lib/wagmiConfig.js
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { createConfig } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { anvil } from './chains'; // import your custom chain

export const wagmiConfig = createConfig({
  autoConnect: true,
  chains: [mainnet, sepolia, anvil],  // ✅ Add anvil here
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http('https://tame-icy-feather.ethereum-sepolia.quiknode.pro/be4d0530d0a634b0a9659b2accb1c7058ff75c55/'),
    [anvil.id]: http('http://localhost:8545'),  // ✅ Transport for anvil
  },
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask({ shimDisconnect: true }),
  ],
});
