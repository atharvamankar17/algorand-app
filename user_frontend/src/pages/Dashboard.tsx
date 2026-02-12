import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { BalanceSkeleton, ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getNetBalance, getActivityFeed, getGroups } from '@/services/api';
import { Wallet, Send, Users, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletRequiredState from '@/components/wallet/WalletRequiredState';
import { useWallet } from '@/contexts/WalletContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();

  const balanceQuery = useQuery({
    queryKey: ['analysis', 'net-balance', walletAddress],
    queryFn: () => getNetBalance(),
    enabled: !!walletAddress,
  });

  const activityQuery = useQuery({
    queryKey: ['activity', 'recent', walletAddress],
    queryFn: () => getActivityFeed({ limit: '5' }),
    enabled: !!walletAddress,
  });

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const balance = balanceQuery.data;
  const activities = activityQuery.data || [];
  const groups = groupsQuery.data || [];

  return (
    <AppLayout title="Campus Wallet">
      <div className="px-4 py-4 space-y-5">
        {!walletAddress && (
          <WalletRequiredState
            compact
            title="Connect wallet to load your dashboard"
            description="Balance and recent activity are tied to your Algorand address."
          />
        )}

        {/* Balance Card */}
        {!walletAddress ? null : balanceQuery.isLoading ? (
          <BalanceSkeleton />
        ) : balanceQuery.isError ? (
          <ErrorState message="Failed to load balance" onRetry={() => balanceQuery.refetch()} />
        ) : (
          <div className="rounded-lg bg-primary p-5 shadow-card text-center">
            <p className="text-small text-primary-foreground/70 mb-1">Net Balance</p>
            <p className="text-h1 text-primary-foreground">
              ₹{balance?.netBalance?.toLocaleString() ?? '0.00'}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="text-center">
                <ArrowDownLeft className="h-4 w-4 text-primary-foreground/70 mx-auto" />
                <p className="text-small text-primary-foreground/70">Received</p>
                <p className="text-small font-medium text-primary-foreground">₹{balance?.totalReceived?.toLocaleString() ?? '0'}</p>
              </div>
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <ArrowUpRight className="h-4 w-4 text-primary-foreground/70 mx-auto" />
                <p className="text-small text-primary-foreground/70">Spent</p>
                <p className="text-small font-medium text-primary-foreground">₹{balance?.totalSpent?.toLocaleString() ?? '0'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Send, label: 'Send', onClick: () => navigate('/chats') },
            { icon: Users, label: 'New Group', onClick: () => navigate('/groups/create') },
            { icon: Plus, label: 'Expense', onClick: () => navigate('/groups') },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 rounded-lg bg-card p-4 shadow-card border border-border transition-colors active:bg-muted"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-small font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Groups Preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-title text-foreground">Your Groups</h2>
            <button onClick={() => navigate('/groups')} className="text-small text-primary font-medium">See all</button>
          </div>
          {groupsQuery.isLoading ? (
            <ListSkeleton count={2} />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No groups yet"
              description="Create your first group to start splitting expenses"
              actionLabel="Create Group"
              onAction={() => navigate('/groups/create')}
            />
          ) : (
            <div className="space-y-2">
              {groups.slice(0, 3).map((g: any) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="w-full flex items-center gap-3 rounded-lg bg-card p-3 shadow-card border border-border text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-foreground truncate">{g.name}</p>
                    <p className="text-small text-muted-foreground">{g.memberCount} members</p>
                  </div>
                  <span className={`text-body font-semibold ${(g.yourBalance ?? 0) >= 0 ? 'text-positive' : 'text-destructive'}`}>
                    {(g.yourBalance ?? 0) >= 0 ? '+' : ''}₹{Math.abs(g.yourBalance ?? 0).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-title text-foreground">Recent Activity</h2>
            <button onClick={() => navigate('/activity')} className="text-small text-primary font-medium">See all</button>
          </div>
          {!walletAddress ? (
            <WalletRequiredState compact description="Connect wallet to view your transaction activity." />
          ) : activityQuery.isLoading ? (
            <ListSkeleton count={3} />
          ) : activities.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No activity yet"
              description="Your transactions and group activities will appear here"
            />
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-card border border-border">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-foreground truncate">{a.description}</p>
                    <p className="text-small text-muted-foreground">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {a.amount != null && (
                    <span className={`text-body font-semibold ${a.type === 'received' ? 'text-positive' : 'text-destructive'}`}>
                      {a.type === 'received' ? '+' : '-'}₹{Math.abs(a.amount).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
