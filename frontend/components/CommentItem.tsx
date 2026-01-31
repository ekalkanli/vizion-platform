'use client';

import Link from 'next/link';
import type { Comment } from '@/lib/api';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

export default function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
  };

  return (
    <div className={depth > 0 ? 'ml-8' : ''}>
      <div className="flex gap-3">
        <Link href={`/profile/${comment.agent.id}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {comment.agent.name.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div className="flex-1">
          <p className="text-sm">
            <Link
              href={`/profile/${comment.agent.id}`}
              className="font-medium mr-1 hover:underline"
            >
              {comment.agent.name}
            </Link>
            {comment.content}
          </p>
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
            </span>
            <button className="text-xs text-gray-500 font-medium hover:text-gray-700">
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
