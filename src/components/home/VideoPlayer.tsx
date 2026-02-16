import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdClose } from "react-icons/md";
import { VideoControls } from "./Videocontrol";
import { useVideoPlayer } from "../../context/VideoPlayerContext";
import { Video } from "../../types";
import { videoData } from "../../data/video";
import { RelatedVideosList } from "./RelatedVideoList";
import { motion, AnimatePresence } from "framer-motion";
import { getVideoId } from "../../utils/getVideoId";

export const VideoPlayer: React.FC = () => {
  const {
    currentVideo,
    playerMode,
    setPlayerMode,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    isMuted,
    handlePlayPause,
    handleSeek,
    handleSkip,
    handleVolumeChange,
    handleMuteToggle,
    handleClose,
    setCurrentVideo,
    nextVideo,
    showAutoPlayCountdown,
    autoPlayCountdown,
    cancelAutoPlay,
    startAutoPlayCountdown,
    playerRef,
  } = useVideoPlayer();

  const [showControls, setShowControls] = useState(true);
  const [showRelatedVideos, setShowRelatedVideos] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const previousVideoSlugRef = useRef<string | null>(null); // Track video changes

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) setShowControls(false);
    }, 3000);
  }, [isPlaying, isDragging]);

  // Drag handlers
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    setShowControls(false);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const offset = clientY - dragStartY.current;
    if (offset > 0) {
      setDragOffset(offset);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > 150) {
      setPlayerMode("minimized");
    }

    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const getRelatedVideos = (): Video[] => {
    if (!currentVideo) return [];
    const currentCategory = videoData.categories.find((cat) =>
      cat.contents.some((content) => content.slug === currentVideo.slug)
    );
    if (!currentCategory) return [];
    return currentCategory.contents.filter(
      (video) => video.slug !== currentVideo.slug
    );
  };

  const relatedVideos = getRelatedVideos();

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setShowRelatedVideos(false);
    setPlayerReady(false);
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

  // Initialize YouTube player in fullscreen mode
  useEffect(() => {
    if (
      playerMode !== "fullscreen" ||
      !currentVideo ||
      !videoContainerRef.current
    )
      return;

    setPlayerReady(false);
    videoContainerRef.current.innerHTML = "";

    const iframeContainer = document.createElement("div");
    iframeContainer.id = "youtube-player-fullscreen";
    iframeContainer.style.width = "100%";
    iframeContainer.style.height = "100%";
    videoContainerRef.current.appendChild(iframeContainer);

    const initPlayer = () => {
      const videoId = getVideoId(currentVideo.mediaUrl);
      
      // Check if this is the same video or a new one
      const isSameVideo = previousVideoSlugRef.current === currentVideo.slug;
      const startTime = isSameVideo ? currentTime : 0;
      
      console.log('Fullscreen init - Same video?', isSameVideo, 'Start time:', startTime, 'Slug:', currentVideo.slug);
      
      // Update the ref to current video
      previousVideoSlugRef.current = currentVideo.slug;

      playerRef.current = new (window as any).YT.Player(iframeContainer, {
        videoId: videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1, 
          fs: 0, 
          modestbranding: 1, 
          rel: 0, 
          playsinline: 1,
          iv_load_policy: 3, 
          cc_load_policy: 0, 
          showinfo: 0, 
          autohide: 1, 
          start: Math.floor(startTime), 
        },
        events: {
          onReady: (e: any) => {
            console.log("Fullscreen player ready");
            setDuration(e.target.getDuration());
            if (isSameVideo && startTime > 0) {
              console.log('Same video - seeking to position:', startTime);
              e.target.seekTo(startTime, true);
            } else {
              console.log('New video - starting from beginning');
            }
            setTimeout(() => {
              e.target.playVideo();
              setIsPlaying(true);
              setPlayerReady(true);
            }, 100);
          },
          onStateChange: (e: any) => {
            const playing = e.data === (window as any).YT.PlayerState.PLAYING;
            setIsPlaying(playing);

            // Hide YouTube UI when playing
            if (playing) {
              setPlayerReady(true);
            }

            if (e.data === (window as any).YT.PlayerState.ENDED) {
              // Video ended - trigger autoplay countdown
              console.log('Video ended in fullscreen, starting autoplay countdown');
              setIsPlaying(false);
              startAutoPlayCountdown();
            }
          },
          onError: (e: any) => {
            console.error("YouTube player error:", e);
            setPlayerReady(true); // Show controls even on error
          },
        },
      });
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    // Poll current time for fullscreen player
    const timeInterval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        try {
          const t = playerRef.current.getCurrentTime?.();
          if (typeof t === "number") setCurrentTime(t);
        } catch (e) {
          console.log("Error getting time:", e);
        }
      }
    }, 500);

    return () => {
      clearInterval(timeInterval);
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = "";
      }
    };
  }, [playerMode, currentVideo]);

  // Hide YouTube UI elements with CSS
  useEffect(() => {
    // Add global CSS to hide YouTube UI
    const style = document.createElement("style");
    style.id = "youtube-ui-hide";
    style.innerHTML = `
      /* Hide all YouTube UI controls and overlays */
      .ytp-chrome-top,
      .ytp-chrome-bottom,
      .ytp-gradient-top,
      .ytp-gradient-bottom,
      .ytp-show-cards-title,
      .ytp-pause-overlay,
      .ytp-watermark,
      .ytp-title,
      .ytp-chrome-controls,
      .ytp-cards-teaser,
      .ytp-endscreen-content,
      .ytp-ce-element,
      .ytp-suggested-action,
      .ytp-cued-thumbnail-overlay,
      .ytp-paid-content-overlay,
      .ytp-scroll-min,
      .ytp-scroll-max,
      .ytp-big-mode .ytp-chrome-top,
      .ytp-button,
      .ytp-settings-button,
      .ytp-menuitem,
      .ytp-iv-player-content {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
      
      /* Keep video playable but hide all UI */
      #youtube-player-fullscreen iframe {
        position: relative;
        z-index: 1;
      }
    `;

    if (!document.getElementById("youtube-ui-hide")) {
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById("youtube-ui-hide");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  if (!currentVideo || playerMode !== "fullscreen") return null;

  const scale = Math.max(0.3, 1 - dragOffset / 800);
  const opacity = Math.max(0, 1 - dragOffset / 400);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      style={{
        transform: `translateY(${dragOffset}px) scale(${scale})`,
        opacity,
        transition: isDragging ? "none" : "all 0.3s ease-out",
      }}
      onMouseMove={!isDragging ? resetHideTimer : undefined}
      onTouchStart={!isDragging ? resetHideTimer : undefined}
    >
      {/* Video Container */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 w-full h-full bg-black z-[1]"
      />

      {/* Loading Overlay */}
      {!playerReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-[200]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-lg font-semibold">Loading video...</p>
          </div>
        </div>
      )}

      {/* Clickable Overlay - catches clicks for showing controls */}
      {playerReady && (
        <div
          className="absolute inset-0 z-[10]"
          onClick={resetHideTimer}
        />
      )}

      {/* Drag Handle Area */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-[150] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-full" />
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-[150] w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
        aria-label="Close player"
      >
        <MdClose size={24} />
      </button>

      {/* Related Videos Toggle Button */}
      {showControls && relatedVideos.length > 0 && !isDragging && playerReady && (
        <button
          onClick={() => setShowRelatedVideos(!showRelatedVideos)}
          className="absolute top-4 left-4 z-[150] px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-2 text-white hover:bg-black transition-colors"
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

      {/* Auto-Play Next Video Countdown */}
      <AnimatePresence>
        {showAutoPlayCountdown && nextVideo && playerReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-32 right-4 z-[150] bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                <img
                  src={nextVideo.thumbnailUrl}
                  alt={nextVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white font-bold text-2xl">
                    {autoPlayCountdown}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs mb-1">Up Next</p>
                <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                  {nextVideo.title}
                </h4>
                <button
                  onClick={cancelAutoPlay}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      {playerReady && (
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
          onFullscreenToggle={() => setPlayerMode("minimized")}
          showControls={showControls && !isDragging}
        />
      )}

      {/* Related Videos List */}
      {playerReady && (
        <div className="absolute inset-x-0 bottom-0 z-[120] pointer-events-none">
          <div className="pointer-events-auto">
            <RelatedVideosList
              videos={relatedVideos}
              currentVideo={currentVideo}
              onVideoSelect={handleVideoSelect}
              isVisible={showRelatedVideos && !isDragging}
              onClose={() => setShowRelatedVideos(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};