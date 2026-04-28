import { useEffect, useState, useCallback } from 'react';
import { useRadioStore } from '@/store/radioStore';
import type { RadioStation } from '@/types';
import Globe from '@/components/Globe';
import Sidebar from '@/components/Sidebar';
import PlayerControls from '@/components/PlayerControls';
import InfoOverlay from '@/components/InfoOverlay';
import { loadWorldRadioStations } from '@/data/loadStations';
import { Loader } from 'lucide-react';

export default function App() {
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const { setCurrentStation, userProfile } = useRadioStore();

  // Load stations on mount
  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        const loadedStations = await loadWorldRadioStations();
        setStations(loadedStations);
        setError(null);
      } catch (err) {
        console.error('Error loading stations:', err);
        setError('Failed to load stations. Using demo stations.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleStationSelect = useCallback((station: RadioStation) => {
    setSelectedStation(station);
    setCurrentStation(station);
    
    // Stop current playback
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    // Try to play the new station
    if (audioElement && station.url) {
      try {
        audioElement.src = station.url;
        audioElement.crossOrigin = 'anonymous';
        
        // Attempt to play
        audioElement.play().catch(err => {
          console.error('Playback error:', err);
          
          // Try with CORS proxy if direct fails
          if (station.url && !station.url.includes('cors')) {
            const proxyUrl = `https://cors-anywhere.herokuapp.com/${station.url}`;
            audioElement.src = proxyUrl;
            audioElement.play().catch(() => {
              console.error('Proxy playback also failed');
            });
          }
        });
        
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to load stream:', err);
        setIsPlaying(false);
      }
    }
  }, [audioElement, setCurrentStation]);

  const togglePlayPause = useCallback(() => {
    if (!audioElement || !selectedStation) return;

    try {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().catch(err => {
          console.error('Play error:', err);
        });
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback control error:', err);
    }
  }, [audioElement, isPlaying, selectedStation]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Loading screen */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white text-lg font-semibold">Loading World Radio Stations...</p>
          <p className="text-white/60 text-sm mt-2">Fetching {stations.length} stations from around the globe</p>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="absolute top-4 right-4 z-40 bg-red-500/20 border border-red-500 rounded-lg p-3 max-w-xs">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Globe */}
      <div className="absolute inset-0">
        <Globe
          stations={stations}
          onStationClick={handleStationSelect}
          selectedStation={selectedStation || undefined}
        />
      </div>

      {/* Sidebar */}
      <Sidebar onStationSelect={handleStationSelect} stations={stations} />

      {/* Player Controls */}
      {selectedStation && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <PlayerControls
            station={selectedStation}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onClose={() => {
              setSelectedStation(null);
              if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
              }
              setIsPlaying(false);
            }}
          />
        </div>
      )}

      {/* Info Overlay */}
      {selectedStation && (
        <InfoOverlay
          station={selectedStation}
          userProfile={userProfile}
        />
      )}

      {/* Welcome Banner */}
      {!selectedStation && !isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h1 className="text-white text-5xl font-bold mb-4">World Radio</h1>
            <p className="text-white/60 text-xl">Explore radio stations from around the globe</p>
            <p className="text-white/40 text-sm mt-4">{stations.length} stations available • Click on the globe to start listening</p>
          </div>
        </div>
      )}

      {/* Audio element */}
      <audio
        ref={(el) => {
          if (el && el !== audioElement) {
            setAudioElement(el);
          }
        }}
        controls={false}
      />
    </div>
  );
}
