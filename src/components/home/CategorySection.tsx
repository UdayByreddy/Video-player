import React from 'react';
import { motion } from 'framer-motion';
import { CategoryWithVideos } from '../../types';
import { VideoCard } from './VideoCard';

interface CategorySectionProps {
  categoryData: CategoryWithVideos;
  index: number;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categoryData, index }) => {
  const { category, contents } = categoryData;

  return (
    <motion.section
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
            className="w-6 h-6 object-contain"
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
        {contents.map((video, videoIndex) => (
          <VideoCard key={video.slug} video={video} index={videoIndex} />
        ))}
      </div>
    </motion.section>
  );
};