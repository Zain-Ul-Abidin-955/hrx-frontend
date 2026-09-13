import axiosInstance from "../axios/axiosInstance";
import type {
  AIActionProposal,
  AIConversation,
  AIConversationDetail,
  AIConversationMode,
  AIStreamEvent,
} from "@/types/ai";

export const listAIConversations = async (): Promise<AIConversation[]> => {
  const response = await axiosInstance.get<AIConversation[]>(
    "/ai/conversations",
  );
  return response.data;
};

export const createAIConversation = async (
  mode: AIConversationMode = "read_mode",
): Promise<AIConversation> => {
  const response = await axiosInstance.post<AIConversation>(
    "/ai/conversations",
    { mode },
  );
  return response.data;
};

export const getAIConversation = async (
  conversationId: string,
): Promise<AIConversationDetail> => {
  const response = await axiosInstance.get<AIConversationDetail>(
    `/ai/conversations/${conversationId}`,
  );
  return response.data;
};

export const changeAIConversationMode = async (
  conversationId: string,
  mode: AIConversationMode,
): Promise<AIConversation> => {
  const response = await axiosInstance.patch<AIConversation>(
    `/ai/conversations/${conversationId}/mode`,
    { mode },
  );
  return response.data;
};

export const deleteAIConversation = async (
  conversationId: string,
): Promise<void> => {
  await axiosInstance.delete(`/ai/conversations/${conversationId}`);
};

export const confirmAIAction = async (
  proposalId: string,
): Promise<AIActionProposal> => {
  const response = await axiosInstance.post<AIActionProposal>(
    `/ai/action-proposals/${proposalId}/confirm`,
    undefined,
    { headers: { "Idempotency-Key": crypto.randomUUID() } },
  );
  return response.data;
};

export const cancelAIAction = async (
  proposalId: string,
): Promise<AIActionProposal> => {
  const response = await axiosInstance.post<AIActionProposal>(
    `/ai/action-proposals/${proposalId}/cancel`,
  );
  return response.data;
};

function parseEventBlock(block: string): AIStreamEvent | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }

  if (!dataLines.length || event === "message") return null;
  return {
    event: event as AIStreamEvent["event"],
    data: JSON.parse(dataLines.join("\n")) as Record<string, unknown>,
  };
}

async function getStreamError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      detail?: string;
      message?: string;
    };
    return payload.detail || payload.message || "The AI request failed.";
  } catch {
    return "The AI request failed.";
  }
}

export const streamAIConversationTurn = async (
  conversationId: string,
  message: string,
  expectedMode: AIConversationMode,
  onEvent: (event: AIStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");

  const response = await fetch(
    `${baseUrl}/ai/conversations/${conversationId}/turns`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, expected_mode: expectedMode }),
      signal,
    },
  );

  if (!response.ok) throw new Error(await getStreamError(response));
  if (!response.body) throw new Error("The AI response stream is unavailable.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    buffer = buffer.replace(/\r\n/g, "\n");

    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const parsed = parseEventBlock(block);
      if (parsed) onEvent(parsed);
      boundary = buffer.indexOf("\n\n");
    }

    if (done) break;
  }

  const finalEvent = parseEventBlock(buffer.trim());
  if (finalEvent) onEvent(finalEvent);
};
