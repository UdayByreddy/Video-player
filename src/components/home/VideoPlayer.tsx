import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdClose } from "react-icons/md";
import { VideoControls } from "./Videocontrol";
import { useVideoPlayer } from "../../context/VideoPlayerContext";
import { Video } from "../../types";
import { videoData } from "../../data/video";
import { RelatedVideosList } from "./RelatedVideoList";

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
    setCurrentVideo,
  } = useVideoPlayer();

  const [showControls, setShowControls] = useState(true);
  const [showRelatedVideos, setShowRelatedVideos] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleToggleFullScreen = () => {
    setPlayerMode("minimized");
  };

  // Get related videos from the same category
  const getRelatedVideos = (): Video[] => {
    if (!currentVideo) return [];

    // Find the category that contains the current video
    const currentCategory = videoData.categories.find((cat) =>
      cat.contents.some((content) => content.slug === currentVideo.slug),
    );

    if (!currentCategory) return [];

    // Return all videos from that category except the current one
    return currentCategory.contents.filter(
      (video) => video.slug !== currentVideo.slug,
    );
  };

  const relatedVideos = getRelatedVideos();

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setShowRelatedVideos(false);
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    if (!isPlaying) setShowControls(true);
  }, [isPlaying]);

  if (!currentVideo || playerMode !== "fullscreen") return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-[110] w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        aria-label="Close player"
      >
        <MdClose size={24} />
      </button>

      {/* Related Videos Toggle Button */}
      {showControls && relatedVideos.length > 0 && (
        <button
          onClick={() => setShowRelatedVideos(!showRelatedVideos)}
          className="absolute top-4 left-4 z-[110] px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-2 text-white hover:bg-black transition-colors"
          aria-label="Toggle related videos"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
          <span className="text-sm font-medium">
            Related ({relatedVideos.length})
          </span>
        </button>
      )}

      {/* Video Controls */}
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

      {/* Related Videos List */}
      <div className="absolute inset-x-0 bottom-0 z-[105] pointer-events-none">
        <div className="pointer-events-auto">
          <RelatedVideosList
            videos={relatedVideos}
            currentVideo={currentVideo}
            onVideoSelect={handleVideoSelect}
            isVisible={showRelatedVideos}
            onClose={() => setShowRelatedVideos(false)}
          />
        </div>
      </div>
    </div>
  );
};
