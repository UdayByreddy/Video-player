import { createContext, useContext, useState } from "react"
import { PlayerMode, Video } from "../types"

 
 interface VideoPlayerContextProps {
  currentVideo: Video | null,
  setCurrentVideo: (video: Video | null) => void
  playerMode: PlayerMode
  setPlayerMode: (mode: PlayerMode) => void
}

const  VideoPlayerContext = createContext<VideoPlayerContextProps | undefined>(undefined);

export const VideoPlayerProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [playerMode, setPlayerMode] = useState<PlayerMode>('hidden');

    const value = {
        currentVideo,
        setCurrentVideo,
        playerMode,
        setPlayerMode
    }
    return (
        <VideoPlayerContext.Provider value={value}>
            {children}
        </VideoPlayerContext.Provider>
    )
    
}

export const useVideoPlayer = ()=>{
    const context = useContext(VideoPlayerContext);

    if(context === undefined){
        throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
    }

    return context;

}