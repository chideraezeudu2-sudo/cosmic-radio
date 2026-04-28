export interface RadioStation {
  uuid: string;
  name: string;
  url: string;
  country: string;
  genre: string;
  latitude: number;
  longitude: number;
  votes?: number;
  favicon?: string;
  bitrate?: number;
  language?: string;
}

export interface UserProfile {
  discoveredStations: string[];
  favoriteStations: string[];
  streakDays: number;
  totalListeningTime: number;
}

export interface AppState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  userProfile: UserProfile;
}
