
export default function formatTime(seconds: number) {
    if(!seconds || isNaN(seconds)) return "00:00";

   const hours = Math.floor(seconds /3600);
   const minutes = Math.floor((seconds % 3600) / 60);
   const secs = seconds % 60;   
     // If video is longer than 1 hour, show HH:MM:SS
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Otherwise show MM:SS
  return `${minutes}:${secs.toString().padStart(2, '0')}`;

}
