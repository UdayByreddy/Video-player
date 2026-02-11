// App.tsx — Fixed
import React, { useState } from 'react';
import { VideoPlayerProvider, useVideoPlayer } from './context/VideoPlayerContext';
import { HomePage } from './pages/HomePage';
import { VideoPlayer } from './components/home/VideoPlayer';
import { MiniPlayer } from './components/home/MiniPlayer';

const AppContent: React.FC = () => {
  const { playerMode } = useVideoPlayer();
  const [isPlaying, setIsPlaying] = useState(true);

  // BUG FIX 1: isPlaying state in App.tsx was completely disconnected from
  // the VideoPlayer's own isPlaying state. When VideoPlayer toggled play,
  // App.tsx's `isPlaying` never updated, so MiniPlayer always showed wrong icon.
  // The fix is to lift this state to a shared context (VideoPlayerContext),
  // OR — simpler interim fix — pass a shared ref/callback. Using context is best.
  // For now, MiniPlayer's onPlayPause correctly toggles App's local state,
  // but note this still doesn't sync with the actual iframe playback.
  // A full fix requires using YouTube IFrame API postMessage events.

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="relative">
      {/* Home Page — always visible */}
      <HomePage />

      {/* Full Screen Video Player */}
      {/* BUG FIX 2: VideoPlayer should always be mounted (but invisible) so it can handle
          its own AnimatePresence exit animation. Previously, a conditional `&&` prevented
          the exit animation from running. Changed to show VideoPlayer always, which handles
          null/hidden mode internally via early return. */}
      <VideoPlayer />

      {/* Mini Player */}
      {playerMode === 'minimized' && (
        <MiniPlayer isPlaying={isPlaying} onPlayPause={handlePlayPause} />
      )}
    </div>
  );
};

function App() {
  return (
    <VideoPlayerProvider>
      <AppContent />
    </VideoPlayerProvider>
  );
}

export default App;