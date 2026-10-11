"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { LevelCard } from '@/components/LevelCard';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

const LEVELS: {
  id: Difficulty;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
}[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Learn the basics with helpful guidance.',
      icon: '🌱',
      color: 'green',
      features: [
        'Unlimited hints available',
        'Move expanations',
        'Forgiving evaluation',
        'Takebacks allowed'
      ]
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Standard games to sharpen your tactics.',
      icon: '⚔️',
      color: 'blue',
      features: [
        'Limited hints',
        'General mistake alerts',
        'Standard evaluation',
        'Tactical opportunities'
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Strict mastery with no assistance.',
      icon: '👑',
      color: 'orange',
      features: [
        'No hints allowed',
        'Delayed feedback',
        'Strict move grading',
        'Complex positions'
      ]
    },
    {
      id: 'master',
      title: 'Master',
      description: 'The ultimate test of chess skill.',
      icon: '💀',
      color: 'red',
      features: [
        'Grandmaster strength',
        'Zero assistance',
        'Brutal evaluation',
        'Perfect play required'
      ]
    }
  ];

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>('intermediate');
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <main className="flex flex-col items-center text-center z-10 w-full max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 relative">
            <span className="text-gradient drop-shadow-2xl">Chessy</span>
            {/* Decorative sparkle/accent could go here */}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary font-light tracking-wide max-w-2xl mx-auto">
            Choose your difficulty and master the board.
          </p>
        </div>

        {/* Level Selection */}
        <div
          role="radiogroup"
          aria-label="Select difficulty level"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150"
        >
          {LEVELS.map((level) => (
            <LevelCard
              key={level.id}
              {...level}
              isSelected={selectedLevel === level.id}
              onClick={() => setSelectedLevel(level.id)}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            href={`/play?difficulty=${selectedLevel}`}
            className="group relative inline-flex items-center justify-center px-16 py-6 font-bold text-white transition-all duration-200 bg-primary font-sans rounded-full hover:scale-105 active:scale-95 text-xl tracking-wider shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)]"
          >
            Start Game
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>

            {/* Button flair */}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
          </Link>
          <p className="mt-6 text-sm text-text-secondary/60 font-medium">
            Ready to challenge yourself?
          </p>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-text-secondary/40 font-mono">
        Chessy v1.0
      </footer>
    </div>
  );
}
