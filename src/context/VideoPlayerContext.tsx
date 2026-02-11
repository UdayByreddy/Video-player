/**
 * VideoPlayerContext.tsx
 * Stable YouTube portal with proper fullscreen/minimized switching
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

// ─────────────────────────────────────────────
// Context Shape
// ─────────────────────────────────────────────
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
  duration: number;
  volume: number;
  isMuted: boolean;
  handleSeek: (time: number) => void;
  handleSkip: (seconds: number) => void;
  handleVolumeChange: (newVolume: number) => void;
  handleMuteToggle: () => void;
  handleClose: () => void;
}

const VideoPlayerContext = createContext<
  VideoPlayerContextProps | undefined
>(undefined);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export const VideoPlayerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentVideo, setCurrentVideoState] = useState<Video | null>(null);
  const [playerMode, setPlayerModeState] =
    useState<PlayerMode>("hidden");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const playerRef = useRef<any | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  // ─────────────────────────────────────────────
  // Create stable portal container ONCE
  // ─────────────────────────────────────────────
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
      document.body.removeChild(portal);
    };
  }, []);

  // ─────────────────────────────────────────────
  // Apply layout (FULLSCREEN / MINIMIZED)
  // ─────────────────────────────────────────────
  const applyLayout = useCallback(
    (mode: PlayerMode) => {
      const portal = portalRef.current;
      if (!portal) return;

      if (mode === "hidden") {
        portal.style.display = "none";
        return;
      }

      portal.style.display = "block";

      if (mode === "fullscreen") {
        Object.assign(portal.style, {
          top: "0",
          left: "0",
          bottom: "auto",
          right: "auto",
          width: "100vw",
          height: "100vh",
          borderRadius: "0",
        });
      }

      if (mode === "minimized") {
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
    },
    []
  );

  // ─────────────────────────────────────────────
  // Safe setPlayerMode
  // ─────────────────────────────────────────────
  const setPlayerMode = useCallback(
    (mode: PlayerMode) => {
      applyLayout(mode);
      setPlayerModeState(mode);
    },
    [applyLayout]
  );

  // ─────────────────────────────────────────────
  // Load YouTube API once
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Set current video
  // ─────────────────────────────────────────────
  const setCurrentVideo = useCallback((video: Video | null) => {
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

    if (!video) {
      applyLayout("hidden");
      setPlayerModeState("hidden");
    }
  }, [applyLayout]);

  // ─────────────────────────────────────────────
  // Initialize YouTube player
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentVideo || !mountRef.current) return;

    mountRef.current.innerHTML = "";

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(
        mountRef.current!,
        {
          videoId: getVideoId(currentVideo.mediaUrl),
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (e: any) => {
              setDuration(e.target.getDuration());
              e.target.playVideo();
            },
            onStateChange: (e: any) => {
              setIsPlaying(
                e.data === window.YT.PlayerState.PLAYING
              );
            },
          },
        }
      );
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [currentVideo]);

  // ─────────────────────────────────────────────
  // Poll time
  // ─────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const t = playerRef.current.getCurrentTime?.();
        if (typeof t === "number") setCurrentTime(t);
      }
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying]);

  // ─────────────────────────────────────────────
  // Controls
  // ─────────────────────────────────────────────
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    const state = playerRef.current.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    const curr = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(curr + seconds, true);
  }, []);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      playerRef.current?.setVolume(newVolume * 100);
    },
    []
  );

  const handleMuteToggle = useCallback(() => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted((p) => !p);
  }, [isMuted]);

  const handleClose = useCallback(() => {
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
  }, [applyLayout]);

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
        duration,
        volume,
        isMuted,
        handleSeek,
        handleSkip,
        handleVolumeChange,
        handleMuteToggle,
        handleClose,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export const useVideoPlayer = () => {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx)
    throw new Error(
      "useVideoPlayer must be used within VideoPlayerProvider"
    );
  return ctx;
};

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
function getVideoId(url: string): string {
  if (url.includes("youtu.be/"))
    return url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("watch?v="))
    return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("/embed/"))
    return url.split("/embed/")[1].split("?")[0];
  return "";
}
