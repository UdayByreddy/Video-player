// HomePage.tsx — Fixed
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdVideoLibrary } from 'react-icons/md';
import { videoData } from '../data/video';
import { CategorySection } from '../components/home/CategorySection';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = searchQuery
    ? videoData.categories
        .map(cat => ({
          ...cat,
          contents: cat.contents.filter(video =>
            video.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(cat => cat.contents.length > 0)
    : videoData.categories;

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <MdVideoLibrary className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-display text-white tracking-tight">
                Video<span className="text-primary-500">Player</span>
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          {/* BUG FIX 1: Input had `text-black` class which made text invisible on dark background.
              Changed to `text-white`. */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search videos"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            {/* BUG FIX 2: Search icon SVG had no aria-hidden — it's decorative */}
            <svg
              aria-hidden="true"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {/* BUG FIX 3: No clear/reset button for the search input — added one */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="pt-6">
        <AnimatePresence mode="wait">
          {filteredCategories.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredCategories.map((category, index) => (
                <CategorySection
                  key={category.category.slug}
                  categoryData={category}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 px-4"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800 flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
              <p className="text-gray-400">Try a different search term</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};