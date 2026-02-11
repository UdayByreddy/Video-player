import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdClose } from "react-icons/md";
import { VideoControls } from "./Videocontrol";
import { useVideoPlayer } from "../../context/VideoPlayerContext";

export const VideoPlayer: React.FC = () => {
  const {
    currentVideo,
    playerMode,
    setPlayerMode,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    handlePlayPause,
    handleSeek,
    handleSkip,
    handleVolumeChange,
    handleMuteToggle,
    handleClose,
  } = useVideoPlayer();

  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleToggleFullScreen = ()=>{
    setPlayerMode("minimized")
  }

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    if (!isPlaying) setShowControls(true);
  }, [isPlaying]);

  // CRITICAL: Hard return null — no AnimatePresence, no exit animation.
  // AnimatePresence was keeping this fixed-inset overlay alive during its
  // exit transition, blocking MiniPlayer from receiving clicks/being seen.
  if (!currentVideo || playerMode !== "fullscreen") return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Close */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        aria-label="Close player"
      >
        <MdClose size={24} />
      </button>

      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={true}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onSkip={handleSkip}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onFullscreenToggle={handleToggleFullScreen}
        showControls={showControls}
      />
    </div>
  );
};