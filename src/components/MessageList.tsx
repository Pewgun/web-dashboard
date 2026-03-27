import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
  group_chat_id: number | null;
  group_chat_title: string | null;
}

interface Props {
  messages: Message[];
  loading: boolean;
  onSelect: (messages: Message[]) => void;
}

export default function MessageList({ messages, loading, onSelect }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onSelect(messages.filter((m) => newSelected.has(m.id)));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No messages found</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded border-l-4 cursor-pointer transition ${
                selectedIds.has(msg.id)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => toggleSelect(msg.id)}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(msg.id)}
                  onChange={() => toggleSelect(msg.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{msg.username}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                    </span>
                  </div>
                  {msg.group_chat_title && (
                    <div className="text-xs text-gray-500 mb-1">
                      in {msg.group_chat_title}
                    </div>
                  )}
                  <p className="text-gray-700 break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}