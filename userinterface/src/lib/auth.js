import { useSignMessage, useAccount } from 'wagmi';
import supabase  from './supabase';
import {jwtDecode} from 'jwt-decode';
import useWalletStore from './useWalletStore';



export const useWalletAuth = () => {
  const { signMessageAsync } = useSignMessage();
  const { address: accountAddress } = useAccount();

  async function login(walletAddress) {
    const address = walletAddress?.toLowerCase() || accountAddress?.toLowerCase();
    try {
      console.log('Attempting to login with address:', address);
      if (!address) {
        throw new Error('No wallet connected');
      }
      const message = `Sign to authenticate with Lottery App: ${address}`;
      const signature = await signMessageAsync({ message });
      const response = await fetch('/api/generate-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, signature, message }),
      });
      const { access_token, refresh_token, error } = await response.json();
      if (error) throw new Error(error);

      // Decode JWT to extract custom_role
      const decodedToken = jwtDecode(access_token);
      const customRole = decodedToken?.user_metadata?.custom_role || 'player';
      console.log('Decoded token:', decodedToken);
      
      // Determine if the user is an admin
      console.log('Custom role:', customRole);
      const isAdmin = customRole === 'admin';
      console.log('Is admin:', isAdmin);
      

      // Update Zustand store
      useWalletStore.getState().setWallet({
        isConnected: true,
        isAdmin,
        address,
        accessToken: access_token,
        refreshToken: refresh_token || null,
      });

      // Set Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || null,
      });
      if (sessionError) throw sessionError;

      return access_token;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return { login, logout, supabase };
};