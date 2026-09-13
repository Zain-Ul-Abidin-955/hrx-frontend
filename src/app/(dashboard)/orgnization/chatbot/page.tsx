"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Popconfirm,
  Segmented,
  Spin,
  Tooltip,
  message as toast,
} from "antd";
import {
  BulbOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  StopOutlined,
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
import Panel from "@/components/dashboard/Panel";
import { DefinitionGrid } from "@/components/dashboard/DefinitionGrid";
import { getNameInitial } from "@/utils/getNameInitial";
import { getUserDisplayName } from "@/utils/profileHelpers";
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
    { message?: string; detail?: string | { msg?: string }[] } | undefined;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return (
      data.detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(", ") || fallback
    );
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

/** The assistant's gradient mark — same identity as the rail and landing page. */
function BotMark({ size = 32 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accentColor to-glowColor text-white"
    >
      <RobotOutlined />
    </span>
  );
}

/** Centred empty/permission state shared by the rail and the thread. */
function EmptyState({
  icon,
  title,
  body,
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 px-6 py-12 text-center ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentColor/10 text-lg text-accentDeepColor">
        {icon ?? <InboxOutlined />}
      </span>
      <p className="mt-1 text-sm font-medium text-blackColor">{title}</p>
      {body && <p className="max-w-sm text-sm text-grayColor">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="max-w-full text-sm leading-6 [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-xl font-bold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-lg font-bold first:mt-0">
              {children}
            </h2>
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
            <strong className="font-semibold text-blackColor">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          hr: () => <hr className="my-4 border-[#ECEEF3]" />,
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-r-lg border-l-2 border-accentColor/50 bg-accentColor/[0.06] px-3 py-2 text-secondaryTextColor">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="!text-accentDeepColor underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) =>
            className ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-accentColor/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accentDeepColor">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="my-3 max-w-full overflow-x-auto rounded-xl bg-nightColor p-3 text-xs leading-5 text-lightColor">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 max-w-full overflow-x-auto">
              <table className="min-w-full border-collapse overflow-hidden rounded-lg text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[#ECEEF3] bg-offWhiteColor px-3 py-2 font-semibold text-secondaryTextColor">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#ECEEF3] px-3 py-2">{children}</td>
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
    <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-[#ECEEF3] bg-whiteColor p-3 [overflow-wrap:anywhere]">
      <p className="break-words text-sm font-medium text-blackColor [overflow-wrap:anywhere]">
        {recordTitle(record, index)}
      </p>
      {details.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {details.map(([key, value]) => (
            <span
              key={key}
              className={`max-w-full whitespace-normal break-words rounded-md px-2 py-0.5 text-xs [overflow-wrap:anywhere] ${
                key.includes("score")
                  ? "bg-accentColor/10 font-medium text-accentDeepColor"
                  : "bg-offWhiteColor text-grayColor"
              }`}
            >
              <span className="text-darkGrayColor">{humanize(key)}:</span>{" "}
              {displayValue(value)}
            </span>
          ))}
        </div>
      )}
      {typeof record.snippet === "string" && (
        <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-grayColor [overflow-wrap:anywhere]">
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
    <div className="mt-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-accentColor/20 bg-accentColor/[0.05] p-3 [overflow-wrap:anywhere]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-accentDeepColor">
          {humanize(result.kind)}
        </p>
        {typeof result.count === "number" && (
          <span className="rounded-md bg-accentColor/10 px-2 py-0.5 text-xs font-medium text-accentDeepColor">
            {result.count} total
          </span>
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
                <p
                  key={`${result.kind}-${index}`}
                  className="text-sm text-gray-700"
                >
                  {displayValue(item)}
                </p>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-darkGrayColor">
            No matching records found.
          </p>
        )
      ) : data && typeof data === "object" ? (
        <DefinitionGrid
          className="!bg-whiteColor"
          items={Object.entries(data as Record<string, unknown>).map(
            ([key, value]) => [humanize(key), displayValue(value)],
          )}
        />
      ) : (
        <p className="break-words text-sm text-secondaryTextColor [overflow-wrap:anywhere]">
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
    <div className="mt-3 min-w-0 max-w-full overflow-hidden rounded-xl border border-amber-300/70 bg-amber-50/70 [overflow-wrap:anywhere]">
      <div className="border-b border-amber-300/60 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <SafetyCertificateOutlined /> Approval required
            </p>
            <p className="mt-1.5 text-sm font-medium text-blackColor">
              {proposal.preview.summary || humanize(proposal.operation)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
              status === "executed"
                ? "bg-emerald-100 text-emerald-800"
                : status === "pending"
                  ? "bg-amber-200/70 text-amber-900"
                  : "bg-offWhiteColor text-grayColor"
            }`}
          >
            {humanize(status)}
          </span>
        </div>
      </div>

      {after && Object.keys(after).length > 0 && (
        <div className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-2">
          {Object.entries(after)
            .slice(0, 10)
            .map(([key, value]) => (
              <div key={key} className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-amber-800/70">
                  {humanize(key)}
                </p>
                <p className="mt-0.5 break-words text-sm text-blackColor [overflow-wrap:anywhere]">
                  {displayValue(value)}
                </p>
              </div>
            ))}
        </div>
      )}

      {status === "pending" && (
        <div className="flex justify-end gap-2 border-t border-amber-300/60 px-4 py-3">
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
              className="!border-amber-600 !bg-amber-600 hover:!border-amber-700 hover:!bg-amber-700"
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
    conversations.find(
      (conversation) => conversation.id === selectedConversationId,
    );

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
      toast.error(
        getErrorMessage(error, "Could not start a new conversation."),
      );
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
      toast.error(
        getErrorMessage(error, "Could not change conversation mode."),
      );
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
              typeof data.message === "string"
                ? data.message
                : "AI turn failed";
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
      const cancelled =
        error instanceof DOMException && error.name === "AbortError";
      updateAssistantMessage((item) => ({
        ...item,
        status: cancelled ? "cancelled" : "failed",
        error: cancelled
          ? "Response stopped"
          : getErrorMessage(error, "AI turn failed"),
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
    selectedConversation?.mode === "action_mode"
      ? ACTION_PROMPTS
      : READ_PROMPTS;

  const renderedMessages = useMemo(
    () => messages.filter((item) => item.role !== "tool"),
    [messages],
  );

  if (profileLoading || !user) return <LoadingSpinner />;

  if (!canUseAssistant) {
    return (
      <div className="hrx-card">
        <EmptyState
          className="py-14"
          title="The assistant is not available for your role"
          body="It is open to organization administrators and HR managers."
        />
      </div>
    );
  }

  const userInitial = getNameInitial(getUserDisplayName(user));

  const newConversationButton = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      loading={createConversation.isPending}
      disabled={isStreaming}
      onClick={() => createConversation.mutate()}
    >
      New conversation
    </Button>
  );

  return (
    <div className="space-y-5">
      {/* ---------- Page header ---------- */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blackColor">
            AI Assistant
          </h1>
          <p className="mt-1 text-sm text-grayColor">
            Ask questions about your HRX data, or prepare HR actions for review.
          </p>
        </div>
        <div className="shrink-0">{newConversationButton}</div>
      </header>

      <div className="grid min-h-[680px] grid-cols-1 gap-4 lg:h-[calc(100vh-210px)] lg:max-h-[900px] lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* ---------- Conversation rail ---------- */}
        <Panel
          flush
          title="Conversations"
          icon={<MessageOutlined />}
          className="h-full overflow-hidden"
          action={
            <Tooltip title="New conversation">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                loading={createConversation.isPending}
                disabled={isStreaming}
                onClick={() => createConversation.mutate()}
              />
            </Tooltip>
          }
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isLoadingConversations ? (
              <div className="flex justify-center py-10">
                <Spin />
              </div>
            ) : isConversationsError ? (
              <EmptyState
                title="Could not load conversations"
                body="Something went wrong fetching your history. Try again in a moment."
              />
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={<MessageOutlined />}
                title="No conversations yet"
                body="Start one to ask the assistant about your workforce."
                action={newConversationButton}
              />
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const selected = conversation.id === selectedConversationId;
                  const isActionMode = conversation.mode === "action_mode";
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
                      className={`group w-full cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "bg-accentColor/10 ring-1 ring-inset ring-accentColor/25"
                          : "hover:bg-offWhiteColor"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm ${
                              selected
                                ? "font-medium text-blackColor"
                                : "text-secondaryTextColor"
                            }`}
                          >
                            {conversation.title || "New conversation"}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                                isActionMode
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-accentColor/10 text-accentDeepColor"
                              }`}
                            >
                              {isActionMode ? "Actions" : "Ask"}
                            </span>
                            <span className="text-xs text-darkGrayColor">
                              {formatDate(conversation.updated_at)}
                            </span>
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
                              aria-label="Delete conversation"
                              className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
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
        </Panel>

        {/* ---------- Thread ---------- */}
        <section className="hrx-card h-full overflow-hidden p-0">
          {!selectedConversation ? (
            <div className="flex min-h-[680px] items-center justify-center">
              <EmptyState
                icon={<RobotOutlined />}
                title="No conversation selected"
                body="Start a conversation to use the HRX assistant."
                action={newConversationButton}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[680px] flex-col">
              {/* thread header */}
              <div className="flex flex-col gap-3 border-b border-[#ECEEF3] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <BotMark size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-blackColor">
                      {selectedConversation.title || "New conversation"}
                    </p>
                    <p className="truncate text-xs text-darkGrayColor">
                      Organization-scoped · history saved
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
                <div className="flex items-center gap-2 border-b border-amber-300/60 bg-amber-50/70 px-5 py-2.5 text-xs text-amber-900">
                  <SafetyCertificateOutlined className="shrink-0" />
                  <span>
                    Action mode prepares changes for your review. Nothing is
                    executed without confirmation.
                  </span>
                </div>
              )}

              <div
                ref={messageAreaRef}
                className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-offWhiteColor px-4 py-5 sm:px-6"
              >
                {isConversationError ? (
                  <EmptyState
                    title="Could not load this conversation"
                    body="Something went wrong fetching the messages. Try again in a moment."
                  />
                ) : isLoadingConversation && messages.length === 0 ? (
                  <div className="flex justify-center py-16">
                    <Spin />
                  </div>
                ) : renderedMessages.length === 0 ? (
                  <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
                    <BotMark size={52} />
                    <h2 className="mt-4 text-lg font-semibold text-blackColor">
                      How can I help with HRX today?
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-grayColor">
                      I can inspect organization, employee, job, and application
                      data. Switch to Actions when you want to prepare a
                      controlled change.
                    </p>
                    <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          type="button"
                          key={prompt}
                          onClick={() => setInputValue(prompt)}
                          className="rounded-xl border border-[#ECEEF3] bg-whiteColor p-3 text-left text-sm text-secondaryTextColor transition-colors hover:border-accentColor/40 hover:text-accentDeepColor"
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
                          {isUser ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accentColor/10 text-xs font-semibold text-accentDeepColor">
                              {userInitial}
                            </span>
                          ) : (
                            <BotMark />
                          )}
                          <div className="min-w-0 max-w-full">
                            <div
                              className={`min-w-0 max-w-full overflow-hidden rounded-2xl px-4 py-3 [overflow-wrap:anywhere] ${
                                isUser
                                  ? "rounded-tr-sm bg-accentDeepColor text-white"
                                  : "rounded-tl-sm border border-[#ECEEF3] bg-whiteColor text-secondaryTextColor"
                              }`}
                            >
                              {chatMessage.content &&
                                (isUser ? (
                                  <p className="whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">
                                    {chatMessage.content}
                                  </p>
                                ) : (
                                  <MarkdownMessage
                                    content={chatMessage.content}
                                  />
                                ))}
                              {(chatMessage.structured_results ?? []).map(
                                (result, index) =>
                                  result.kind === "action_proposal" &&
                                  result.proposal ? (
                                    <ActionProposalCard
                                      key={`${chatMessage.id}-${index}`}
                                      proposal={result.proposal}
                                      state={proposalStates[result.proposal.id]}
                                      busy={
                                        busyProposalId === result.proposal.id
                                      }
                                      onConfirm={() =>
                                        handleConfirmProposal(
                                          result.proposal!.id,
                                        )
                                      }
                                      onCancel={() =>
                                        handleCancelProposal(
                                          result.proposal!.id,
                                        )
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
                                  <div className="flex items-center gap-2 text-sm text-darkGrayColor">
                                    <Spin size="small" />
                                    <span>
                                      {activeTool
                                        ? `Checking ${humanize(activeTool)}…`
                                        : "Thinking…"}
                                    </span>
                                  </div>
                                )}
                              {chatMessage.error && (
                                <p className="mt-2 text-xs text-rose-600">
                                  {chatMessage.error}
                                </p>
                              )}
                            </div>
                            <p
                              className={`mt-1 px-2 text-xs text-darkGrayColor ${
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

              <div className="border-t border-[#ECEEF3] bg-whiteColor px-4 py-4 sm:px-6">
                {renderedMessages.length > 0 && !isStreaming && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {quickPrompts.slice(0, 3).map((prompt) => (
                      <button
                        type="button"
                        key={prompt}
                        onClick={() => setInputValue(prompt)}
                        className="shrink-0 rounded-full border border-[#ECEEF3] px-3 py-1.5 text-xs text-grayColor transition-colors hover:border-accentColor/40 hover:text-accentDeepColor"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2 rounded-xl border border-[#ECEEF3] bg-whiteColor px-3 py-2 transition-colors focus-within:border-accentColor/50">
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
                    variant="borderless"
                    className="!bg-transparent !px-0 !shadow-none"
                  />
                  {isStreaming ? (
                    <Button
                      danger
                      icon={<StopOutlined />}
                      onClick={() => abortControllerRef.current?.abort()}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      disabled={!inputValue.trim()}
                      onClick={() => void handleSendMessage()}
                    >
                      Send
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-center text-[11px] text-darkGrayColor">
                  AI answers can be incomplete. Review proposed actions before
                  confirming.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
