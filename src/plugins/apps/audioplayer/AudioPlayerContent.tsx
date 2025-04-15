import React, { useState } from 'react';

import { Separator } from '@/components/ui/separator';

import { MusicPlayer, Track } from './components/MusicPlayer';
import { PlaylistManager } from './components/PlaylistManager';

const AudioPlayerContent = () => {
  // Sample playlists - you can expand this or load dynamically
  const samplePlaylists = [
    {
      id: "default",
      name: "Default Playlist",
      tracks: [
        {
          id: 1,
          title: "Sample Audio",
          author: "Demo Artist",
          src: "/audio/sample.mp3",
          cover:
            "/icons/34691_beos_audio_loud_music_server_speaker_audio_beos_loud_music_server_speaker.png",
        },
      ],
    },
    {
      id: "favorites",
      name: "Favorites",
      tracks: [
        {
          id: 1,
          title: "Sample Audio",
          author: "Demo Artist",
          src: "/audio/sample.mp3",
          cover: "/icons/34697_burn_beos_burn_2_beos.png",
        },
      ],
    },
  ];

  const [currentTracks, setCurrentTracks] = useState<Track[]>(
    samplePlaylists[0].tracks
  );
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>(
    samplePlaylists[0].id
  );

  const handleSelectPlaylist = (tracks: Track[], playlistId?: string) => {
    setCurrentTracks(tracks);
    if (playlistId) {
      setCurrentPlaylistId(playlistId);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="container mx-auto py-4 h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
          <div className="md:col-span-8 flex flex-col justify-center bg-card rounded-lg p-4">
            <MusicPlayer tracks={currentTracks} />
          </div>

          <div className="md:col-span-4 bg-card rounded-lg">
            <PlaylistManager
              playlists={samplePlaylists}
              onSelectPlaylist={(tracks) => handleSelectPlaylist(tracks)}
              currentPlaylistId={currentPlaylistId}
            />
            <Separator className="my-2" />
            <div className="p-4 text-xs text-muted-foreground">
              BeOS Audio Player v1.0
              <br />© 2025 Draggable Desktop Dreamscape
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerContent;
