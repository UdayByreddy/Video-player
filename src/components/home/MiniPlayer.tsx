
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPlayArrow, MdPause, MdClose, MdOpenInFull } from "react-icons/md";
import { useVideoPlayer } from "../../context/VideoPlayerContext";

export const MiniPlayer: React.FC = () => {
  const {
    currentVideo,
    playerMode,
    setPlayerMode,
    isPlaying,
    handlePlayPause,
    handleClose,
  } = useVideoPlayer();

  if (!currentVideo || playerMode !== "minimized") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="mini-controls"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        // Sits directly below the portal video (portal bottom: 80px, height 180px)
        // This strip is 64px, lives at bottom: 16px, right: 16px, width: 320px
        className="fixed z-[10000]"
        style={{ bottom: 16, right: 16, width: 320 }}
      >
        <div className="bg-dark-800 border border-dark-700 rounded-b-2xl shadow-2xl overflow-hidden">
          {/* Expand hit-area (invisible overlay over the video portal) */}
          <button
            onClick={() => setPlayerMode("fullscreen")}
            aria-label="Expand to fullscreen"
            className="absolute -top-[180px] left-0 w-full h-[180px] cursor-pointer group z-10 flex items-center justify-center"
            style={{ pointerEvents: "auto" }}
          >
            {/* Hover hint */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <MdOpenInFull size={22} />
            </span>
          </button>

          {/* Controls strip */}
          <div className="p-3 flex items-center gap-3 bg-dark-800 text-white">
            {/* Play / Pause */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white flex-shrink-0 hover:bg-primary-600 transition-colors"
            >
              {isPlaying ? (
                <MdPause className="text-xl" />
              ) : (
                <MdPlayArrow className="text-xl ml-0.5" />
              )}
            </motion.button>

            {/* Title */}
            <button
              onClick={() => setPlayerMode("fullscreen")}
              className="flex-1 min-w-0 text-left"
            >
              <h3 className="text-white font-semibold text-sm line-clamp-1 hover:text-primary-400 transition-colors">
                {currentVideo.title}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Tap to expand</p>
            </button>

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