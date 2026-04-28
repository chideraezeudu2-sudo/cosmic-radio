import { create } from 'zustand';
import type { RadioStation, UserProfile } from '@/types';

interface RadioStore {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  showSidebar: boolean;
  sidebarTab: 'discover' | 'favorites' | 'journey' | 'collections' | 'achievements';
  searchQuery: string;
  selectedGenre: string | null;
  userProfile: UserProfile;
  
  setCurrentStation: (station: RadioStation | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  setSidebarTab: (tab: 'discover' | 'favorites' | 'journey' | 'collections' | 'achievements') => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  addFavorite: (stationId: string) => void;
  removeFavorite: (stationId: string) => void;
  addDiscovered: (stationId: string) => void;
}

export const useRadioStore = create<RadioStore>((set) => ({
  currentStation: null,
  isPlaying: false,
  showSidebar: false,
  sidebarTab: 'discover',
  searchQuery: '',
  selectedGenre: null,
  userProfile: {
    discoveredStations: [],
    favoriteStations: [],
    streakDays: 0,
    totalListeningTime: 0
  },
  
  setCurrentStation: (station) => set({ currentStation: station }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setShowSidebar: (show) => set({ showSidebar: show }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
  
  addFavorite: (stationId) => set((state) => ({
    userProfile: {
      ...state.userProfile,
      favoriteStations: [...new Set([...state.userProfile.favoriteStations, stationId])]
    }
  })),
  
  removeFavorite: (stationId) => set((state) => ({
    userProfile: {
      ...state.userProfile,
      favoriteStations: state.userProfile.favoriteStations.filter(id => id !== stationId)
    }
  })),
  
  addDiscovered: (stationId) => set((state) => ({
    userProfile: {
      ...state.userProfile,
      discoveredStations: [...new Set([...state.userProfile.discoveredStations, stationId])]
    }
  }))
}));
