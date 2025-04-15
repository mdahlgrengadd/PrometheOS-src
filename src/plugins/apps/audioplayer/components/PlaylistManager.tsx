import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Track } from './MusicPlayer';

interface PlaylistManagerProps {
  playlists: {
    id: string;
    name: string;
    tracks: Track[];
  }[];
  onSelectPlaylist: (tracks: Track[]) => void;
  currentPlaylistId?: string;
}

export const PlaylistManager = ({
  playlists,
  onSelectPlaylist,
  currentPlaylistId,
}: PlaylistManagerProps) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    currentPlaylistId || (playlists.length > 0 ? playlists[0].id : "")
  );

  const handleSelectPlaylist = (id: string) => {
    const playlist = playlists.find((p) => p.id === id);
    if (playlist) {
      setSelectedPlaylistId(id);
      onSelectPlaylist(playlist.tracks);
    }
  };

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold mb-4">Playlists</h4>
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className={`p-2 cursor-pointer ${
                selectedPlaylistId === playlist.id ? "bg-secondary" : ""
              }`}
              onClick={() => handleSelectPlaylist(playlist.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{playlist.name}</span>
                <span className="text-xs text-muted-foreground">
                  {playlist.tracks.length} tracks
                </span>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
      {selectedPlaylistId && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleSelectPlaylist(selectedPlaylistId)}
          >
            Load Selected Playlist
          </Button>
        </div>
      )}
    </div>
  );
};
