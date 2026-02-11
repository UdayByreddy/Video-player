export interface Video {
    title:string;
    mediaUrl:string;
    mediaType: 'YOUTUBE' | 'MP4';
    thumbnailUrl:string;
    slug:string;
    duration?:string;
}

export interface Category {
    slug:string;
    name:string;
    iconUrl:string;
}

export interface CategoryWithVideos {
    category:Category;
    contents:Video[];
}

export interface VideoData {
    categories:CategoryWithVideos[];
}

export type PlayerMode = 'fullscreen' | 'minimized' | 'hidden'; 