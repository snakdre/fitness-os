import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function* streamChat(
  messages: ChatMessage[],
  systemPrompt: string,
  maxTokens = 1024
): AsyncGenerator<string> {
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      yield chunk.delta.text
    }
  }
}

export async function chat(
  messages: ChatMessage[],
  systemPrompt: string,
  maxTokens = 1024
): Promise<{ content: string; tokens: number }> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const content =
    response.content[0].type === "text" ? response.content[0].text : ""
  const tokens = response.usage.input_tokens + response.usage.output_tokens

  return { content, tokens }
}
