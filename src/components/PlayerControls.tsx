import { Play, Pause, X, Heart, Share2 } from 'lucide-react';
import type { RadioStation } from '@/types';
import { useRadioStore } from '@/store/radioStore';

interface PlayerControlsProps {
  station: RadioStation;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

export default function PlayerControls({
  station,
  isPlaying,
  onPlayPause,
  onClose
}: PlayerControlsProps) {
  const { userProfile, addFavorite, removeFavorite } = useRadioStore();
  const isFavorite = userProfile.favoriteStations.includes(station.uuid);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(station.uuid);
    } else {
      addFavorite(station.uuid);
    }
  };

  return (
    <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Station Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{station.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-white/60 text-sm">{station.country}</p>
              {station.genre && (
                <>
                  <span className="text-white/30">•</span>
                  <p className="text-white/60 text-sm">{station.genre}</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={onPlayPause}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" />
            )}
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'World Radio',
                  text: `Listening to ${station.name} on World Radio`,
                  url: window.location.href
                }).catch(() => {});
              }
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-all"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
