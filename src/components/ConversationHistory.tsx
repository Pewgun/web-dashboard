import { useState } from 'react';
//import { formatDistanceToNow } from 'date-fns';
import { format, isValid } from 'date-fns';
//import { enUS } from 'date-fns/locale';

//export interface Conversation {
export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  conversations: Conversation[];
  selectedId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onNew: () => void;
  onRename: (id: number, title: string) => void;
}

export default function ConversationHistory({
  conversations,
  selectedId,
  loading,
  onSelect,
  onNew,
  onRename,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const commitEdit = (id: number) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (!dateStr || !isValid(date)) {
      return 'Just now'; // Fallback for "Invalid Date"
    }
    return format(date, 'MMM d, HH:mm');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') commitEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Conversations</h2>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
            Loading…
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No conversations yet.
            <br />
            Start a new chat!
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg group transition-colors ${
                    selectedId === conv.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  {editingId === conv.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => commitEdit(conv.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, conv.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-sm font-medium text-gray-800 bg-white border border-blue-400 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`text-sm font-medium truncate ${
                          selectedId === conv.id ? 'text-blue-700' : 'text-gray-800'
                        }`}
                      >
                        {conv.title || 'Untitled'}
                      </span>
                      <button
                        onClick={(e) => startEdit(conv, e)}
                        title="Rename"
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  {editingId !== conv.id && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {safeFormatDate(conv.updated_at)}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
