"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Popconfirm,
  Segmented,
  Spin,
  Tag,
  Tooltip,
  message as toast,
} from "antd";
import {
  BulbOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  cancelAIAction,
  changeAIConversationMode,
  confirmAIAction,
  createAIConversation,
  deleteAIConversation,
  getAIConversation,
  listAIConversations,
  streamAIConversationTurn,
} from "@/api/collection/ai";
import { LoadingSpinner } from "@/components/loader/Loading";
import useUserStore from "@/store/userStore";
import type {
  AIActionProposal,
  AIActionProposalStatus,
  AIActionProposalSummary,
  AIConversationMode,
  AIMessage,
  AIStructuredResult,
} from "@/types/ai";

interface ProposalUIState {
  status: AIActionProposalStatus;
  result?: Record<string, unknown> | null;
  error?: string | null;
}

const READ_PROMPTS = [
  "How many open jobs do we have?",
  "Summarize applications by status",
  "Show the top ranked applicants for a job",
  "Which jobs were created this month?",
];

const ACTION_PROMPTS = [
  "Create a draft job for a Senior Backend Engineer",
  "Help me shortlist an application",
  "Update an existing job description",
  "Deactivate a job that is no longer available",
];

const MODE_OPTIONS = [
  {
    value: "read_mode",
    label: (
      <span>
        <BulbOutlined /> Ask
      </span>
    ),
  },
  {
    value: "action_mode",
    label: (
      <span>
        <EditOutlined /> Actions
      </span>
    ),
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  const data = error.response?.data as
    | { message?: string; detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item?.msg).filter(Boolean).join(", ") || fallback;
  }
  return fallback;
}

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function displayValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${humanize(key)}: ${displayValue(item)}`)
      .join(" · ");
  }
  return String(value);
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="max-w-full text-sm leading-6 [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-xl font-bold first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-lg font-bold first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 whitespace-pre-wrap last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          hr: () => <hr className="my-4 border-gray-200" />,
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-blue-300 bg-blue-50 px-3 py-2 text-gray-700">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) =>
            className ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] text-purple-700">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="my-3 max-w-full overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs leading-5 text-gray-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 max-w-full overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 bg-gray-100 px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function recordTitle(record: Record<string, unknown>, index: number) {
  const fullName = [record.first_name, record.last_name]
    .filter(Boolean)
    .join(" ");
  return displayValue(
    record.candidate_name ||
      record.title ||
      record.name ||
      fullName ||
      record.source_type ||
      `Result ${index + 1}`,
  );
}

function ResultRecord({
  record,
  index,
}: {
  record: Record<string, unknown>;
  index: number;
}) {
  const hiddenKeys = new Set([
    "id",
    "candidate_name",
    "title",
    "name",
    "first_name",
    "last_name",
    "snippet",
    "metadata",
  ]);
  const details = Object.entries(record)
    .filter(([key, value]) => !hiddenKeys.has(key) && value != null)
    .slice(0, 6);

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-3 [overflow-wrap:anywhere]">
      <p className="break-words font-semibold text-gray-800 [overflow-wrap:anywhere]">
        {recordTitle(record, index)}
      </p>
      {details.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {details.map(([key, value]) => (
            <Tag
              key={key}
              color={key.includes("score") ? "purple" : "default"}
              className="!m-0 !h-auto !max-w-full !whitespace-normal !break-words [overflow-wrap:anywhere]"
            >
              {humanize(key)}: {displayValue(value)}
            </Tag>
          ))}
        </div>
      )}
      {typeof record.snippet === "string" && (
        <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-gray-600 [overflow-wrap:anywhere]">
          {record.snippet}
        </p>
      )}
    </div>
  );
}

function StructuredResultCard({ result }: { result: AIStructuredResult }) {
  if (result.kind === "action_proposal") return null;
  const data = result.data;

  return (
    <div className="mt-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-blue-100 bg-blue-50/60 p-3 [overflow-wrap:anywhere]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          {humanize(result.kind)}
        </p>
        {typeof result.count === "number" && (
          <Tag color="blue">{result.count} total</Tag>
        )}
      </div>

      {Array.isArray(data) ? (
        data.length > 0 ? (
          <div className="space-y-2">
            {data.slice(0, 8).map((item, index) =>
              item && typeof item === "object" ? (
                <ResultRecord
                  key={`${result.kind}-${index}`}
                  record={item as Record<string, unknown>}
                  index={index}
                />
              ) : (
                <p key={`${result.kind}-${index}`} className="text-sm text-gray-700">
                  {displayValue(item)}
                </p>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No matching records found.</p>
        )
      ) : data && typeof data === "object" ? (
        <Descriptions size="small" column={1} bordered>
          {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
            <Descriptions.Item key={key} label={humanize(key)}>
              <span className="break-words [overflow-wrap:anywhere]">
                {displayValue(value)}
              </span>
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <p className="break-words text-sm text-gray-700 [overflow-wrap:anywhere]">
          {displayValue(data)}
        </p>
      )}

      {result.indexing_incomplete && (
        <Alert
          className="mt-3"
          type="warning"
          showIcon
          message="Some recruiting records are still being indexed."
        />
      )}
    </div>
  );
}

function ActionProposalCard({
  proposal,
  state,
  busy,
  onConfirm,
  onCancel,
}: {
  proposal: AIActionProposalSummary;
  state?: ProposalUIState;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const status = state?.status ?? proposal.status ?? "pending";
  const after = proposal.preview.after;
  const warning = state?.result?.warning;

  return (
    <div className="mt-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-amber-200 bg-amber-50 [overflow-wrap:anywhere]">
      <div className="border-b border-amber-200 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Approval required
            </p>
            <p className="mt-1 font-semibold text-gray-800">
              {proposal.preview.summary || humanize(proposal.operation)}
            </p>
          </div>
          <Tag
            color={
              status === "executed"
                ? "green"
                : status === "pending"
                  ? "gold"
                  : "default"
            }
          >
            {humanize(status)}
          </Tag>
        </div>
      </div>

      {after && Object.keys(after).length > 0 && (
        <div className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-2">
          {Object.entries(after)
            .slice(0, 10)
            .map(([key, value]) => (
              <div key={key} className="min-w-0">
                <p className="text-[11px] font-medium uppercase text-gray-500">
                  {humanize(key)}
                </p>
                <p className="break-words text-sm text-gray-700 [overflow-wrap:anywhere]">
                  {displayValue(value)}
                </p>
              </div>
            ))}
        </div>
      )}

      {status === "pending" && (
        <div className="flex justify-end gap-2 border-t border-amber-200 px-4 py-3">
          <Button size="small" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Popconfirm
            title="Confirm this HR action?"
            description="This will change organization data and will be recorded in the audit log."
            okText="Confirm action"
            cancelText="Go back"
            onConfirm={onConfirm}
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={busy}
              className="!bg-amber-600"
            >
              Confirm
            </Button>
          </Popconfirm>
        </div>
      )}

      {(state?.error || typeof warning === "string") && (
        <Alert
          type={status === "executed" ? "warning" : "error"}
          showIcon
          className="m-3"
          message={state?.error || String(warning)}
        />
      )}
    </div>
  );
}

export default function ChatBot() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const profileLoading = useUserStore((state) => state.loading);
  const canUseAssistant =
    user?.role === "org_admin" || user?.role === "hr_manager";

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [proposalStates, setProposalStates] = useState<
    Record<string, ProposalUIState>
  >({});
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);

  const messageAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);
  const activeAssistantIdRef = useRef<string | null>(null);

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isConversationsError,
  } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: listAIConversations,
    enabled: Boolean(canUseAssistant),
  });

  const {
    data: conversationDetail,
    isLoading: isLoadingConversation,
    isError: isConversationError,
  } = useQuery({
    queryKey: ["ai-conversation", selectedConversationId],
    queryFn: () => getAIConversation(selectedConversationId as string),
    enabled: Boolean(selectedConversationId && canUseAssistant),
  });

  const selectedConversation =
    conversationDetail ||
    conversations.find((conversation) => conversation.id === selectedConversationId);

  useEffect(() => {
    if (isLoadingConversations) return;
    if (!conversations.length) {
      if (!streamingRef.current) setSelectedConversationId(null);
      return;
    }
    if (
      !selectedConversationId ||
      !conversations.some((item) => item.id === selectedConversationId)
    ) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, isLoadingConversations, selectedConversationId]);

  useEffect(() => {
    if (conversationDetail && !streamingRef.current) {
      setMessages(conversationDetail.messages);
    }
  }, [conversationDetail]);

  useEffect(() => {
    const area = messageAreaRef.current;
    if (area) area.scrollTo({ top: area.scrollHeight, behavior: "smooth" });
  }, [messages, activeTool]);

  const createConversation = useMutation({
    mutationFn: () => createAIConversation("read_mode"),
    onSuccess: (conversation) => {
      queryClient.setQueryData<typeof conversations>(
        ["ai-conversations"],
        (current = []) => [conversation, ...current],
      );
      setSelectedConversationId(conversation.id);
      setMessages([]);
      setInputValue("");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not start a new conversation."));
    },
  });

  const removeConversation = useMutation({
    mutationFn: deleteAIConversation,
    onSuccess: (_result, conversationId) => {
      queryClient.setQueryData<typeof conversations>(
        ["ai-conversations"],
        (current = []) => current.filter((item) => item.id !== conversationId),
      );
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
      toast.success("Conversation deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete the conversation."));
    },
  });

  const changeMode = useMutation({
    mutationFn: (mode: AIConversationMode) =>
      changeAIConversationMode(selectedConversationId as string, mode),
    onSuccess: (updated) => {
      queryClient.setQueryData<typeof conversations>(
        ["ai-conversations"],
        (current = []) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
      );
      queryClient.setQueryData(
        ["ai-conversation", updated.id],
        (current: typeof conversationDetail) =>
          current ? { ...current, mode: updated.mode } : current,
      );
      toast.success(
        updated.mode === "action_mode"
          ? "Action mode enabled"
          : "Switched to read-only mode",
      );
      setProposalStates((current) => {
        const next = { ...current };
        for (const chatMessage of messages) {
          for (const result of chatMessage.structured_results ?? []) {
            if (result.kind === "action_proposal" && result.proposal) {
              const existing = next[result.proposal.id];
              if (!existing || existing.status === "pending") {
                next[result.proposal.id] = { status: "cancelled" };
              }
            }
          }
        }
        return next;
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not change conversation mode."));
    },
  });

  const updateAssistantMessage = (
    updater: (message: AIMessage) => AIMessage,
  ) => {
    const assistantId = activeAssistantIdRef.current;
    if (!assistantId) return;
    setMessages((current) =>
      current.map((item) => (item.id === assistantId ? updater(item) : item)),
    );
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !selectedConversation || isStreaming) return;

    const now = new Date().toISOString();
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    activeAssistantIdRef.current = assistantMessageId;
    const optimisticMessages: AIMessage[] = [
      {
        id: userMessageId,
        role: "user",
        status: "completed",
        content: text,
        structured_results: null,
        model: null,
        error: null,
        created_at: now,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        status: "in_progress",
        content: "",
        structured_results: null,
        model: null,
        error: null,
        created_at: now,
      },
    ];

    setMessages((current) => [...current, ...optimisticMessages]);
    setInputValue("");
    setActiveTool(null);
    setIsStreaming(true);
    streamingRef.current = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamAIConversationTurn(
        selectedConversation.id,
        text,
        selectedConversation.mode,
        ({ event, data }) => {
          if (event === "turn_started" && typeof data.message_id === "string") {
            const persistedId = data.message_id;
            const temporaryId = activeAssistantIdRef.current;
            activeAssistantIdRef.current = persistedId;
            setMessages((current) =>
              current.map((item) =>
                item.id === temporaryId ? { ...item, id: persistedId } : item,
              ),
            );
          }
          if (event === "tool_started" && typeof data.name === "string") {
            setActiveTool(data.name);
          }
          if (event === "tool_finished") setActiveTool(null);
          if (event === "result_block" || event === "action_proposal") {
            const result = data as AIStructuredResult;
            updateAssistantMessage((item) => ({
              ...item,
              structured_results: [...(item.structured_results ?? []), result],
            }));
          }
          if (event === "text_delta" && typeof data.text === "string") {
            setActiveTool(null);
            updateAssistantMessage((item) => ({
              ...item,
              content: item.content + data.text,
            }));
          }
          if (event === "error") {
            const errorText =
              typeof data.message === "string" ? data.message : "AI turn failed";
            updateAssistantMessage((item) => ({
              ...item,
              status: "failed",
              error: errorText,
              content: item.content || errorText,
            }));
          }
          if (event === "done") {
            const status = data.status === "completed" ? "completed" : "failed";
            updateAssistantMessage((item) => ({ ...item, status }));
          }
        },
        controller.signal,
      );
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === "AbortError";
      updateAssistantMessage((item) => ({
        ...item,
        status: cancelled ? "cancelled" : "failed",
        error: cancelled ? "Response stopped" : getErrorMessage(error, "AI turn failed"),
        content:
          item.content ||
          (cancelled
            ? "Response stopped."
            : getErrorMessage(error, "I could not complete that request.")),
      }));
    } finally {
      streamingRef.current = false;
      abortControllerRef.current = null;
      activeAssistantIdRef.current = null;
      setActiveTool(null);
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["ai-conversation", selectedConversation.id],
      });
    }
  };

  const updateProposal = (proposal: AIActionProposal) => {
    setProposalStates((current) => ({
      ...current,
      [proposal.id]: {
        status: proposal.status,
        result: proposal.result,
        error: proposal.error,
      },
    }));
  };

  const handleConfirmProposal = async (proposalId: string) => {
    setBusyProposalId(proposalId);
    try {
      const proposal = await confirmAIAction(proposalId);
      updateProposal(proposal);
      toast.success(
        proposal.result?.warning
          ? "Action completed with a warning"
          : "Action completed successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["organization-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not confirm the action."));
    } finally {
      setBusyProposalId(null);
    }
  };

  const handleCancelProposal = async (proposalId: string) => {
    setBusyProposalId(proposalId);
    try {
      const proposal = await cancelAIAction(proposalId);
      updateProposal(proposal);
      toast.success("Action cancelled");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not cancel the action."));
    } finally {
      setBusyProposalId(null);
    }
  };

  const quickPrompts =
    selectedConversation?.mode === "action_mode" ? ACTION_PROMPTS : READ_PROMPTS;

  const renderedMessages = useMemo(
    () => messages.filter((item) => item.role !== "tool"),
    [messages],
  );

  if (profileLoading || !user) return <LoadingSpinner />;

  if (!canUseAssistant) {
    return (
      <Card>
        <Empty description="The AI assistant is available to organization administrators and HR managers." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
          <p className="mt-1 text-gray-600">
            Ask questions about your HRX data or safely prepare HR actions
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="!bg-primaryColor"
          loading={createConversation.isPending}
          disabled={isStreaming}
          onClick={() => createConversation.mutate()}
        >
          New conversation
        </Button>
      </div>

      <div className="grid min-h-[680px] grid-cols-1 gap-4 lg:h-[calc(100vh-210px)] lg:max-h-[900px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card
          className="h-full overflow-hidden"
          styles={{ body: { height: "100%", padding: 0 } }}
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-800">Conversations</p>
          </div>
          <div className="max-h-[620px] overflow-y-auto p-2">
            {isLoadingConversations ? (
              <div className="flex justify-center py-10">
                <Spin />
              </div>
            ) : isConversationsError ? (
              <Alert type="error" showIcon message="Could not load conversations" />
            ) : conversations.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No conversations yet"
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={createConversation.isPending}
                  onClick={() => createConversation.mutate()}
                >
                  Start one
                </Button>
              </Empty>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const selected = conversation.id === selectedConversationId;
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={conversation.id}
                      onClick={() => {
                        if (isStreaming) return;
                        setSelectedConversationId(conversation.id);
                        setMessages([]);
                      }}
                      onKeyDown={(event) => {
                        if (
                          !isStreaming &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          event.preventDefault();
                          setSelectedConversationId(conversation.id);
                          setMessages([]);
                        }
                      }}
                      className={`group w-full rounded-xl px-3 py-3 text-left transition-colors ${
                        selected
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageOutlined className="mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {conversation.title || "New conversation"}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-400">
                              {formatDate(conversation.updated_at)}
                            </span>
                            <Tag
                              bordered={false}
                              color={
                                conversation.mode === "action_mode" ? "orange" : "blue"
                              }
                            >
                              {conversation.mode === "action_mode" ? "Actions" : "Ask"}
                            </Tag>
                          </div>
                        </div>
                        <Popconfirm
                          title="Delete this conversation?"
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                          disabled={isStreaming}
                          onConfirm={(event) => {
                            event?.stopPropagation();
                            removeConversation.mutate(conversation.id);
                          }}
                          onCancel={(event) => event?.stopPropagation()}
                        >
                          <Tooltip title="Delete">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              className="opacity-0 group-hover:opacity-100"
                              onClick={(event) => event.stopPropagation()}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card
          className="h-full overflow-hidden"
          styles={{ body: { height: "100%", padding: 0 } }}
        >
          {!selectedConversation ? (
            <div className="flex min-h-[680px] items-center justify-center p-6">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Start a conversation to use the HRX assistant"
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={createConversation.isPending}
                  onClick={() => createConversation.mutate()}
                >
                  New conversation
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="flex h-full min-h-[680px] flex-col">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    size={42}
                    icon={<RobotOutlined />}
                    className="!bg-blue-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedConversation.title || "New conversation"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Organization-scoped · conversation history saved
                    </p>
                  </div>
                </div>
                <Tooltip
                  title={
                    selectedConversation.mode === "action_mode"
                      ? "Actions are only executed after you confirm a proposal."
                      : "Read mode can inspect data but cannot change it."
                  }
                >
                  <Segmented
                    options={MODE_OPTIONS}
                    value={selectedConversation.mode}
                    disabled={isStreaming || changeMode.isPending}
                    onChange={(value) =>
                      changeMode.mutate(value as AIConversationMode)
                    }
                  />
                </Tooltip>
              </div>

              {selectedConversation.mode === "action_mode" && (
                <Alert
                  banner
                  showIcon
                  icon={<SafetyCertificateOutlined />}
                  type="warning"
                  message="Action mode prepares changes for your review. Nothing is executed without confirmation."
                />
              )}

              <div
                ref={messageAreaRef}
                className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gray-50/50 px-4 py-5 sm:px-6"
              >
                {isConversationError ? (
                  <Alert
                    type="error"
                    showIcon
                    message="Could not load this conversation"
                  />
                ) : isLoadingConversation && messages.length === 0 ? (
                  <div className="flex justify-center py-16">
                    <Spin />
                  </div>
                ) : renderedMessages.length === 0 ? (
                  <div className="mx-auto flex max-w-xl flex-col items-center py-14 text-center">
                    <div className="mb-4 rounded-2xl bg-blue-100 p-4">
                      <RobotOutlined className="text-4xl text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      How can I help with HRX today?
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      I can inspect organization, employee, job, and application data.
                      Switch to Actions when you want to prepare a controlled change.
                    </p>
                    <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          type="button"
                          key={prompt}
                          onClick={() => setInputValue(prompt)}
                          className="rounded-xl border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 transition hover:border-blue-300 hover:text-blue-700"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderedMessages.map((chatMessage) => {
                    const isUser = chatMessage.role === "user";
                    return (
                      <div
                        key={chatMessage.id}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex max-w-[92%] items-start gap-2 sm:max-w-[82%] ${
                            isUser ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Avatar
                            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                            className={isUser ? "!bg-purple-500" : "!bg-blue-600"}
                          />
                          <div className="min-w-0 max-w-full">
                            <div
                              className={`min-w-0 max-w-full overflow-hidden rounded-2xl px-4 py-3 [overflow-wrap:anywhere] ${
                                isUser
                                  ? "rounded-tr-sm bg-blue-600 text-white"
                                  : "rounded-tl-sm border border-gray-200 bg-white text-gray-800 shadow-sm"
                              }`}
                            >
                              {chatMessage.content &&
                                (isUser ? (
                                  <p className="whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">
                                    {chatMessage.content}
                                  </p>
                                ) : (
                                  <MarkdownMessage content={chatMessage.content} />
                                ))}
                              {(chatMessage.structured_results ?? []).map(
                                (result, index) =>
                                  result.kind === "action_proposal" && result.proposal ? (
                                    <ActionProposalCard
                                      key={`${chatMessage.id}-${index}`}
                                      proposal={result.proposal}
                                      state={proposalStates[result.proposal.id]}
                                      busy={busyProposalId === result.proposal.id}
                                      onConfirm={() =>
                                        handleConfirmProposal(result.proposal!.id)
                                      }
                                      onCancel={() =>
                                        handleCancelProposal(result.proposal!.id)
                                      }
                                    />
                                  ) : (
                                    <StructuredResultCard
                                      key={`${chatMessage.id}-${index}`}
                                      result={result}
                                    />
                                  ),
                              )}
                              {!isUser &&
                                chatMessage.status === "in_progress" &&
                                !chatMessage.content && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Spin size="small" />
                                    <span>
                                      {activeTool
                                        ? `Checking ${humanize(activeTool)}…`
                                        : "Thinking…"}
                                    </span>
                                  </div>
                                )}
                              {chatMessage.error && (
                                <p className="mt-2 text-xs text-red-600">
                                  {chatMessage.error}
                                </p>
                              )}
                            </div>
                            <p
                              className={`mt-1 px-2 text-xs text-gray-400 ${
                                isUser ? "text-right" : ""
                              }`}
                            >
                              {formatDate(chatMessage.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
                {renderedMessages.length > 0 && !isStreaming && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {quickPrompts.slice(0, 3).map((prompt) => (
                      <button
                        type="button"
                        key={prompt}
                        onClick={() => setInputValue(prompt)}
                        className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-blue-300 hover:text-blue-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Input.TextArea
                    value={inputValue}
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    maxLength={20_000}
                    placeholder={
                      selectedConversation.mode === "action_mode"
                        ? "Describe the HR action you want to prepare…"
                        : "Ask about your organization, jobs, or candidates…"
                    }
                    disabled={isStreaming}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    className="!rounded-xl"
                  />
                  {isStreaming ? (
                    <Button
                      danger
                      size="large"
                      icon={<StopOutlined />}
                      onClick={() => abortControllerRef.current?.abort()}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      disabled={!inputValue.trim()}
                      className="!bg-primaryColor"
                      onClick={() => void handleSendMessage()}
                    >
                      Send
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  AI answers can be incomplete. Review proposed actions before confirming.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
