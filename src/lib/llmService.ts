import type { LLMSettings, ChatMessage } from "../store/llmStore";

export async function callLLM(
  settings: LLMSettings,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!settings.url || !settings.model) {
    throw new Error("LLM not configured. Please set URL and model in settings.");
  }

  const res = await fetch(settings.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(settings.token ? { Authorization: `Bearer ${settings.token}` } : {}),
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Unexpected API response format");
  return content;
}

export function buildApiMessages(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
) {
  return [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];
}
