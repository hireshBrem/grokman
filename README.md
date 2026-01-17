# Grokman - AI for Police

Police/detectives spend hours watching bodycam footage and CCTV videos in intense situations such as manhunts. Grokman lets you search and analyse evidence videos (bodycam and CCTV) in minutes. Grokman also lets you generates suspect sketches so that more time is spent catching than drawing.

## Demo

https://github.com/user-attachments/assets/be57fca6-59b5-4a5a-b1ea-a54975682da8


## Setup

Install dependencies:

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Build

```bash
npm run build
npm start
```

## Tech Stack

### Frontend
- Next.js 16.1.3 (App Router)
- React 19 (with React Compiler)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React (icons)
- React Markdown

### AI & APIs
- Grok (xAI) - AI chat and image generation
- TwelveLabs - Video analysis and search
- Vercel AI SDK - AI streaming and integration
- Zod - Schema validation
