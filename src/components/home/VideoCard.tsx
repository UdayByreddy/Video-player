import { useVideoPlayer } from "../../context/VideoPlayerContext";
import { motion } from "framer-motion";
import { Video } from "../../types";
import { useState, useEffect } from "react";

interface VideoCardProps {
  video: Video;
  index: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
  const { setCurrentVideo, setPlayerMode } = useVideoPlayer();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Preload critical images
  useEffect(() => {
    if (index < 4) {
      const img = new Image();
      img.src = video.thumbnailUrl;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
    }
  }, [video.thumbnailUrl, index]);

  const handleClick = () => {
    setCurrentVideo(video);
    setPlayerMode("fullscreen");
  };

  // Use priority loading for first row
  const isPriority = index < 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isPriority ? 0 : index * 0.05, duration: 0.3 }}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-800 shadow-lg">
        {/* Optimized loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-dark-700 via-dark-800 to-dark-700 animate-pulse" />
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Optimized image */}
        {!imageError && (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            width="320"
            height="180"
            className={`w-full h-full object-contain transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105`}
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index < 2 ? "high" : "auto"}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Gradient overlay - only show when image loaded */}
        {imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        )}

        {/* Duration badge */}
        {video.duration && imageLoaded && (
          <div className="absolute bottom-2 right-2 bg-dark-900/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-xs font-semibold text-white">
              {video.duration}
            </span>
          </div>
        )}

        {/* Play button overlay */}
        {imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
            >
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-3 px-1">
        <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
      </div>
    </motion.div>
  );
};