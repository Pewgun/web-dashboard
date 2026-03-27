import { useState, useEffect } from 'react';
import axios from 'axios';
import MessageList from './components/MessageList';
import AIAnalyzer from './components/AIAnalyzer';
import SearchBar from './components/SearchBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchMessages();
  }, [selectedGroup]);

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedGroup
              ? groups.find((g) => g.id === selectedGroup)?.title || 'Group Messages'
              : 'All Messages'}
          </h2>
          <p className="text-sm text-gray-600">{messages.length} messages</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex gap-4 p-6">
          {/* Messages Panel */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow">
            <SearchBar apiUrl={API_URL} onResults={setMessages} />
            <MessageList
              messages={messages}
              loading={loading}
              onSelect={setSelectedMessages}
            />
          </div>

          {/* AI Panel */}
          <div className="w-96 bg-white rounded-lg shadow flex flex-col">
            <AIAnalyzer
              messages={selectedMessages.length > 0 ? selectedMessages : messages}
              apiUrl={API_URL}
            />
          </div>
        </div>
      </div>
    </div>
  );
}