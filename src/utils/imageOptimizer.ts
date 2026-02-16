/**
 * Image optimization utilities
 */

export const getOptimizedImageUrl = (
  url: string
): string => {
  return url;
};

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

export const preloadCriticalImages = async (urls: string[]): Promise<void> => {
  const promises = urls.slice(0, 4).map((url) => preloadImage(url));
  await Promise.allSettled(promises);
};