import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { z } from 'zod';
import { xai } from '@ai-sdk/xai';
import { analyzeVideo, searchVideos } from '@/utils/twelvelabs';
import { generateImage } from '@/utils/grokImage';

// Allow streaming responses up to 30 seconds

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, selectedVideoId, indexId }: { messages: UIMessage[]; selectedVideoId?: string; indexId?: string } = await req.json();

//   console.log(selectedVideoId)

  // Create system message with selected video context
  const toolInstructions = `

IMPORTANT: After using ANY tool (analyzeSelectedVideo or searchVideos), you MUST provide a detailed text response summarizing and explaining the results to the user. Never end your response immediately after calling a tool - always explain the results in natural language.`;

  const systemMessage = selectedVideoId
    ? `You are an AI assistant for law enforcement, specialized in analyzing police cam and CCTV footage. The user has selected a video with ID: ${selectedVideoId}.${indexId ? ` The current index ID is: ${indexId}. When using the searchVideos tool, you MUST use this index ID: "${indexId}".` : ''}${toolInstructions}`
    : `You are an AI assistant for law enforcement, specialized in analyzing police cam and CCTV footage. You help officers search through and analyze video evidence to support investigations.${indexId ? ` The current index ID is: ${indexId}. When using the searchVideos tool, you MUST use this index ID: "${indexId}".` : ''}${toolInstructions}`;

  const result = streamText({
    model: xai('grok-4-fast-non-reasoning'),
    system: systemMessage,
    messages: await convertToModelMessages(messages),
    tools: {
      // server-side tool to analyze videos using TwelveLabs:
      analyzeSelectedVideo: {
        description: 'Get analysis of the selected video.',
        inputSchema: z.object({
          videoId: z.string().describe('The ID of the video to analyze'),
          prompt: z.string().describe('The analysis prompt or question about the video'),
        }),
        execute: async ({ videoId, prompt }: { videoId: string; prompt: string }) => {
          try {
            const result = await analyzeVideo(videoId, prompt);
            return {
                analysis: result.data
            }
          } catch (error) {
            throw new Error(`Error analyzing video: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
      },
      // server-side tool to search videos using TwelveLabs:
      searchVideos: {
        description: 'Search through videos in the TwelveLabs index using visual and audio search. Use this to find specific scenes, objects, people, actions, or audio content across all videos.',
        inputSchema: z.object({
          indexId: z.string().describe('The ID of the TwelveLabs index to search in'),
          queryText: z.string().describe('The search query describing what to look for in the videos'),
        }),
        execute: async ({ indexId, queryText }) => {
          try {
            const results = await searchVideos(indexId, queryText);
            return {
                videos_retrieved: results
            };
          } catch (error) {
            throw new Error(`Error searching videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
      },
      // server-side tool to generate images using Grok:
      generateImage: {
        description: 'Generate images using Grok AI based on a text prompt. Use this to create visualizations, diagrams, suspect sketches, scene reconstructions, or any other images needed for investigation or reporting.',
        inputSchema: z.object({
          prompt: z.string().describe('The description of the image to generate'),
        }),
        execute: async ({ prompt }: { prompt: string }) => {
          try {
            const imageUrl = await generateImage(prompt);
            return {
              imageUrl,
              prompt
            };
          } catch (error) {
            throw new Error(`Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}