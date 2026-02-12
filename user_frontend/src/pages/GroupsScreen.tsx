import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getGroups } from '@/services/api';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GroupsScreen = () => {
  const navigate = useNavigate();
  const { data: groups, isLoading, isError, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  return (
    <AppLayout title="Groups">
      <div className="px-4 py-4 space-y-4">
        <Button className="w-full" onClick={() => navigate('/groups/create')}>
          <Plus className="h-4 w-4 mr-2" /> Create Group
        </Button>

        {isLoading ? (
          <ListSkeleton count={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !groups?.length ? (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create your first group to start splitting expenses with friends"
            actionLabel="Create Group"
            onAction={() => navigate('/groups/create')}
          />
        ) : (
          <div className="space-y-2">
            {groups.map((g: any) => (
              <button
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="w-full flex items-center gap-3 rounded-lg bg-card p-4 shadow-card border border-border text-left transition-colors active:bg-muted"
              >
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-foreground truncate">{g.name}</p>
                  <p className="text-small text-muted-foreground">{g.memberCount} members • Last expense {g.lastExpense || 'N/A'}</p>
                </div>
                <span className={`text-body font-semibold flex-shrink-0 ${(g.yourBalance ?? 0) >= 0 ? 'text-positive' : 'text-destructive'}`}>
                  {(g.yourBalance ?? 0) >= 0 ? '+' : ''}₹{Math.abs(g.yourBalance ?? 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GroupsScreen;
