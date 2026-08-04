"use client"

import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

interface ChatWindowProps {
  conversationId?: string
  initialMessages?: Message[]
  onConversationCreated?: (id: string) => void
  hasApiKey: boolean
}

export function ChatWindow({
  conversationId,
  initialMessages = [],
  onConversationCreated,
  hasApiKey,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentConvId, setCurrentConvId] = useState(conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
    setCurrentConvId(conversationId)
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(message: string) {
    if (!hasApiKey) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    const streamingId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: streamingId, role: "assistant", content: "", isStreaming: true },
    ])

    abortRef.current = new AbortController()

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId: currentConvId,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error("Request failed")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6))

                if (json.text) {
                  fullContent += json.text
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === streamingId
                        ? { ...m, content: fullContent, isStreaming: true }
                        : m
                    )
                  )
                }

                if (json.done) {
                  if (json.conversationId && !currentConvId) {
                    setCurrentConvId(json.conversationId)
                    onConversationCreated?.(json.conversationId)
                  }
                }

                if (json.error) {
                  fullContent = json.error
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId ? { ...m, content: fullContent, isStreaming: false } : m
        )
      )
    } catch (error: unknown) {
      if ((error as { name?: string }).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? {
                  ...m,
                  content: "Sorry, something went wrong. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        )
      }
    } finally {
      setIsStreaming(false)
    }
  }

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
          <Bot className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Coach Unavailable</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            The AI service is not configured. Please contact support to enable the AI Coach.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">VYROX AI Coach</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Your personal fitness trainer and nutritionist. Ask me anything about
                workouts, nutrition, recovery, or your progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "Create a workout plan for me",
                "What should I eat today?",
                "How can I improve my recovery?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="text-xs bg-surface-2 hover:bg-surface-2 text-foreground px-3 py-1.5 rounded-full transition-colors border border-border-strong"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={message.isStreaming}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI can make mistakes. Always consult a qualified fitness professional.
        </p>
      </div>
    </div>
  )
}
