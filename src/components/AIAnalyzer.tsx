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
  messages: Message[];
  apiUrl: string;
}

export default function AIAnalyzer({ messages, apiUrl }: Props) {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (messages.length === 0) {
      setError('Please select messages to analyze');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${apiUrl}/api/ai/gemanalyze`, {
        messages,
        prompt: prompt || 'Summarize the main topics discussed in these messages.',
      });
      setAnalysis(res.data.analysis);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">AI Analysis</h3>

      <div className="flex-1 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Analysis Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What would you like to know about these messages?"
            className="w-full h-24 p-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || messages.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded font-medium hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : `Analyze (${messages.length} selected)`}
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {analysis && (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 rounded text-sm text-gray-700">
            {analysis}
          </div>
        )}
      </div>
    </div>
  );
}
