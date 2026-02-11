export function getYouTubeEmbedUrl(url: string): string {
  let videoId = '';

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1].split('&')[0];
  } else if (url.includes('/embed/')) {
    videoId = url.split('/embed/')[1].split('?')[0];
  }

  if (!videoId) return url;

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=1&playsinline=1&rel=0&modestbranding=1`;
}
