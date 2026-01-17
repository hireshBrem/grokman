import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
});

export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await openai.images.generate({
            model: "grok-2-image-1212",
            prompt: prompt,
        });

        if (!response.data || !response.data[0]?.url) {
            throw new Error('No image URL returned from Grok API');
        }

        return response.data[0].url;
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
