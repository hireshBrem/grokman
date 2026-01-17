export interface Video {
  id: string;
  filename: string;
  duration: number;
  size: number;
  createdAt: string;
  thumbnailUrl?: string;
  status: 'uploading' | 'indexing' | 'ready' | 'failed';
}

export interface UploadProgress {
  totalChunks: number;
  completedChunks: number;
  percentage: number;
  status: string;
}
