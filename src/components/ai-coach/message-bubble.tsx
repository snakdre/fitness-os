import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
          isUser ? "bg-zinc-700" : "bg-orange-500"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-foreground" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-zinc-700 text-foreground rounded-tr-sm"
            : "bg-surface-2 text-foreground rounded-tl-sm"
        )}
      >
        {content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split("\n").length - 1 && <br />}
          </span>
        ))}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-orange-400 animate-pulse ml-0.5 align-middle rounded-sm" />
        )}
      </div>
    </div>
  )
}
