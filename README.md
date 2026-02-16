# YouTube Video Player with Custom Controls

A feature-rich, custom video player built with React, TypeScript, and the YouTube IFrame API. This player provides a seamless viewing experience with fullscreen and minimized modes, custom controls, and intelligent autoplay functionality.

## 🎯 Features

### Player Modes
- **Fullscreen Mode**: Immersive viewing experience with custom controls overlay
- **Minimized Mode**: Picture-in-picture style player in the bottom-right corner
- **Smooth Transitions**: Seamless switching between modes with preserved playback position

### Custom Controls
- ✅ Play/Pause with visual feedback
- ✅ Progress bar with hover preview and smooth seeking
- ✅ Skip forward/backward (10 seconds)
- ✅ Volume control with mute toggle
- ✅ Current time and duration display
- ✅ Fullscreen toggle
- ✅ Auto-hide controls during playback

### Advanced Features
- **Intelligent Autoplay**: Automatically plays the next video in the category with a 5-second countdown
- **Position Preservation**: Remembers playback position when switching between fullscreen and minimized modes
- **Related Videos**: Browse and select related videos from the same category
- **Drag-to-Minimize**: Drag down from the top in fullscreen mode to minimize the player
- **YouTube UI Suppression**: Completely hides YouTube's native controls for a clean, custom experience

## 🛠️ Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **YouTube IFrame API** - Video playback
- **React Icons** - Icon library

## 📁 Project Structure

```
src/
├── components/
│   ├── VideoPlayer/
│   │   ├── VideoPlayer.tsx          # Fullscreen player component
│   │   ├── Videocontrol.tsx         # Custom controls component
│   │   ├── RelatedVideoList.tsx     # Related videos sidebar
│   │   └── MiniPlayer.tsx           # Minimized player controls (optional)
│   └── ...
├── context/
│   └── VideoPlayerContext.tsx       # Global player state management
├── types/
│   └── index.ts                     # TypeScript type definitions
├── data/
│   └── video.ts                     # Video data structure
└── utils/
    └── formatTime.ts                # Time formatting utility

```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Required Dependencies**
   
   If not already in your `package.json`, install these packages:
   ```bash
   npm install react react-dom
   npm install framer-motion
   npm install react-icons
   npm install -D typescript @types/react @types/react-dom
   npm install -D tailwindcss postcss autoprefixer
   ```

4. **Configure Tailwind CSS**

   Create or update `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             400: '#60a5fa',
             500: '#3b82f6',
             600: '#2563eb',
           },
           dark: {
             600: '#4b5563',
             700: '#374151',
             800: '#1f2937',
           },
         },
       },
     },
     plugins: [],
   }
   ```

5. **Add Tailwind directives to your CSS**

   In `src/index.css` or `src/App.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Setup Video Data

1. **Create your video data structure** in `src/data/video.ts`:

   ```typescript
   export interface Video {
     slug: string;
     title: string;
     mediaUrl: string; // YouTube URL
     thumbnailUrl: string;
     duration?: string;
   }

   export interface Category {
     slug: string;
     name: string;
     iconUrl: string;
   }

   export interface CategoryWithVideos {
     category: Category;
     contents: Video[];
   }

   export const videoData = {
     categories: [
       {
         category: {
           slug: 'entertainment',
           name: 'Entertainment',
           iconUrl: '/icons/entertainment.png'
         },
         contents: [
           {
             slug: 'video-1',
             title: 'Sample Video 1',
             mediaUrl: 'https://www.youtube.com/watch?v=VIDEO_ID_1',
             thumbnailUrl: 'https://img.youtube.com/vi/VIDEO_ID_1/maxresdefault.jpg',
             duration: '5:30'
           },
           // Add more videos...
         ]
       },
       // Add more categories...
     ]
   };
   ```

2. **YouTube URL Formats Supported**:
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://www.youtube.com/embed/VIDEO_ID`

### Integrate into Your App

1. **Wrap your app with the VideoPlayerProvider**:

   ```tsx
   // src/App.tsx
   import { VideoPlayerProvider } from './context/VideoPlayerContext';
   import { VideoPlayer } from './components/VideoPlayer/VideoPlayer';

   function App() {
     return (
       <VideoPlayerProvider>
         {/* Your app content */}
         <YourComponents />
         
         {/* Video player overlay */}
         <VideoPlayer />
       </VideoPlayerProvider>
     );
   }
   ```

2. **Trigger the player from any component**:

   ```tsx
   import { useVideoPlayer } from './context/VideoPlayerContext';

   function VideoCard({ video }) {
     const { setCurrentVideo, setPlayerMode } = useVideoPlayer();

     const handlePlay = () => {
       setCurrentVideo(video);
       setPlayerMode('fullscreen');
     };

     return (
       <div onClick={handlePlay}>
         <img src={video.thumbnailUrl} alt={video.title} />
         <h3>{video.title}</h3>
       </div>
     );
   }
   ```

### Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3001` (or your configured port).

## 🎮 Usage Guide

### Basic Usage

1. **Playing a Video**
   - Click on any video card to open the fullscreen player
   - Video will automatically start playing

2. **Player Controls**
   - **Play/Pause**: Click the play button or tap anywhere on the video
   - **Seek**: Click on the progress bar or drag the scrubber
   - **Skip**: Use the skip buttons to jump ±10 seconds
   - **Volume**: Adjust volume with the slider (desktop only)
   - **Fullscreen/Minimize**: Toggle between modes using the fullscreen button

3. **Minimizing the Player**
   - Click the minimize button (exit fullscreen icon)
   - Or drag down from the top drag handle
   - Player continues in bottom-right corner

4. **Related Videos**
   - Click "Related" button in fullscreen mode
   - Browse and select from videos in the same category
   - Currently playing video is highlighted

5. **Autoplay**
   - When a video ends, a 5-second countdown appears
   - Next video in the category plays automatically
   - Click "Cancel" to stop autoplay

### Keyboard Shortcuts

When the progress bar is focused:
- **Arrow Right**: Skip forward 10 seconds
- **Arrow Left**: Skip backward 10 seconds

## 🏗️ Architecture

### Component Hierarchy

```
App
└── VideoPlayerProvider (Context)
    ├── Your App Components
    └── VideoPlayer (Fullscreen Mode)
        ├── VideoControls
        ├── RelatedVideosList
        └── AutoPlay Countdown
```

### State Management

The `VideoPlayerContext` manages:
- Current video and playback state
- Player mode (hidden/minimized/fullscreen)
- Playback position, duration, volume
- Autoplay countdown state
- YouTube player instance

### Mode Management

- **Hidden**: No player visible
- **Minimized**: Portal-based player in bottom-right (320x180px)
- **Fullscreen**: Full-screen overlay with custom controls

### Position Preservation Logic

The player uses a `previousVideoSlugRef` to distinguish between:
- **Mode Switch** (same video): Preserves playback position
- **Video Change** (new video): Starts from beginning

## 🎨 Customization

### Styling

All components use Tailwind CSS classes. Customize by:

1. **Colors**: Update your Tailwind config
2. **Sizes**: Modify the portal layout in `VideoPlayerContext.tsx`
3. **Animations**: Adjust Framer Motion variants

### Player Behavior

**Autoplay Duration**: Change in `VideoPlayerContext.tsx`
```typescript
setAutoPlayCountdown(5); // Change to desired seconds
```

**Skip Duration**: Modify in `Videocontrol.tsx`
```typescript
onSkip={handleSkip}  // Currently ±10 seconds
```

**Controls Auto-hide**: Adjust in `VideoPlayer.tsx`
```typescript
setTimeout(() => {
  if (isPlaying && !isDragging) setShowControls(false);
}, 3000); // Change timeout duration
```

## 🐛 Troubleshooting

### YouTube API Not Loading
- Check console for API errors
- Verify YouTube URLs are valid and embeddable
- Some videos may have embedding restrictions

### Video Restarts on Mode Switch
- Ensure `previousVideoSlugRef` logic is implemented correctly
- Check console logs for "Same video" vs "New video" detection

### Controls Not Clickable
- Verify z-index hierarchy (overlay at z-10, controls at z-100+)
- Check that pointer-events are set correctly

### Autoplay Not Working
- Confirm `startAutoPlayCountdown` is called on video end
- Check that `nextVideo` is available in the category
- Verify autoplay is enabled in context

## 📝 Type Definitions

```typescript
type PlayerMode = 'hidden' | 'minimized' | 'fullscreen';

interface Video {
  slug: string;
  title: string;
  mediaUrl: string;
  thumbnailUrl: string;
  duration?: string;
}

interface VideoPlayerContextProps {
  currentVideo: Video | null;
  setCurrentVideo: (video: Video | null) => void;
  playerMode: PlayerMode;
  setPlayerMode: (mode: PlayerMode) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  // ... and more
}
```

## 🔧 Advanced Configuration

### Adding New Player Modes

1. Update the `PlayerMode` type
2. Add layout logic in `applyLayout` function
3. Create corresponding UI component
4. Handle player initialization for new mode

### Integrating with Analytics

Add tracking in `VideoPlayerContext.tsx`:

```typescript
useEffect(() => {
  if (isPlaying) {
    // Track play event
    analytics.track('video_play', {
      videoId: currentVideo?.slug,
      timestamp: currentTime,
    });
  }
}, [isPlaying]);
```

### Custom Video Sources

To support non-YouTube sources:
1. Extend the player initialization logic
2. Add conditional rendering based on video source
3. Implement appropriate player SDK (Vimeo, custom HTML5, etc.)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: 9550790010
- Portfolio: https://udaykiranportfolio-nine.vercel.app/

---

**Built with ❤️ using React and TypeScript**