import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPlayArrow,
  MdPause,
  MdVolumeUp,
  MdVolumeOff,
  MdFullscreen,
  MdFullscreenExit,
} from 'react-icons/md';
import formatTime from '../../utils/formatTime';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  showControls: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onSkip,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  showControls,
}) => {
  const skipFeedbackTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [showSkipFeedback, setShowSkipFeedback] = useState<{
    direction: 'forward' | 'backward';
  } | null>(null);
  
  // NEW: Add state for seeking
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const previewProgress = seekPreview !== null ? (seekPreview / duration) * 100 : progress;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(percent * duration, duration));
    onSeek(newTime);
  };

  // NEW: Mouse move handler for seek preview
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const previewTime = Math.max(0, Math.min(percent * duration, duration));
    setSeekPreview(previewTime);
  };

  const handleProgressMouseLeave = () => {
    setSeekPreview(null);
  };

  // NEW: Drag handlers for smooth seeking
  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleProgressClick(e);
  };

  React.useEffect(() => {
    if (!isSeeking) return;

    const handleMouseMove = (e: MouseEvent) => {
      const progressBar = document.getElementById('progress-bar');
      if (!progressBar || duration <= 0) return;
      
      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
      const newTime = percent * duration;
      onSeek(newTime);
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSeeking, duration, onSeek]);

  const handleSkipClick = useCallback(
    (seconds: number) => {
      onSkip(seconds);
      if (skipFeedbackTimerRef.current) clearTimeout(skipFeedbackTimerRef.current);
      setShowSkipFeedback({ direction: seconds > 0 ? 'forward' : 'backward' });
      skipFeedbackTimerRef.current = setTimeout(() => setShowSkipFeedback(null), 600);
    },
    [onSkip]
  );

  React.useEffect(() => {
    return () => {
      if (skipFeedbackTimerRef.current) clearTimeout(skipFeedbackTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          key="controls-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex flex-col justify-end"
          style={{ pointerEvents: 'none' }}
        >
          {/* Skip feedback */}
          <AnimatePresence>
            {showSkipFeedback && (
              <motion.div
                key="skip-feedback"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <div className="bg-black/80 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    {showSkipFeedback.direction === 'forward' ? (
                      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                    ) : (
                      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                    )}
                  </svg>
                  <span className="text-white font-bold text-lg">
                    {showSkipFeedback.direction === 'forward' ? '+10s' : '-10s'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom gradient + controls */}
          <div
            className="w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-16 space-y-3"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Progress Bar - IMPROVED */}
            <div
              id="progress-bar"
              role="slider"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              tabIndex={0}
              className="w-full h-2 bg-white/30 rounded-full cursor-pointer group relative"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseLeave={handleProgressMouseLeave}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') handleSkipClick(10);
                if (e.key === 'ArrowLeft') handleSkipClick(-10);
              }}
            >
              {/* Preview hover time tooltip */}
              {seekPreview !== null && (
                <div
                  className="absolute -top-10 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap"
                  style={{ left: `${previewProgress}%` }}
                >
                  {formatTime(seekPreview)}
                </div>
              )}

              {/* Filled portion with smooth transition */}
              <div
                className="h-full bg-blue-500 rounded-full relative"
                style={{ 
                  width: `${previewProgress}%`,
                  transition: isSeeking ? 'none' : 'width 0.1s ease-out'
                }}
              >
                {/* Scrubber thumb */}
                <div 
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${
                    isSeeking || seekPreview !== null ? 'scale-100' : 'scale-0 group-hover:scale-100'
                  }`}
                />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center gap-4">
                {/* Skip back */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSkipClick(-10)}
                  aria-label="Skip back 10 seconds"
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                  </svg>
                </motion.button>

                {/* Play / Pause */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onPlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  {isPlaying ? (
                    <MdPause className="text-2xl" />
                  ) : (
                    <MdPlayArrow className="text-2xl ml-0.5" />
                  )}
                </motion.button>

                {/* Skip forward */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSkipClick(10)}
                  aria-label="Skip forward 10 seconds"
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </motion.button>

                {/* Timestamp */}
                <span className="text-white text-sm font-medium tabular-nums ml-1 select-none">
                  {duration > 0
                    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                    : '--:-- / --:--'}
                </span>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Volume (desktop only) */}
                <div className="hidden md:flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMuteToggle}
                    aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <MdVolumeOff className="text-2xl" />
                    ) : (
                      <MdVolumeUp className="text-2xl" />
                    )}
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                    aria-label="Volume"
                    className="w-20 accent-blue-500 cursor-pointer"
                  />
                </div>

                {/* Fullscreen toggle */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onFullscreenToggle}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isFullscreen ? (
                    <MdFullscreenExit className="text-2xl" />
                  ) : (
                    <MdFullscreen className="text-2xl" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};