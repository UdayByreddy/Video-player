import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { VideoControls } from './Videocontrol';
// import { getYouTubeEmbedUrl } from '../../utils/getYouTubeEmbedUrl';
import { useVideoPlayer } from '../../context/VideoPlayerContext';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const VideoPlayer: React.FC = () => {
  const { currentVideo, setCurrentVideo, playerMode, setPlayerMode } = useVideoPlayer();

  const iframeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Load YouTube API once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize Player
  useEffect(() => {
    if (!currentVideo) return;

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: getVideoId(currentVideo.mediaUrl),
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    // If API already loaded
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, [currentVideo]);

  // Sync current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    const state = playerRef.current.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (time: number) => {
    playerRef.current?.seekTo(time, true);
  };

  const handleSkip = (seconds: number) => {
    const current = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(current + seconds, true);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume * 100);
  };

  const handleMuteToggle = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }

    setIsMuted(!isMuted);
  };

  const handleClose = () => {
    playerRef.current?.destroy();
    setCurrentVideo(null);
    setPlayerMode('hidden');
  };

  if (!currentVideo || playerMode !== 'fullscreen') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* YouTube Player Container */}
        <div className="w-full h-full flex items-center justify-center">
          <div ref={iframeRef} className="w-full h-full" />
        </div>

        {/* Custom Controls */}
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={false}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSkip={handleSkip}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onFullscreenToggle={() => {}}
          showControls={true}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Helper
function getVideoId(url: string): string {
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  }
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1].split('&')[0];
  }
  if (url.includes('/embed/')) {
    return url.split('/embed/')[1].split('?')[0];
  }
  return '';
}
