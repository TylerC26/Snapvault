import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Valid event codes - in production, these would come from Firestore or your backend
const VALID_CODES = ['TESTWEDDING'];

export default function EventCodeEntry() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a wedding code');
      return;
    }
    if (!VALID_CODES.includes(trimmed)) {
      setError('Please enter a valid wedding code');
      return;
    }
    setError('');
    navigate(`/event/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm px-2">
        <h1 className="font-display text-3xl md:text-4xl font-serif text-center text-[#4a4a4a] mb-2">
          SnapVault
        </h1>
        <p className="text-center text-[#8a8a8a] mb-8 font-medium">
          Wedding Memories
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="code" className="block text-sm font-medium text-[#4a4a4a]">
            Enter wedding code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="e.g. ABC123"
            className="w-full px-4 py-4 text-lg rounded-xl border-2 border-[#e8d9a8] bg-white focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/30 outline-none transition"
            autoComplete="off"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}
          <button
            type="submit"
            className="w-full min-h-[48px] py-4 rounded-xl bg-[#c9a227] text-white font-semibold text-lg shadow-md hover:bg-[#b8911f] active:scale-[0.98] transition touch-manipulation"
          >
            Enter
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#8a8a8a]">
          Use code <span className="font-mono font-medium text-[#4a4a4a]">TESTWEDDING</span> for testing
        </p>
      </div>
    </div>
  );
}
