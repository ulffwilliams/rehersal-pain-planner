'use client';

import { useState } from 'react';

export function CreateBandForm() {
  const [bandName, setBandName] = useState('');
  const [members, setMembers] = useState(['', '', '', '']);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const addMember = () => setMembers(prev => [...prev, '']);

  const updateMember = (idx: number, value: string) =>
    setMembers(prev => prev.map((m, i) => (i === idx ? value : m)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = members.filter(m => m.trim());
    if (!bandName.trim() || valid.length < 1) return;

    setLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: bandName.trim(), members: valid }),
      });
      const data = await res.json();
      setCreatedLink(`${window.location.origin}/group/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdLink) {
    return (
      <div>
        <h2 className="text-xl font-black mb-2">🎸 Länken är klar!</h2>
        <p className="font-bold mb-4">Skicka den här länken till alla i bandet!</p>
        <div className="border-2 border-black bg-yellow-100 p-3 font-mono text-sm break-all mb-4">
          {createdLink}
        </div>
        <button
          onClick={handleCopy}
          className="w-full border-2 border-black bg-yellow-300 shadow-[4px_4px_0_black] p-4 font-black text-lg hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          {copied ? '✅ Kopierat!' : '📋 Kopiera länk'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block font-black mb-2">Bandets namn</label>
        <input
          type="text"
          value={bandName}
          onChange={e => setBandName(e.target.value)}
          placeholder="The Broken Strings"
          className="w-full border-2 border-black p-3 font-bold text-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
          required
        />
      </div>

      <div>
        <label className="block font-black mb-2">Bandmedlemmar</label>
        <div className="flex flex-col gap-2">
          {members.map((m, idx) => (
            <input
              key={idx}
              type="text"
              value={m}
              onChange={e => updateMember(idx, e.target.value)}
              placeholder={`Lägg till namn...`}
              className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addMember}
          className="mt-2 border-2 border-black bg-white shadow-[2px_2px_0_black] px-4 py-2 font-bold hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          + Lägg till bandmedlem
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="border-2 border-black bg-yellow-300 shadow-[6px_6px_0_black] p-4 font-black text-xl hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Skapar...' : 'Skapa band & generera länk 🎸'}
      </button>
    </form>
  );
}
