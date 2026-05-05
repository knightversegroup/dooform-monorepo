import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Trash2 } from 'lucide-react';
import { useQuery as _useQuery } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  listComments,
} from '../../lib/api/comments';
import { listUsers } from '../../lib/api/users';
import { queryKeys } from '../../lib/queryClient';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Spinner } from '../ui/Spinner';

interface CommentsThreadProps {
  documentId: string;
  canComment: boolean;
  currentUserId: string;
}

export function CommentsThread({
  documentId,
  canComment,
  currentUserId,
}: CommentsThreadProps) {
  const queryClient = useQueryClient();
  const commentsQuery = useQuery({
    queryKey: queryKeys.comments.forDocument(documentId),
    queryFn: () => listComments(documentId),
  });
  const usersQuery = _useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => listUsers(),
  });
  const userMap = new Map(
    (usersQuery.data?.data ?? []).map((u) => [u.id, u.displayName])
  );

  const [body, setBody] = useState('');
  const createMutation = useMutation({
    mutationFn: () => createComment(documentId, { body }),
    onSuccess: () => {
      setBody('');
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.forDocument(documentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.forDocument(documentId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(documentId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.forDocument(documentId) });
    },
  });

  const comments = commentsQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-3">
      {commentsQuery.isLoading ? (
        <Spinner />
      ) : commentsQuery.error ? (
        <ErrorMessage error={commentsQuery.error} />
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-muted">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-border-default bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {userMap.get(c.userId) ?? c.userId}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                  </div>
                </div>
                {c.userId === currentUserId ? (
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
              <p className="text-sm text-ink-subtle whitespace-pre-wrap mt-1">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {canComment ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) createMutation.mutate();
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Leave a comment…"
            className="w-full px-3 py-2 text-sm border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {createMutation.error ? (
            <ErrorMessage error={createMutation.error} />
          ) : null}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!body.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? <Spinner className="text-white" /> : <Send className="w-4 h-4" />}
              Post comment
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
