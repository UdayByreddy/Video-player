import { useVideoPlayer } from "../../context/VideoPlayerContext"
import { motion } from "framer-motion";
import { Video } from "../../types";

interface VideoCardProps {
    video: Video;
    index: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
   const { setCurrentVideo, setPlayerMode } = useVideoPlayer();

  const handleClick = () => {
    setCurrentVideo(video);
    setPlayerMode('fullscreen');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-800 shadow-lg">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-scale-down transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
    
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-dark-900/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-xs font-semibold text-white">{video.duration}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
          >
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
      </div>
    </motion.div>
  );
}
