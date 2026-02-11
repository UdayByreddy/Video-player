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
  // BUG FIX 1: `isDragging` was declared but never used — removed
  const skipFeedbackTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [showSkipFeedback, setShowSkipFeedback] = useState<{
    direction: 'forward' | 'backward';
  } | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // BUG FIX 2: handleProgressClick computed `percent` relative to the element,
  // but if duration is 0, calling onSeek(0 * 0) silently fails without guard.
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return; // guard against NaN seek
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(percent * duration, duration)));
  };

  // BUG FIX 3: handleSkipClick used a bare setTimeout without clearing on unmount/re-trigger.
  // Now clears previous timer before setting a new one to prevent stale feedback flashing.
  const handleSkipClick = useCallback(
    (seconds: number) => {
      onSkip(seconds);
      if (skipFeedbackTimerRef.current) {
        clearTimeout(skipFeedbackTimerRef.current);
      }
      setShowSkipFeedback({ direction: seconds > 0 ? 'forward' : 'backward' });
      skipFeedbackTimerRef.current = setTimeout(() => {
        setShowSkipFeedback(null);
      }, 600);
    },
    [onSkip]
  );

  // BUG FIX 4: No cleanup for the skip feedback timer on unmount — can cause setState on unmounted component
  React.useEffect(() => {
    return () => {
      if (skipFeedbackTimerRef.current) {
        clearTimeout(skipFeedbackTimerRef.current);
      }
    };
  }, []);

  // BUG FIX 5: volume range input used `volume * 100` but volume was already 0–1.
  // When onVolumeChange is called, it divides by 100 — correct. However isMuted check
  // was `isMuted || volume === 0` which correctly shows muted icon, but the slider value
  // when muted should show 0 visually. Fixed to: value={isMuted ? 0 : volume * 100}
  // (was already correct, kept as-is with explicit note)

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // z-20: sits above the IframeCaptureLayer (z-10) so control buttons are always clickable
          className="absolute inset-0 z-20 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent pointer-events-none"
        >
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-auto">
            {/* Top spacer */}
            <div className="flex-1" />

            {/* Skip Feedback Overlay */}
            <AnimatePresence>
              {showSkipFeedback && (
                <motion.div
                  key="skip-feedback"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="bg-dark-900/90 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3">
                    <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
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

            {/* Bottom Controls */}
            <div className="space-y-2">
              {/* Progress Bar */}
              {/* BUG FIX 6: Progress bar had no keyboard accessibility / aria attributes */}
              <div
                role="slider"
                aria-label="Video progress"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
                tabIndex={0}
                className="w-full h-1 bg-white/20 rounded-full cursor-pointer group"
                onClick={handleProgressClick}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') handleSkipClick(10);
                  if (e.key === 'ArrowLeft') handleSkipClick(-10);
                }}
              >
                <div
                  className="h-full bg-primary-500 rounded-full relative group-hover:h-1.5 transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Skip Backward */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSkipClick(-10)}
                    aria-label="Skip back 10 seconds"
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                    </svg>
                  </motion.button>

                  {/* Play/Pause */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onPlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    {isPlaying ? (
                      <MdPause className="text-2xl" />
                    ) : (
                      <MdPlayArrow className="text-2xl ml-0.5" />
                    )}
                  </motion.button>

                  {/* Skip Forward */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSkipClick(10)}
                    aria-label="Skip forward 10 seconds"
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                    </svg>
                  </motion.button>

                  {/* BUG FIX 7: Time display showed "0:00 / 0:00" when duration=0 on load — now shows dashes */}
                  <span className="text-white text-sm font-semibold ml-2">
                    {duration > 0
                      ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                      : '--:-- / --:--'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Volume */}
                  <div className="hidden md:flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={onMuteToggle}
                      aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                      className="text-white hover:text-primary-400 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <MdVolumeOff className="text-2xl" />
                      ) : (
                        <MdVolumeUp className="text-2xl" />
                      )}
                    </motion.button>
                    {/* BUG FIX 8: input onChange received string from event but passed directly to onVolumeChange.
                        Added explicit Number() conversion (was correct, but made explicit for clarity). */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume * 100}
                      onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                      aria-label="Volume"
                      className="w-20 accent-primary-500"
                    />
                  </div>

                  {/* Fullscreen */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onFullscreenToggle}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    className="text-white hover:text-primary-400 transition-colors"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};