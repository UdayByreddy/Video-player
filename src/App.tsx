// App.tsx
import React from "react";
import {
  VideoPlayerProvider,
  useVideoPlayer,
} from "./context/VideoPlayerContext";
import { HomePage } from "./pages/HomePage";
import { VideoPlayer } from "./components/home/VideoPlayer";
import { MiniPlayer } from "./components/home/MiniPlayer";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const AppContent: React.FC = () => {
  const { playerMode } = useVideoPlayer();



  return (
    <div className="relative">
      {/* Home Page — always visible */}
      <HomePage />
    {playerMode === 'fullscreen' && <VideoPlayer />}
    {playerMode === 'minimized' && <MiniPlayer />}

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
