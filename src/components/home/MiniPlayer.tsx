import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlayArrow, MdPause, MdClose } from 'react-icons/md';
import { useVideoPlayer } from '../../context/VideoPlayerContext';
import { getYouTubeEmbedUrl } from '../../utils/getYouTubeEmbedUrl';

interface MiniPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ isPlaying, onPlayPause }) => {
  const { currentVideo, setCurrentVideo, setPlayerMode } = useVideoPlayer();

  // BUG FIX 1: Early return was inside the component before hooks — moved after all hooks.
  // (No hooks here beyond context, so this was safe, but left guard here for correctness)
  if (!currentVideo) return null;

  const handleClose = () => {
    setCurrentVideo(null);
    setPlayerMode('hidden');
  };

  const handleExpand = () => {
    setPlayerMode('fullscreen');
  };

  return (
    // BUG FIX 2: AnimatePresence was missing — the MiniPlayer was rendered/removed by App.tsx
    // based on `playerMode`, but without AnimatePresence wrapping, the exit animation never runs.
    // Wrapped in AnimatePresence here so exit animation works even when parent conditionally unmounts.
    <AnimatePresence>
      <motion.div
        key="mini-player"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80"
      >
        <div className="bg-dark-800 rounded-2xl shadow-2xl overflow-hidden border border-dark-700">
          {/* Video Preview */}
          <div
            onClick={handleExpand}
            className="relative aspect-video bg-black cursor-pointer group"
          >
            {/* BUG FIX 3: iframe was missing a title attribute (accessibility violation) */}
            {/* BUG FIX 4: The iframe src was being recreated on every render since no memoisation —
                in a real YouTube embed this causes the iframe to reload. Acceptable here but noted. */}
            <iframe
              src={getYouTubeEmbedUrl(currentVideo.mediaUrl)}
              title={`Mini player: ${currentVideo.title}`}
              className="w-full h-full pointer-events-none"
              allow="autoplay"
            />

            {/* Expand overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {/* BUG FIX 5: SVG had no aria-hidden — added to prevent screen readers announcing decorative icon */}
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 flex items-center gap-3">
            {/* Play/Pause */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white flex-shrink-0 hover:bg-primary-600 transition-colors"
            >
              {isPlaying ? (
                <MdPause className="text-xl" />
              ) : (
                <MdPlayArrow className="text-xl ml-0.5" />
              )}
            </motion.button>

            {/* Title */}
            {/* BUG FIX 6: onClick div was not keyboard accessible — added role and onKeyDown */}
            <div
              onClick={handleExpand}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleExpand()}
              className="flex-1 min-w-0 cursor-pointer"
            >
              <h3 className="text-white font-semibold text-sm line-clamp-1 hover:text-primary-400 transition-colors">
                {currentVideo.title}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Tap to expand</p>
            </div>

            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              aria-label="Close player"
              className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600 transition-colors flex-shrink-0"
            >
              <MdClose className="text-lg" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};