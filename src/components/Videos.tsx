"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, Loader2, Video } from "lucide-react";
import type { UploadProgress } from "@/types/video";
import {
    uploadVideo,
    getAllVideos,
    analyzeVideo
} from "@/utils/twelvelabs";

interface VideosProps {
  selectedVideoId: string | null;
  setSelectedVideoId: (id: string | null) => void;
  indexId: string;
  setIndexId: (id: string) => void;
}

export default function Videos({ selectedVideoId, setSelectedVideoId, indexId, setIndexId }: VideosProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for fetching videos
  const [videos, setVideos] = useState<any>(null);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State for analysis prompt (selectedVideoId now comes from props)
  const [analysisPrompt, setAnalysisPrompt] = useState<string>("Describe what happens in this video");

  // Fetch videos on component mount
  useEffect(() => {
    handleFetchVideos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    // Validate file size (max 4GB)
    const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4GB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 4GB limit");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress({
      totalChunks: 0,
      completedChunks: 0,
      percentage: 0,
      status: "Preparing upload...",
    });

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      // Update progress to show uploading
      setUploadProgress({
        totalChunks: 100,
        completedChunks: 50,
        percentage: 50,
        status: "Uploading to TwelveLabs...",
      });

      // Call the server action directly
      const result = await uploadVideo();

      // Show indexing status
      setUploadProgress({
        totalChunks: 100,
        completedChunks: 100,
        percentage: 100,
        status: "Upload complete, indexing...",
      });

      // Wait a moment to show completion
      setTimeout(() => {
        setUploadProgress({
          totalChunks: 100,
          completedChunks: 100,
          percentage: 100,
          status: "Complete!",
        });

        // Reset upload state
        setTimeout(() => {
          setSelectedFile(null);
          setUploadProgress(null);
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 1000);
      }, 500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleFetchVideos = async () => {
    if (!indexId.trim()) {
      setFetchError("Please enter an index ID");
      return;
    }

    setIsFetchingVideos(true);
    setFetchError(null);
    setVideos(null);

    try {
      const result = await getAllVideos(indexId);
      setVideos(result);
    } catch (err) {
      console.error("Fetch videos error:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to fetch videos");
    } finally {
      setIsFetchingVideos(false);
    }
  };

    async function test(){
        if (!selectedVideoId) {
            alert("Please select a video first");
            return;
        }
        try {
            await analyzeVideo(selectedVideoId, analysisPrompt);
            alert("Video analysis complete! Check console for results.");
        } catch (err) {
            console.error("Analysis error:", err);
            alert("Analysis failed. Check console for details.");
        }
    }


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Upload Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>
            Upload a video file to TwelveLabs for indexing and search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </CardContent>
      </Card> */}

      {/* Upload Progress Section */}
      {/* {uploadProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{uploadProgress.status}</span>
                <span className="font-medium">{uploadProgress.percentage}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              {uploadProgress.totalChunks > 0 && (
                <div className="text-xs text-muted-foreground">
                  Chunks: {uploadProgress.completedChunks} / {uploadProgress.totalChunks}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}
      {/* Test Analysis Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Test Video Analysis</CardTitle>
          <CardDescription>
            Select a video below and run analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Prompt</label>
            <Input
              type="text"
              placeholder="Enter your analysis prompt"
              value={analysisPrompt}
              onChange={(e) => setAnalysisPrompt(e.target.value)}
            />
          </div>

          {selectedVideoId && (
            <div className="text-sm text-muted-foreground">
              Selected Video ID: {selectedVideoId}
            </div>
          )}

          <Button
            onClick={()=>test()}
            disabled={!selectedVideoId}
            className="w-full"
          >
            {selectedVideoId ? "Run Analysis" : "Select a Video First"}
          </Button>
        </CardContent>
      </Card> */}

      {/* Fetch Videos Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Fetch Videos</CardTitle>
          <CardDescription>
            Retrieve all videos from a TwelveLabs index
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter Index ID"
              value={indexId}
              onChange={(e) => setIndexId(e.target.value)}
              disabled={isFetchingVideos}
            />
          </div>

          {fetchError && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{fetchError}</span>
            </div>
          )}

          <Button
            onClick={handleFetchVideos}
            disabled={!indexId.trim() || isFetchingVideos}
            className="w-full"
          >
            {isFetchingVideos ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Videos...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Fetch Videos
              </>
            )}
          </Button>
        </CardContent>
      </Card> */}

      {/* Videos List Section */}
      {videos && (
        <Card>
          <CardHeader>
            <CardTitle>Videos ({videos.length})</CardTitle>
            {/* <CardDescription>
              Videos from index: {indexId}
            </CardDescription> */}
          </CardHeader>
          <CardContent className=" gap-3">
            <div className="flex flex-wrap gap-4">
              {videos.map((video: any) => (
                <Card
                  key={video.id}
                  className={`overflow-hidden w-[calc(33.333%-1rem)] cursor-pointer transition-all ${
                    selectedVideoId === video.id
                      ? 'ring-2 mt-3 ring-primary shadow-lg'
                      : 'hover:shadow-md mt-3'
                  }`}
                  onClick={() => setSelectedVideoId(video.id)}
                >
                  <CardContent className="">
                    {/* Selection Indicator */}
                    {/* {selectedVideoId === video.id && (
                      <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-md w-fit">
                        Selected for Analysis
                      </div>
                    )} */}

                    {/* Video Player */}
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {video.hls?.status === "COMPLETE" && video.hls?.video_url ? (
                        <video
                          poster={video.hls.thumbnail_urls?.[0]}
                          className="w-full h-full"
                        >
                          <source src={video.hls.video_url} type="application/x-mpegURL" />
                          Your browser does not support HLS video playback.
                        </video>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Video className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    {/* Video Metadata */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm truncate mt-3">
                        {video.systemMetadata?.filename || "Untitled Video"}
                      </h3>

                      {/* <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {video.systemMetadata?.duration
                            ? `${Math.floor(video.systemMetadata.duration / 60)}:${String(Math.floor(video.systemMetadata.duration % 60)).padStart(2, '0')}`
                            : "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Resolution:</span>{" "}
                          {video.systemMetadata?.width && video.systemMetadata?.height
                            ? `${video.systemMetadata.width}x${video.systemMetadata.height}`
                            : "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">FPS:</span>{" "}
                          {video.systemMetadata?.fps || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span>{" "}
                          {video.systemMetadata?.size
                            ? formatFileSize(video.systemMetadata.size)
                            : "N/A"}
                        </div>
                      </div>

                      <div className="pt-2 border-t text-xs text-muted-foreground">
                        <div className="truncate">
                          <span className="font-medium">ID:</span> {video.id}
                        </div>
                        <div>
                          <span className="font-medium">Indexed:</span>{" "}
                          {video.indexedAt
                            ? new Date(video.indexedAt).toLocaleString()
                            : "N/A"}
                        </div>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animated Chase Scene */}
      <div
        className="fixed bottom-0 z-50 pointer-events-none flex items-end gap-4"
        style={{
          animation: 'walk-across 15s linear infinite reverse'
        }}
      >
        {/* Thief running ahead */}
        <img
          src="/thief.png"
          alt="Thief"
          className="w-15 h-15 object-contain"
          style={{
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            transform: 'scaleX(-1)'
          }}
        />
        {/* Policeman chasing */}
        <img
          src="/police.png"
          alt="Policeman"
          className="w-20 h-20 object-contain"
          style={{
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            transform: 'scaleX(-1)',
            animation: 'bob-horizontal 0.3s ease-in-out infinite'
          }}
        />
      </div>
    </div>
  );
}
