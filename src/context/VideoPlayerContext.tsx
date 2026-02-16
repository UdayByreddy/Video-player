/**
 * VideoPlayerContext.tsx
 */

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { PlayerMode, Video } from "../types";
import { videoData } from "../data/video";
import { getVideoId } from "../utils/getVideoId";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface VideoPlayerContextProps {
  currentVideo: Video | null;
  setCurrentVideo: (video: Video | null) => void;
  playerMode: PlayerMode;
  setPlayerMode: (mode: PlayerMode) => void;
  playerRef: React.MutableRefObject<any | null>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  handlePlayPause: () => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  isMuted: boolean;
  handleSeek: (time: number) => void;
  handleSkip: (seconds: number) => void;
  handleVolumeChange: (newVolume: number) => void;
  handleMuteToggle: () => void;
  handleClose: () => void;
  nextVideo: Video | null;
  autoPlayEnabled: boolean;
  setAutoPlayEnabled: (enabled: boolean) => void;
  showAutoPlayCountdown: boolean;
  autoPlayCountdown: number;
  cancelAutoPlay: () => void;
  startAutoPlayCountdown: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextProps | undefined>(
  undefined
);

export const VideoPlayerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentVideo, setCurrentVideoState] = useState<Video | null>(null);
  const [playerMode, setPlayerModeState] = useState<PlayerMode>("hidden");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [showAutoPlayCountdown, setShowAutoPlayCountdown] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(5);

  const playerRef = useRef<any | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const savedTimeRef = useRef<number>(0); 
  const previousVideoSlugRef = useRef<string | null>(null); 

  // Get next video
  const getNextVideo = useCallback((): Video | null => {
    if (!currentVideo) return null;

    const currentCategory = videoData.categories.find((cat) =>
      cat.contents.some((content) => content.slug === currentVideo.slug)
    );

    if (!currentCategory) return null;

    const currentIndex = currentCategory.contents.findIndex(
      (v) => v.slug === currentVideo.slug
    );

    if (
      currentIndex === -1 ||
      currentIndex === currentCategory.contents.length - 1
    ) {
      return null;
    }

    return currentCategory.contents[currentIndex + 1];
  }, [currentVideo]);

  const nextVideo = getNextVideo();

  // Auto-play countdown
  const startAutoPlayCountdown = useCallback(() => {
    if (!autoPlayEnabled || !nextVideo) return;

    console.log('Starting autoplay countdown...');
    setShowAutoPlayCountdown(true);
    setAutoPlayCountdown(5);

    countdownIntervalRef.current = setInterval(() => {
      setAutoPlayCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoPlayTimerRef.current = setTimeout(() => {
      setShowAutoPlayCountdown(false);
      console.log('Autoplay triggering next video:', nextVideo.slug);
      setCurrentVideoState(nextVideo);
    }, 5000);
  }, [autoPlayEnabled, nextVideo]);

  const cancelAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setShowAutoPlayCountdown(false);
    setAutoPlayCountdown(5);
  }, []);

  // Create portal for minimized mode ONLY
  useEffect(() => {
    const portal = document.createElement("div");
    Object.assign(portal.style, {
      position: "fixed",
      background: "#000",
      zIndex: "50",
      display: "none",
      transition: "all 0.25s ease",
    });

    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";

    portal.appendChild(mount);
    document.body.appendChild(portal);

    portalRef.current = portal;
    mountRef.current = mount;

    return () => {
      if (document.body.contains(portal)) {
        document.body.removeChild(portal);
      }
    };
  }, []);

  // Apply layout
  const applyLayout = useCallback((mode: PlayerMode) => {
    const portal = portalRef.current;
    if (!portal) return;

    // Hide portal in fullscreen and hidden modes
    if (mode === "hidden" || mode === "fullscreen") {
      portal.style.display = "none";
      return;
    }

    // Show portal only in minimized mode
    if (mode === "minimized") {
      portal.style.display = "block";
      Object.assign(portal.style, {
        top: "auto",
        left: "auto",
        right: "16px",
        bottom: "80px",
        width: "320px",
        height: "180px",
        borderRadius: "12px",
      });
    }
  }, []);

  const setPlayerMode = useCallback(
    (mode: PlayerMode) => {
      if (playerRef.current && mode !== playerMode) {
        try {
          const time = playerRef.current.getCurrentTime?.() || 0;
          savedTimeRef.current = time;
          console.log('Saving playback position:', time);
        } catch (e) {
          console.log('Error getting current time:', e);
        }
      }

      // Destroy player when switching modes
      if (playerRef.current && mode !== playerMode) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log("Error destroying player:", e);
        }
        playerRef.current = null;
      }

      applyLayout(mode);
      setPlayerModeState(mode);
    },
    [applyLayout, playerMode]
  );

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Set current video
  const setCurrentVideo = useCallback(
    (video: Video | null) => {
      cancelAutoPlay();

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }

      setCurrentVideoState(video);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      savedTimeRef.current = 0;
      
      // Update previous video tracker
      if (video) {
        previousVideoSlugRef.current = video.slug;
      } else {
        previousVideoSlugRef.current = null;
      }

      if (!video) {
        applyLayout("hidden");
        setPlayerModeState("hidden");
      }
    },
    [applyLayout, cancelAutoPlay]
  );

  // Reset saved time when video changes (including autoplay)
  useEffect(() => {
    if (currentVideo && currentVideo.slug !== previousVideoSlugRef.current) {
      console.log('NEW VIDEO detected, resetting saved time. Old:', previousVideoSlugRef.current, 'New:', currentVideo.slug);
      savedTimeRef.current = 0;
      setCurrentTime(0);
      previousVideoSlugRef.current = currentVideo.slug;
    } else if (currentVideo) {
      console.log('SAME VIDEO, keeping saved time:', savedTimeRef.current);
    }
  }, [currentVideo?.slug]); // Only trigger on actual video change

  // Initialize player ONLY in minimized mode
  useEffect(() => {
    if (playerMode !== "minimized" || !currentVideo || !mountRef.current) {
      return;
    }

    mountRef.current.innerHTML = "";

    const initPlayer = () => {
      const videoId = getVideoId(currentVideo.mediaUrl);
      const startTime = savedTimeRef.current;

      playerRef.current = new window.YT.Player(mountRef.current!, {
        videoId: videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: Math.floor(startTime), // Resume from saved position
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
            
            // Seek to saved position if we have one
            if (startTime > 0) {
              console.log('Seeking to saved position:', startTime);
              e.target.seekTo(startTime, true);
            }
            
            e.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (e: any) => {
            const playing = e.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(playing);

            if (e.data === window.YT.PlayerState.ENDED) {
              startAutoPlayCountdown();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [playerMode, currentVideo, startAutoPlayCountdown]);

  // Poll time
  useEffect(() => {
    const id = setInterval(() => {
      if (playerRef.current && isPlaying) {
        try {
          const t = playerRef.current.getCurrentTime?.();
          if (typeof t === "number") setCurrentTime(t);
        } catch (e) {
          console.log("Error getting current time:", e);
        }
      }
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Controls
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.log("Error in play/pause:", e);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(time, true);
        setCurrentTime(time);
      } catch (e) {
        console.log("Error seeking:", e);
      }
    }
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    if (playerRef.current) {
      try {
        const curr = playerRef.current.getCurrentTime() || 0;
        playerRef.current.seekTo(curr + seconds, true);
      } catch (e) {
        console.log("Error skipping:", e);
      }
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(newVolume * 100);
      } catch (e) {
        console.log("Error setting volume:", e);
      }
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted((p) => !p);
    } catch (e) {
      console.log("Error toggling mute:", e);
    }
  }, [isMuted]);

  const handleClose = useCallback(() => {
    cancelAutoPlay();

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {}
      playerRef.current = null;
    }

    applyLayout("hidden");

    setCurrentVideoState(null);
    setPlayerModeState("hidden");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    savedTimeRef.current = 0;
  }, [applyLayout, cancelAutoPlay]);

  useEffect(() => {
    return () => {
      cancelAutoPlay();
    };
  }, [cancelAutoPlay]);

  return (
    <VideoPlayerContext.Provider
      value={{
        currentVideo,
        setCurrentVideo,
        playerMode,
        setPlayerMode,
        playerRef,
        isPlaying,
        setIsPlaying,
        handlePlayPause,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        volume,
        isMuted,
        handleSeek,
        handleSkip,
        handleVolumeChange,
        handleMuteToggle,
        handleClose,
        nextVideo,
        autoPlayEnabled,
        setAutoPlayEnabled,
        showAutoPlayCountdown,
        autoPlayCountdown,
        cancelAutoPlay,
        startAutoPlayCountdown,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx)
    throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
};
