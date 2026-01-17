"use server";
import { TwelveLabs } from "twelvelabs-js";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function createIndex(name:string){

    const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY });

    const index = await client.indexes.create({
        indexName: name,
        models: [
            {
                modelName: "marengo3.0",
                modelOptions: ["visual", "audio"],
            },
            {
                modelName: "pegasus1.2",
                modelOptions: ["visual", "audio"],
            },
        ],
    });
    
    console.log(`ID: ${index.id}`);

    return index.id
}

export async function listIndex(name:string) {

    const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY });


    const indexesPager = await client.indexes.list({
        page: 1,
        pageLimit: 10,
        sortBy: "created_at",
        sortOption: "desc",
        indexName: name,
        modelOptions: "visual,audio",
        modelFamily: "marengo",
        createdAt: "2024-08-16T16:53:59Z",
        updatedAt: "2024-08-16T16:55:59Z"
    });

    const indexes = [];
    for await (const index of indexesPager) {
        indexes.push({
            id: index.id,
            name: index.indexName,
            models: index.models,
            videoCount: index.videoCount,
            totalDuration: index.totalDuration,
            createdAt: index.createdAt,
            updatedAt: index.updatedAt
        });
    }

    return indexes;
}

export async function uploadVideo() {
    console.log("E3e")
}

export async function getAllVideos(indexId:string) {
    const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY });

    
    const response = await client.indexes.videos.list(indexId);
    // allVideos.push(...response.data);
    console.log(response)
    const videos = []

    for await (const video of response.data) {
        console.log(`ID: ${video.id}`);
        console.log(`Created at: ${video.createdAt}`);
        console.log(`Updated at: ${video.updatedAt || "N/A"}`);
        console.log(`Indexed at: ${video.indexedAt || "N/A"}`);
        if (video.systemMetadata) {
            console.log("System metadata:");
            console.log(`  Filename: ${video.systemMetadata.filename || "N/A"}`);
            console.log(`  Duration: ${video.systemMetadata.duration || "N/A"}`);
            console.log(`  FPS: ${video.systemMetadata.fps || "N/A"}`);
            console.log(`  Width: ${video.systemMetadata.width || "N/A"}`);
            console.log(`  Height: ${video.systemMetadata.height || "N/A"}`);
            console.log(`  Size: ${video.systemMetadata.size || "N/A"}`);
        }
        videos.push(video)
        console.log("---");
    }

    return videos;
}

export async function analyzeVideo(video_id: string, prompt:string){
    const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY });

    const result = await client.analyze({
        videoId: video_id,
        prompt: prompt,
        temperature: 0.2
    });

    console.log(`Result ID: ${result.id}`);
    console.log(`Generated text: ${result.data}`);
    if (result.usage !== undefined) {
        console.log(`Output tokens: ${result.usage.outputTokens}`)
    };

    return {
        id: result.id,
        data: result.data,
        usage: result.usage
    };
}

export async function searchVideos(
    indexId: string,
    queryText: string,
    options?: {
        searchOptions?: string[];
        groupBy?: "video" | "clip";
        operator?: "or" | "and";
        filter?: string;
        pageLimit?: number;
        sortOption?: "score" | "clip_count";
    }
) {
    const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY });

    const response = await client.search.query({
        indexId: indexId,
        searchOptions: ["visual", "audio"],
        queryText: queryText,
        groupBy: options?.groupBy || "video",
        operator: options?.operator || "or",
        filter: options?.filter,
        pageLimit: options?.pageLimit || 5,
        sortOption: options?.sortOption || "score"
    });

    const results = [];
    console.log("Search Results:");

    for await (const item of response) {
        if (item.id && item.clips) {
            // Grouped by video
            console.log(`Video ID: ${item.id}`);
            const videoResult = {
                id: item.id,
                clips: item.clips.map(clip => ({
                    start: clip.start,
                    end: clip.end,
                    videoId: clip.videoId,
                    rank: clip.rank,
                    thumbnailUrl: clip.thumbnailUrl,
                    transcription: clip.transcription
                }))
            };
            results.push(videoResult);

            for (const clip of item.clips) {
                console.log("  Clip:");
                console.log(`    Start: ${clip.start}`);
                console.log(`    End: ${clip.end}`);
                console.log(`    Video ID: ${clip.videoId}`);
                console.log(`    Rank: ${clip.rank}`);
                console.log(`    Thumbnail URL: ${clip.thumbnailUrl}`);
            }
        } else {
            // Individual clips
            const clipResult = {
                start: item.start,
                end: item.end,
                videoId: item.videoId,
                rank: item.rank,
                thumbnailUrl: item.thumbnailUrl,
                transcription: item.transcription
            };
            results.push(clipResult);

            console.log(`  Start: ${item.start}`);
            console.log(`  End: ${item.end}`);
            console.log(`  Video ID: ${item.videoId}`);
            console.log(`  Rank: ${item.rank}`);
            console.log(`  Thumbnail URL: ${item.thumbnailUrl}`);
            if (item.transcription) {
                console.log(`  Transcription: ${item.transcription}`);
            }
        }
    }

    return results;
}

export async function getVideoUrl(videoId: string) {
    const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY });

    try {
        const response = await client.tasks.retrieve(videoId);
        const videoUrl = response.hls?.videoUrl;

        if (!videoUrl) {
            throw new Error('No video URL available');
        }

        return videoUrl;
    } catch (error) {
        console.error('Error fetching video URL:', error);
        throw new Error(`Failed to fetch video URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

