"use client"

import { useEffect, useState, useCallback } from "react"
import { ChatWindow } from "@/components/ai-coach/chat-window"
import { ConversationList } from "@/components/ai-coach/conversation-list"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  updatedAt: Date
  _count: { messages: number }
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function AICoachPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | undefined>()
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const hasApiKey = true // Checked server-side; client assumes available unless API returns 503

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/conversations")
      if (res.ok) {
        const json = await res.json()
        setConversations(json.data ?? [])
      }
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  async function handleSelectConversation(id: string) {
    setActiveConvId(id)
    setSidebarOpen(false)
    try {
      const res = await fetch(`/api/ai/conversations/${id}`)
      if (res.ok) {
        const json = await res.json()
        const msgs = (json.data?.messages ?? []).map(
          (m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role === "USER" ? "user" : ("assistant" as "user" | "assistant"),
            content: m.content,
          })
        )
        setActiveMessages(msgs)
      }
    } catch {
      setActiveMessages([])
    }
  }

  function handleNewConversation() {
    setActiveConvId(undefined)
    setActiveMessages([])
    setSidebarOpen(false)
  }

  async function handleDeleteConversation(id: string) {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" })
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id))
        if (activeConvId === id) {
          setActiveConvId(undefined)
          setActiveMessages([])
        }
      }
    } catch {
      // Silently fail
    }
  }

  function handleConversationCreated(id: string) {
    setActiveConvId(id)
    loadConversations()
  }

  return (
    <div className="flex h-full relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conversation sidebar */}
      <div
        className={cn(
          "fixed md:relative z-30 md:z-auto top-0 left-0 h-full w-72 bg-background border-r border-border transition-transform md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
          <span className="text-sm font-semibold text-foreground">Conversations</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">AI Coach</span>
        </div>

        <ChatWindow
          conversationId={activeConvId}
          initialMessages={activeMessages}
          onConversationCreated={handleConversationCreated}
          hasApiKey={hasApiKey}
        />
      </div>
    </div>
  )
}
