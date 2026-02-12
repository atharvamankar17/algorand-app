import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getGroupDetail, removeGroupMember, addGroupMembers, searchUsers } from '@/services/api';
import { Users, Plus, Trash2, Search, DollarSign, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const GroupDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<'members' | 'balances'>('members');
  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState('');

  const { data: group, isLoading, isError, refetch } = useQuery({
    queryKey: ['groups', id],
    queryFn: () => getGroupDetail(id!),
    enabled: !!id,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['users/search', search],
    queryFn: () => searchUsers(search),
    enabled: search.length >= 2 && showAddMember,
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeGroupMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast({ title: 'Member removed' });
    },
    onError: () => toast({ title: 'Failed to remove member', variant: 'destructive' }),
  });

  const addMutation = useMutation({
    mutationFn: (userIds: string[]) => addGroupMembers(id!, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      setShowAddMember(false);
      setSearch('');
      toast({ title: 'Member added!' });
    },
    onError: () => toast({ title: 'Failed to add member', variant: 'destructive' }),
  });

  if (isLoading) return <AppLayout title="Group" showBack><div className="px-4 py-4"><ListSkeleton /></div></AppLayout>;
  if (isError) return <AppLayout title="Group" showBack><ErrorState onRetry={refetch} /></AppLayout>;

  const members = group?.members || [];
  const balances = group?.balances || {};

  return (
    <AppLayout title={group?.name || 'Group'} showBack>
      <div className="px-4 py-4 space-y-4">
        {group?.description && (
          <p className="text-body text-muted-foreground">{group.description}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => navigate(`/groups/${id}/expense`)}>
            <DollarSign className="h-4 w-4 mr-1" /> Add Expense
          </Button>
          <Button variant="outline" onClick={() => setShowAddMember(!showAddMember)}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Add member search */}
        {showAddMember && (
          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users" className="pl-9" />
            </div>
            {searchResults?.map((u: any) => (
              <button
                key={u.id}
                onClick={() => addMutation.mutate([u.id])}
                disabled={members.some((m: any) => m.id === u.id)}
                className="w-full flex items-center gap-3 p-2 text-left hover:bg-muted rounded transition-colors disabled:opacity-40"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-small font-medium text-primary">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-body text-foreground">{u.name}</span>
                <Plus className="h-4 w-4 text-primary ml-auto" />
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['members', 'balances'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-2 text-body font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'members' ? (
          <div className="space-y-2">
            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members"
                description="Add members to start splitting"
                actionLabel="Add Members"
                onAction={() => setShowAddMember(true)}
              />
            ) : (
              members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-card border border-border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-body font-medium text-primary">
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-medium text-foreground">{m.name}</p>
                    <p className="text-small text-muted-foreground capitalize">{m.role || 'member'}</p>
                  </div>
                  {m.role !== 'admin' && (
                    <button onClick={() => removeMutation.mutate(m.id)} className="p-1 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(balances).length === 0 ? (
              <EmptyState icon={DollarSign} title="No balances" description="Add expenses to see who owes whom" />
            ) : (
              Object.entries(balances).map(([name, amount]: [string, any]) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-card p-3 shadow-card border border-border">
                  <span className="text-body text-foreground">{name}</span>
                  <span className={`text-body font-semibold ${amount >= 0 ? 'text-positive' : 'text-destructive'}`}>
                    {amount >= 0 ? '+' : ''}₹{Math.abs(amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GroupDetailScreen;
