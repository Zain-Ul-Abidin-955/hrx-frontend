export type AIConversationMode = "read_mode" | "action_mode";
export type AIMessageRole = "user" | "assistant" | "tool";
export type AIMessageStatus =
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";
export type AIActionProposalStatus =
  | "pending"
  | "executed"
  | "cancelled"
  | "expired"
  | "failed";

export interface AIActionProposalPreview {
  summary?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AIActionProposalSummary {
  id: string;
  operation: string;
  preview: AIActionProposalPreview;
  resource_type: string | null;
  resource_id: string | null;
  expires_at: string;
  status?: AIActionProposalStatus;
  result?: Record<string, unknown> | null;
  error?: string | null;
}

export interface AIStructuredResult {
  kind: string;
  data?: unknown;
  count?: number;
  returned_count?: number;
  ranking_source?: string;
  indexing_incomplete?: boolean;
  proposal?: AIActionProposalSummary;
  [key: string]: unknown;
}

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  status: AIMessageStatus;
  content: string;
  structured_results: AIStructuredResult[] | null;
  model: string | null;
  error: string | null;
  created_at: string;
}

export interface AIConversation {
  id: string;
  organization_id: string;
  user_id: string;
  title: string | null;
  mode: AIConversationMode;
  created_at: string;
  updated_at: string;
}

export interface AIConversationDetail extends AIConversation {
  messages: AIMessage[];
}

export interface AIActionProposal extends AIActionProposalSummary {
  conversation_id: string;
  status: AIActionProposalStatus;
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
}

export interface AIStreamEvent {
  event:
    | "turn_started"
    | "tool_started"
    | "tool_finished"
    | "result_block"
    | "action_proposal"
    | "text_delta"
    | "error"
    | "done";
  data: Record<string, unknown>;
}
