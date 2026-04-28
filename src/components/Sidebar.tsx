import { useState, useMemo } from 'react';
import { useRadioStore } from '@/store/radioStore';
import type { RadioStation } from '@/types';
import { Search, Heart, ChevronRight, X, Compass } from 'lucide-react';

interface SidebarProps {
  onStationSelect: (station: RadioStation) => void;
  stations: RadioStation[];
}

export default function Sidebar({ onStationSelect, stations }: SidebarProps) {
  const { showSidebar, setShowSidebar, searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, userProfile, addDiscovered } = useRadioStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'favorites'>('discover');

  const genres = useMemo(() => {
    const genreSet = new Set(stations.map(s => s.genre).filter(Boolean));
    return Array.from(genreSet).sort();
  }, [stations]);

  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           station.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = !selectedGenre || station.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [stations, searchQuery, selectedGenre]);

  const favoriteStations = useMemo(() => {
    return stations.filter(s => userProfile.favoriteStations.includes(s.uuid));
  }, [stations, userProfile.favoriteStations]);

  const stationsToDisplay = activeTab === 'favorites' ? favoriteStations : filteredStations;

  if (!showSidebar) {
    return (
      <button
        onClick={() => setShowSidebar(true)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <ChevronRight size={18} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 z-40 w-80 bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Compass size={20} className="text-cyan-400" />
          <span className="text-white font-semibold">World Radio</span>
        </div>
        <button
          onClick={() => setShowSidebar(false)}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-3 border-b border-white/10">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'discover'
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all ${
            activeTab === 'favorites'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Heart size={14} /> {userProfile.favoriteStations.length}
        </button>
      </div>

      {/* Search and Filter */}
      {activeTab === 'discover' && (
        <div className="p-3 space-y-3 border-b border-white/10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stations List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {stationsToDisplay.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">No stations found</p>
            </div>
          ) : (
            stationsToDisplay.map((station) => (
              <button
                key={station.uuid}
                onClick={() => {
                  onStationSelect(station);
                  addDiscovered(station.uuid);
                }}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
              >
                <p className="text-white font-medium text-sm group-hover:text-cyan-400 transition-colors">
                  {station.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/40 text-xs">{station.country}</p>
                  {station.genre && (
                    <>
                      <span className="text-white/20">•</span>
                      <p className="text-white/40 text-xs">{station.genre}</p>
                    </>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <p className="text-white/30 text-xs text-center">
          {userProfile.discoveredStations.length} / {stations.length} stations discovered
        </p>
      </div>
    </div>
  );
}
