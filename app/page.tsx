import { PainFace } from '@/components/PainFace';
import { CreateBandForm } from '@/components/CreateBandForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-lg mx-auto p-4 py-8">
        <div className="mb-6">
          <h1 className="text-5xl font-black leading-none mb-2 tracking-tight">
            Rehearsal<br />Planner
          </h1>
          <p className="text-lg font-bold border-l-4 border-black pl-3">
            Ta reda på när hela bandet kan repa
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3, 4, 5, 6].map(v => (
            <PainFace key={v} value={v} size="md" />
          ))}
        </div>

        <div className="border-2 border-black bg-white shadow-[6px_6px_0_black] p-6">
          <CreateBandForm />
        </div>
      </div>
    </main>
  );
}
