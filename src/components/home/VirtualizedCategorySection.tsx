import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CategoryWithVideos } from '../../types';
import { VideoCard } from './VideoCard';

interface VirtualizedCategorySectionProps {
  categoryData: CategoryWithVideos;
  index: number;
}

export const VirtualizedCategorySection: React.FC<VirtualizedCategorySectionProps> = ({
  categoryData,
  index,
}) => {
  const { category, contents } = categoryData;
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load more items when section is visible
            setVisibleRange((prev) => ({
              start: prev.start,
              end: Math.min(prev.end + 10, contents.length),
            }));
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [contents.length]);

  const visibleVideos = contents.slice(visibleRange.start, visibleRange.end);
  const hasMore = visibleRange.end < contents.length;

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-5 px-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
          <img
            src={category.iconUrl}
            alt={category.name}
            width="24"
            height="24"
            className="w-6 h-6 object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <h2 className="text-xl font-display text-white tracking-tight">
            {category.name}
          </h2>
          <p className="text-xs text-gray-400">{contents.length} videos</p>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleVideos.map((video, videoIndex) => (
          <VideoCard key={video.slug} video={video} index={videoIndex} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6 px-4">
          <button
            onClick={() =>
              setVisibleRange((prev) => ({
                start: prev.start,
                end: Math.min(prev.end + 20, contents.length),
              }))
            }
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            Load More ({contents.length - visibleRange.end} remaining)
          </button>
        </div>
      )}
    </motion.section>
  );
};