import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import supabase from './supabase'; // Adjust path to your Supabase client file

const useWalletStore = create(
  persist(
    (set, get) => ({
      isConnected: false,
      isAdmin: false,
      address: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      raffleContracts: [],
      // Set wallet and authentication state
      setWallet: (state) =>
        set({
          isConnected: state.isConnected,
          isAdmin: state.isAdmin,
          address: state.address,
          accessToken: state.accessToken || null,
          refreshToken: state.refreshToken || null,
          isAuthenticated: !!state.accessToken,
        }),
      // Clear tokens and sign out from Supabase
      clearTokens: async () => {
        try {
          await supabase.auth.signOut();
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isAdmin: false,
            address: null,
            isConnected: false,
            raffleContracts: [],
          });
        } catch (error) {
          console.error('Sign-out error:', error.message);
        }
      },
      // Add a new raffle with full details
      addRaffle: (raffle) =>
        set((state) => ({
          raffles: [...state.raffles, raffle],
        })),
      // Update raffle details
      updateRaffle: (raffleId, updatedDetails) =>
        set((state) => ({
          raffles: state.raffles.map((raffle) =>
            raffle.id === raffleId ? { ...raffle, ...updatedDetails } : raffle
          ),
        })),
      // Fetch and update raffle contracts
      fetchRaffleContracts: async () => {
        try {
          const { data: contracts } = await supabase
            .from('raffles')
            .select('*');

          set({ raffleContracts: contracts });
        } catch (error) {
          console.error('Error fetching raffle contracts:', error);
        }
      },
      // Update specific fields
      updateWallet: (newState) => set((state) => ({ ...state, ...newState })),
    }),
    {
      name: 'lottery-wallet-storage', // Key for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAdmin: state.isAdmin,
        address: state.address,
        raffleContracts: state.raffleContracts,
      }),

      onRehydrateStorage: () => (state) => {
        // // On rehydration, check wallet connection (handled in component with useAccount)
        // if (!state?.address) {
        //   state?.clearTokens();
        // }
      },
    }
  )
);

export default useWalletStore;