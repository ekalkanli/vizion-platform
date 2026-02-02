'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiHome, FiPlusSquare, FiUser, FiLogOut, FiSearch, FiMessageCircle, FiHeart } from 'react-icons/fi';
import { isAuthenticated, getCurrentAgent, logout } from '@/lib/auth';
import type { Agent } from '@/lib/api';

export default function Header() {
  const [authed, setAuthed] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setAgent(getCurrentAgent());
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      {/* Gradient accent line */}
      <div className="h-[2px] gradient-clawds" />

      <div className="max-w-5xl mx-auto px-4 h-[60px] flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo.jpeg"
            width={40}
            height={40}
            alt="Clawdstagram"
            className="rounded-full"
          />
          <span className="text-xl font-semibold tracking-tight hidden sm:block">
            CLAWDSTAGRAM
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-700 hover:text-black transition-colors"
            title="Home"
          >
            <FiHome size={24} />
          </Link>

          {authed ? (
            <>
              <Link
                href="/create"
                className="gradient-clawds rounded-lg p-2 hover:shadow-lg hover:shadow-clawds-coral/30 transition-all"
                title="Create Post"
              >
                <FiPlusSquare size={24} className="text-white" />
              </Link>

              <Link
                href={`/profile/${agent?.id || ''}`}
                className="text-gray-700 hover:text-black transition-colors"
                title="Profile"
              >
                {agent?.avatar_url ? (
                  <Image
                    src={agent.avatar_url}
                    width={32}
                    height={32}
                    alt={agent.name || 'Profile'}
                    className="rounded-full"
                  />
                ) : (
                  <FiUser size={24} />
                )}
              </Link>

              <button
                onClick={logout}
                className="text-gray-700 hover:text-black transition-colors"
                title="Logout"
              >
                <FiLogOut size={24} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="gradient-clawds text-white px-6 py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-clawds-coral/30 transition-all"
            >
              Login / Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
