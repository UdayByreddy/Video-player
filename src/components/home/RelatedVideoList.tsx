import React, { useRef, useState} from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Video } from "../../types";
import { MdPlayArrow, MdClose } from "react-icons/md";

interface RelatedVideosListProps {
  videos: Video[];
  currentVideo: Video;
  onVideoSelect: (video: Video) => void;
  isVisible: boolean;
  onClose?: () => void;
}

export const RelatedVideosList: React.FC<RelatedVideosListProps> = ({
  videos,
  currentVideo,
  onVideoSelect,
  isVisible,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [_, setDragY] = useState(0);

  const handleDragEnd = (_: MouseEvent, info: PanInfo) => {
    // If dragged down more than 100px, close
    if (info.offset.y > 100) {
      onClose?.();
    }
    setDragY(0);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]"
          />

          {/* List Container with Drag */}
          <motion.div
            ref={containerRef}
            key="related-videos"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDrag={(_, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[121] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl shadow-2xl max-h-[75vh] overflow-hidden border-t border-gray-800"
            style={{ touchAction: "pan-y" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-xl border-b border-gray-800">
              {/* Drag Handle */}
              <div className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
                <div
                  role="separator"
                  aria-label="Drag handle"
                  className="w-12 h-1.5 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                />
              </div>

              {/* Title Bar */}
              <div className="flex items-center justify-between px-5 pb-4">
                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight">
                    Related Videos
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {videos.length} video{videos.length !== 1 ? "s" : ""} available
                  </p>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-all"
                    aria-label="Close"
                  >
                    <MdClose size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Videos List */}
            <div className="overflow-y-auto pb-6 px-4 max-h-[calc(75vh-120px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No related videos found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((video, index) => {
                    const isActive = video.slug === currentVideo.slug;

                    return (
                      <motion.div
                        key={video.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => !isActive && onVideoSelect(video)}
                        role="button"
                        tabIndex={isActive ? -1 : 0}
                        aria-disabled={isActive}
                        aria-label={`Play ${video.title}${isActive ? " (currently playing)" : ""}`}
                        onKeyDown={(e) => {
                          if (!isActive && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            onVideoSelect(video);
                          }
                        }}
                        className={`group relative flex gap-4 p-3 rounded-2xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50 cursor-default"
                            : "bg-gray-800/40 hover:bg-gray-800 border-2 border-transparent hover:border-gray-700 cursor-pointer"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-40 sm:w-44 aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-lg">
                          <img
                            src={video.thumbnailUrl ?? ""}
                            alt={video.title ?? "Video thumbnail"}
                            width="176"
                            height="99"
                            className={`w-full h-full object-contain transition-transform duration-300 ${
                              !isActive && "group-hover:scale-105"
                            }`}
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />

                          {/* Duration Badge */}
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white shadow-lg">
                              {video.duration}
                            </div>
                          )}

                          {/* Play Overlay for Active Video */}
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 flex items-center justify-center animate-pulse">
                                <MdPlayArrow className="w-6 h-6 text-white ml-0.5" />
                              </div>
                            </div>
                          )}

                          {/* Hover Play Icon for Non-Active Videos */}
                          {!isActive && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                                <MdPlayArrow className="w-6 h-6 text-gray-900 ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4
                            className={`font-semibold text-base line-clamp-2 mb-2 leading-tight ${
                              isActive
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                                : "text-white group-hover:text-blue-400"
                            } transition-colors`}
                          >
                            {video.title}
                          </h4>

                          {isActive ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                Now Playing
                              </span>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
                              Tap to play
                            </p>
                          )}
                        </div>

                        {/* Arrow Indicator for Non-Active Videos */}
                        {!isActive && (
                          <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};