import { useState, useEffect } from 'react';
import axios from 'axios';
import MessageList from './components/MessageList';
import AIAnalyzer from './components/AIAnalyzer';
import SearchBar from './components/SearchBar';
import ConversationHistory, { type Conversation } from './components/ConversationHistory';
import ChatInterface from './components/ChatInterface';
import MessageSelectionModal from './components/MessageSelectionModal';

import './App.css';
import './index.css'

//import "tailwindcss";

const API_URL = import.meta.env.VITE_API_URL || 'http://0.0.0.0:3000';

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
  group_chat_id: number | null;
  group_chat_title: string | null;
}

interface Group {
  id: number;
  title: string;
}

type View = 'archive' | 'chat';

export default function App() {
  // ── Archive view state ──────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);

  // ── Chat view state ─────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('archive');
  const [showConvHistory, setShowConvHistory] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  const [showMessageModal, setShowMessageModal] = useState(false);

  // ── Archive effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchGroups();
    fetchMessages();
  }, [selectedGroup]);

  // ── Chat effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat') {
      fetchConversations();
    }
  }, [view]);

  // ── Archive fetchers ────────────────────────────────────────────────────────
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = selectedGroup ? { group_id: selectedGroup } : {};
      const res = await axios.get(`${API_URL}/api/messages`, { params });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Chat fetchers / actions ─────────────────────────────────────────────────
  const fetchConversations = async () => {
    setConvLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/conversations`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setConvLoading(false);
    }
  };
  /*
  const createConversation = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/conversations`, {
        title: 'New Conversation',
      });
      const newConv: Conversation = res.data;
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConvId(newConv.id);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };
  */
  
  const renameConversation = async (id: number, title: string) => {
    try {
      await axios.patch(`${API_URL}/api/conversations/${id}`, { title });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };
  

  const createConversation = async (
    selectedGroupIds?: number[],
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const res = await axios.post(`${API_URL}/api/conversations`, {
        title: 'New Conversation',
        selected_group_ids: selectedGroupIds,
        start_date: startDate,
        end_date: endDate,
      });
      // ... rest of function
      const newConv: Conversation = res.data;
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConvId(newConv.id);
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleTitleChange = (id: number, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
      )
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100">
      {/* ── Left sidebar: archive groups OR conversation history ── */}
      {view === 'archive' ? (
        <div className="w-64 bg-white shadow-lg p-6 flex-shrink-0">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Chat Archive</h1>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Groups</h2>
            <button
              onClick={() => setSelectedGroup(null)}
              className={`w-full text-left px-3 py-2 rounded mb-2 ${
                selectedGroup === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Messages
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`w-full text-left px-3 py-2 rounded mb-2 ${
                  selectedGroup === group.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {group.title || `Group ${group.id}`}
              </button>
            ))}
          </div>
        </div>
      ) : (
        showConvHistory && (
          <div className="w-72 flex-shrink-0 shadow-lg">
            <ConversationHistory
              conversations={conversations}
              selectedId={selectedConvId}
              loading={convLoading}
              onSelect={setSelectedConvId}
              onNew={() => setShowMessageModal(true)}
              //onNew={createConversation}
              onRename={renameConversation}
            />
          </div>
        )
      )}

      {showMessageModal && (
        <MessageSelectionModal
          groups={groups}
          onConfirm={(groupIds, start, end) => {
            createConversation(groupIds, start, end);
            setShowMessageModal(false);
          }}
          onCancel={() => setShowMessageModal(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white shadow px-6 py-4 border-b flex items-center gap-4 flex-shrink-0">
          {/* Title / breadcrumb */}
          <div className="flex-1 min-w-0">
            {view === 'archive' ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 truncate">
                  {selectedGroup
                    ? groups.find((g) => g.id === selectedGroup)?.title || 'Group Messages'
                    : 'All Messages'}
                </h2>
                <p className="text-sm text-gray-500">{messages.length} messages</p>
              </>
            ) : (
              <h2 className="text-xl font-bold text-gray-800">AI Chat</h2>
            )}
          </div>

          {/* View toggle buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Toggle conversation sidebar (chat view only) */}
            {view === 'chat' && (
              <button
                onClick={() => setShowConvHistory((v) => !v)}
                title={showConvHistory ? 'Hide conversation list' : 'Show conversation list'}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </button>
            )}

            {/* Archive / Chat switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setView('archive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'archive'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                Archive
              </button>
              <button
                onClick={() => setView('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'chat'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        {view === 'archive' ? (
          <div className="flex-1 overflow-hidden flex gap-4 p-6">
            {/* Messages panel */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow min-w-0">
              <SearchBar apiUrl={API_URL} onResults={setMessages} />
              <MessageList
                messages={messages}
                loading={loading}
                onSelect={setSelectedMessages}
              />
            </div>

            {/* AI analysis panel */}
            <div className="w-96 bg-white rounded-lg shadow flex flex-col flex-shrink-0">
              <AIAnalyzer
                messages={selectedMessages.length > 0 ? selectedMessages : messages}
                apiUrl={API_URL}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {selectedConvId !== null ? (
              <ChatInterface
                key={selectedConvId}
                conversationId={selectedConvId}
                apiUrl={API_URL}
                onTitleChange={handleTitleChange}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-500">No conversation selected</p>
                  <p className="text-sm mt-1">
                    Pick one from the sidebar or{' '}
                    <button
                      onClick={createConversation}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      start a new chat
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
