'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, MapPin, Cloud, AlertCircle, Video, Loader2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat({selectedVideoId, indexId}:{selectedVideoId: string | null, indexId: string}) {
    // console.log(selectedVideoId)

  // Use a ref to track the latest selectedVideoId value
  const selectedVideoIdRef = useRef(selectedVideoId);
  const indexIdRef = useRef(indexId);

  // Keep the ref in sync with the prop
  useEffect(() => {
    selectedVideoIdRef.current = selectedVideoId;
  }, [selectedVideoId]);

  useEffect(() => {
    indexIdRef.current = indexId;
  }, [indexId]);

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
            selectedVideoId: selectedVideoIdRef.current,
            indexId: indexIdRef.current,
          }),
    }),
  });
  const [input, setInput] = useState('');

  // Tool suggestions that populate the input when clicked
  const toolSuggestions = [
    {
      label: 'Analyze Video',
      icon: Video,
      prompt: 'Analyze this video and describe what you see',
      requiresVideo: true,
    },
    {
      label: 'Search Videos',
      icon: Search,
      prompt: 'Search for ',
      requiresVideo: false,
    },
  ];

  // Derive loading state by checking if any message parts are streaming
  const isLoading = messages.some(message =>
    message.parts?.some((part: any) =>
      part.state === 'input-streaming' ||
      (part.type === 'text' && message.role === 'assistant' && message === messages[messages.length - 1] && !part.text)
    )
  ) || status === 'submitted';

  async function debug(){
    console.log(messages)
  }

  return (
    <Card className="flex flex-col h-full border-0 shadow-none">
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-6 py-4">
            {messages?.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`flex flex-col gap-2 max-w-[80%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  {message.parts.map((part: any) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div
                            key={part.text}
                            className={`rounded-lg px-4 py-2.5 ${
                              message.role === 'user'
                                ? 'bg-zinc-300 text-black'
                                : 'bg-muted'
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                            //   className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-code:text-zinc-100"
                            >
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        );

                      case 'tool-askForConfirmation': {
                        const callId = part.toolCallId;

                        switch (part.state) {
                          case 'input-streaming':
                            return (
                              <Badge key={callId} variant="outline" className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                                Loading confirmation request...
                              </Badge>
                            );
                          case 'input-available':
                            return (
                              <Card key={callId} className="border-2">
                                <CardContent className="pt-4">
                                  <p className="mb-3 text-sm font-medium">{part.input.message}</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        addToolOutput({
                                          tool: 'askForConfirmation',
                                          toolCallId: callId,
                                          output: 'Yes, confirmed.',
                                        })
                                      }
                                    >
                                      Yes
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() =>
                                        addToolOutput({
                                          tool: 'askForConfirmation',
                                          toolCallId: callId,
                                          output: 'No, denied',
                                        })
                                      }
                                    >
                                      No
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          case 'output-available':
                            return (
                              <Badge key={callId} variant="secondary" className="text-xs">
                                Location access: {part.output}
                              </Badge>
                            );
                          case 'output-error':
                            return (
                              <Badge key={callId} variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Error: {part.errorText}
                              </Badge>
                            );
                        }
                        break;
                      }

                      case 'tool-analyzeSelectedVideo': {
                        const callId = part.toolCallId;

                        switch (part.state) {
                          case 'input-streaming':
                            return (
                              <Badge key={callId} variant="outline" className="flex items-center gap-2">
                                <Video className="h-3 w-3 animate-pulse" />
                                Preparing video analysis...
                              </Badge>
                            );
                          case 'input-available':
                            return (
                              <Card key={callId} className="border-primary/50">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-2">
                                    <Video className="h-4 w-4 text-primary mt-0.5 animate-pulse" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium mb-1">Analyzing video...</p>
                                      <p className="text-xs text-muted-foreground">
                                        Video ID: {part.input.videoId}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Prompt: "{part.input.prompt}"
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          case 'output-available':
                            return (
                              <div key={callId} className="rounded-lg px-4 py-2.5 bg-muted">
                                {typeof part.output === 'string'
                                  ? part.output
                                  : typeof part.output === 'object' && part.output?.analysis
                                  ? part.output.analysis
                                  : JSON.stringify(part.output, null, 2)}
                              </div>
                            );
                          case 'output-error':
                            return (
                              <Card key={callId} className="border-destructive/50 bg-destructive/10">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-destructive mb-1">
                                        Analysis Failed
                                      </p>
                                      <p className="text-xs text-destructive/80">
                                        {part.errorText}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                        }
                        break;
                      }

                      case 'tool-searchVideos': {
                        const callId = part.toolCallId;

                        switch (part.state) {
                          case 'input-streaming':
                            return (
                              <Badge key={callId} variant="outline" className="flex items-center gap-2">
                                <Search className="h-3 w-3 animate-pulse" />
                                Preparing search...
                              </Badge>
                            );
                          case 'input-available':
                            return (
                              <Card key={callId} className="border-blue-500/50">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-2">
                                    <Search className="h-4 w-4 text-blue-500 mt-0.5 animate-pulse" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium mb-1">Searching videos...</p>
                                      <p className="text-xs text-muted-foreground">
                                        Query: "{part.input.queryText}"
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Index ID: {part.input.indexId}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          case 'output-available':
                            const videos = part.output?.videos_retrieved || [];
                            return (
                              <Card key={callId} className="border-blue-500/30">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-2">
                                    <Search className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium mb-2">Search Results</p>
                                      <div className="text-xs space-y-2">
                                        {Array.isArray(videos) && videos.length > 0 ? (
                                          videos.map((result: any, idx: number) => (
                                            <div key={idx} className="bg-muted/50 rounded p-2">
                                              {result.id ? (
                                                // Grouped by video
                                                <>
                                                  <p className="font-medium">Video ID: {result.id}</p>
                                                  <p className="text-muted-foreground">
                                                    {result.clips?.length || 0} clip(s) found
                                                  </p>
                                                  {result.clips?.slice(0, 2).map((clip: any, clipIdx: number) => (
                                                    <div key={clipIdx} className="ml-2 mt-1 text-muted-foreground">
                                                      <p>• {clip.start}s - {clip.end}s (Score: {clip.rank})</p>
                                                    </div>
                                                  ))}
                                                </>
                                              ) : (
                                                // Individual clip
                                                <>
                                                  <p>Video: {result.videoId}</p>
                                                  <p className="text-muted-foreground">
                                                    {result.start}s - {result.end}s (Score: {result.rank})
                                                  </p>
                                                  {result.transcription && (
                                                    <p className="text-muted-foreground italic mt-1">
                                                      "{result.transcription}"
                                                    </p>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-muted-foreground">No results found</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          case 'output-error':
                            return (
                              <Card key={callId} className="border-destructive/50 bg-destructive/10">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-destructive mb-1">
                                        Search Failed
                                      </p>
                                      <p className="text-xs text-destructive/80">
                                        {part.errorText}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                        }
                        break;
                      }
                    }
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex flex-col gap-2 max-w-[80%] items-start">
                  <div className="rounded-lg px-4 py-2.5 bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <div className="border-t border-zinc-800 p-2">
        {/* Tool suggestions */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-2 px-2">
            {toolSuggestions
            //   .filter(suggestion => !suggestion.requiresVideo || selectedVideoId)
              .map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={suggestion.label}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
                    onClick={() => setInput(suggestion.prompt)}
                  >
                    <Icon className="h-3 w-3" />
                    {suggestion.label}
                  </Button>
                );
              })}
          </div>
        )}
        <form
          className="flex items-end p-2 rounded-2xl bg-zinc-900 border border-zinc-800"
          onSubmit={e => {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              sendMessage({ text: input });
              setInput('');
            }
          }}
        >
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  sendMessage({ text: input });
                  setInput('');
                }
              }
            }}
            placeholder={isLoading ? "Please wait..." : "Type your message... (Press Enter to send, Shift+Enter for new line)"}
            className="flex-1 border-none min-h-[140px] max-h-[300px]"
            rows={4}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}