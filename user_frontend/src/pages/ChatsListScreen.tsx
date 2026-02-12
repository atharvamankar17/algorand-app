import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getChatsList } from '@/services/api';
import { MessageCircle } from 'lucide-react';

const ChatsListScreen = () => {
  const navigate = useNavigate();
  const { data: chats, isLoading, isError, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: getChatsList,
  });

  return (
    <AppLayout title="Chats">
      <div className="px-4 py-4">
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !chats?.length ? (
          <EmptyState
            icon={MessageCircle}
            title="No conversations"
            description="Send money to a contact to start a chat"
          />
        ) : (
          <div className="space-y-1">
            {chats.map((chat: any) => (
              <button
                key={chat.userId}
                onClick={() => navigate(`/chats/${chat.userId}`)}
                className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-muted transition-colors active:bg-muted"
              >
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-body font-medium text-primary flex-shrink-0">
                  {chat.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-body font-medium text-foreground truncate">{chat.name}</p>
                    <span className="text-small text-muted-foreground flex-shrink-0">
                      {chat.lastTimestamp ? new Date(chat.lastTimestamp).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-small text-muted-foreground truncate">{chat.lastMessage || 'No messages'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChatsListScreen;
