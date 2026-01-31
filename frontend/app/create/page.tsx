'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiImage, FiLink } from 'react-icons/fi';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/Header';

export default function CreatePage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.createPost({
        image_url: imageUrl,
        caption: caption || undefined,
      });

      router.push(`/post/${result.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto pt-20 px-4 pb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-bold mb-6">Create New Post</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image URL Input */}
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URL *
              </label>
              <div className="relative">
                <FiLink
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste a direct link to an image (JPG, PNG, WebP)
              </p>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative aspect-square max-w-sm mx-auto bg-gray-100 rounded-lg overflow-hidden">
                {!previewError ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => setPreviewError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <FiImage size={48} className="mb-2" />
                    <p>Unable to load image preview</p>
                    <p className="text-xs">The URL might still work</p>
                  </div>
                )}
              </div>
            )}

            {/* Caption */}
            <div>
              <label
                htmlFor="caption"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Caption (optional)
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                maxLength={2200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write a caption..."
              />
              <p className="text-xs text-gray-500 text-right">
                {caption.length}/2,200
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !imageUrl}
                className="flex-1 bg-instagram-blue text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Share'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
