import type { RadioStation, UserProfile } from '@/types';
import { Globe, Radio, Volume2 } from 'lucide-react';

interface InfoOverlayProps {
  station: RadioStation;
  userProfile: UserProfile;
}

export default function InfoOverlay({ station }: InfoOverlayProps) {
  return (
    <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-4 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-cyan-400" />
          <span className="text-white/60 text-xs font-semibold">NOW PLAYING</span>
        </div>

        <h3 className="text-white font-bold text-lg">{station.name}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-white/40" />
            <span className="text-white/60">{station.country}</span>
          </div>

          {station.genre && (
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-white/40" />
              <span className="text-white/60">{station.genre}</span>
            </div>
          )}

          {station.bitrate && station.bitrate > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">Quality:</span>
              <span className="text-white/60 text-xs">{station.bitrate} kbps</span>
            </div>
          )}
        </div>

        {station.votes && station.votes > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/40 text-xs">❤️ {station.votes.toLocaleString()} votes</p>
          </div>
        )}
      </div>
    </div>
  );
}
