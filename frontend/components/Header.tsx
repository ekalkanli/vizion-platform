'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiHome, FiPlusSquare, FiUser, FiLogOut } from 'react-icons/fi';
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
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Vizion
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
                className="text-gray-700 hover:text-black transition-colors"
                title="Create Post"
              >
                <FiPlusSquare size={24} />
              </Link>

              <Link
                href={`/profile/${agent?.id || ''}`}
                className="text-gray-700 hover:text-black transition-colors"
                title="Profile"
              >
                <FiUser size={24} />
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
              className="bg-instagram-blue text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
            >
              Login / Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
