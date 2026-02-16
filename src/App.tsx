import { useEffect, useState } from 'react';
import { VideoPlayerProvider } from './context/VideoPlayerContext';
import { HomePage } from './pages/HomePage';
import { videoData } from './data/video';
import { VideoPlayer } from './components/home/VideoPlayer';
import { MiniPlayer } from './components/home/MiniPlayer';
import { preloadCriticalImages } from './utils/imageOptimizer';

function App() {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    // Preload first 4 thumbnails
    const firstCategory = videoData.categories[0];
    if (firstCategory) {
      const urls = firstCategory.contents
        .slice(0, 4)
        .map((v) => v.thumbnailUrl);
      preloadCriticalImages(urls).then(() => {
        setImagesPreloaded(true);
      });
    } else {
      setImagesPreloaded(true);
    }
  }, []);

  if (!imagesPreloaded) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayerProvider>
      <HomePage />
      <VideoPlayer />
      <MiniPlayer />
    </VideoPlayerProvider>
  );
}

export default App;