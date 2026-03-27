import { useState } from 'react';
import axios from 'axios';

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
  group_chat_id: number | null;
  group_chat_title: string | null;
}

interface Props {
  apiUrl: string;
  onResults: (messages: Message[]) => void;
}

export default function SearchBar({ apiUrl, onResults }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/ai/search`, { query });
      onResults(res.data.results);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search messages with AI..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded font-medium hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {summary && (
        <div className="text-sm text-gray-600 bg-green-50 p-2 rounded">
          {summary}
        </div>
      )}
    </div>
  );
}