'use client';

import { useState } from 'react';
import Chat from '@/components/Chat';
import Videos from '@/components/Videos'

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [indexId, setIndexId] = useState<string>("696b9f09cafce60cf069d58d");

  return (
    <div className="flex h-screen w-screen bg-zinc-900">
    
        {/* Left Panel - 2/3 width */}
      <div className="w-2/3 bg-zinc-900 border-r border-zinc-800">
            <div className="p-4">
              <h1 className="text-4xl font-bold text-white ml-5">Grokman</h1>
            </div>
            <Videos
              selectedVideoId={selectedVideoId}
              setSelectedVideoId={setSelectedVideoId}
              indexId={indexId}
              setIndexId={setIndexId}
            />
      </div>

      {/* Right Panel - Chat - 1/3 width */}
      <div className="w-1/3 bg-zinc-950">
        <Chat selectedVideoId={selectedVideoId} indexId={indexId} />
      </div>
    </div>
  );
}
