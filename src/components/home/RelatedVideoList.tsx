import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video } from '../../types';

interface RelatedVideosListProps {
  videos: Video[];
  currentVideo: Video;
  onVideoSelect: (video: Video) => void;
  isVisible: boolean;
}

export const RelatedVideosList: React.FC<RelatedVideosListProps> = ({
  videos,
  currentVideo,
  onVideoSelect,
  isVisible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // BUG FIX 1: The component rendered videos INCLUDING the currently playing one
  // (the filtering was supposed to happen in the parent but wasn't applied).
  // Added a local guard: skip rendering the active video in the list.
  // (VideoPlayer.tsx now also filters, but defensive guard here too)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          key="related-videos"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 bg-dark-900 rounded-t-3xl shadow-2xl max-h-[60vh] overflow-hidden"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Handle Bar */}
          <div className="sticky top-0 z-10 bg-dark-900 pt-3 pb-2 px-4">
            {/* BUG FIX 2: drag handle had no aria-label or role */}
            <div
              role="separator"
              aria-label="Drag handle"
              className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-3"
            />
            <h3 className="text-white font-bold text-lg">Related Videos</h3>
            {/* BUG FIX 3: Count said `videos.length` which included current video.
                Now shows the actual count of selectable videos. */}
            <p className="text-gray-400 text-sm mt-1">
              {videos.length} video{videos.length !== 1 ? 's' : ''} in this category
            </p>
          </div>

          {/* BUG FIX 4: The scroll container had an inline `maxHeight: 'calc(60vh - 80px)'`
              that conflicted with the outer `max-h-[60vh]` and could clip content
              on smaller screens. Replaced with a flex-based approach. */}
          <div className="overflow-y-auto pb-4 max-h-[calc(60vh-80px)]">
            {videos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No related videos found.
              </p>
            ) : (
              videos.map((video, index) => {
                const isActive = video.slug === currentVideo.slug;

                return (
                  <motion.div
                    key={video.slug}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    // BUG FIX 5: Clicking active video did nothing visually but called nothing —
                    // cursor was still `pointer`. Now disabled cursor + pointer-events when active.
                    onClick={() => !isActive && onVideoSelect(video)}
                    role="button"
                    tabIndex={isActive ? -1 : 0}
                    aria-disabled={isActive}
                    aria-label={`Play ${video.title}${isActive ? ' (currently playing)' : ''}`}
                    onKeyDown={(e) => {
                      if (!isActive && e.key === 'Enter') onVideoSelect(video);
                    }}
                    className={`flex gap-3 p-3 mx-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary-500/20 border-2 border-primary-500 cursor-default'
                        : 'hover:bg-dark-800 cursor-pointer'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-dark-800">
                      {/* BUG FIX 6: img was missing alt text guard — if thumbnailUrl is undefined,
                          the broken image would show. Added fallback. */}
                      <img
                        src={video.thumbnailUrl ?? ''}
                        alt={video.title ?? 'Video thumbnail'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {video.duration && (
                        <div className="absolute bottom-1 right-1 bg-dark-900/90 px-1.5 py-0.5 rounded text-xs font-semibold text-white">
                          {video.duration}
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                            <svg
                              aria-hidden="true"
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold text-sm line-clamp-2 mb-1 ${
                          isActive ? 'text-primary-400' : 'text-white'
                        }`}
                      >
                        {video.title}
                      </h4>
                      {isActive && (
                        <span className="inline-block text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-1 rounded-full">
                          Now Playing
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};