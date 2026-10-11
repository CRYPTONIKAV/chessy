'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

const LEVELS: { id: Difficulty; title: string; description: string; icon: string }[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Learn the basics. Mistakes are forgiven.',
    icon: '🌱'
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Sharpen your tactics. Serious training.',
    icon: '⚔️'
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Mastery required. Unforgiving feedback.',
    icon: '👑'
  },
  {
    id: 'master',
    title: 'Master',
    description: 'Near perfect play. Maximum challenge.',
    icon: '💀'
  }
];

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>('intermediate');
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background text-foreground">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex flex-col items-center text-center z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">
            <span className="text-gradient drop-shadow-2xl">Chessy</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary font-light tracking-wide">
            Master the board, one move at a time.
          </p>
        </div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          {LEVELS.map((level) => (
            <div
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`
                relative group cursor-pointer p-8 rounded-2xl border transition-all duration-300
                ${selectedLevel === level.id
                  ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] scale-105'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-102'}
              `}
            >
              <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110 duration-300">{level.icon}</div>
              <h3 className={`text-2xl font-bold mb-2 ${selectedLevel === level.id ? 'text-primary' : 'text-foreground'}`}>
                {level.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {level.description}
              </p>

              {/* Checkmark for active state */}
              {selectedLevel === level.id && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black text-xs font-bold animate-in zoom-in duration-300">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            href={`/play?difficulty=${selectedLevel}`}
            className="group relative inline-flex items-center justify-center px-12 py-6 font-bold text-white transition-all duration-200 bg-primary font-sans rounded-full hover:scale-105 active:scale-95 text-xl tracking-wider shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)]"
          >
            Begin Training
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-text-secondary/60">
            No signup required. Instant start.
          </p>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-text-secondary/40 font-mono">
      </footer>
    </div>
  );
}
