import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { ChartSkeleton, CardSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getNetBalance, getCategoryBreakdown, getTrends, getTransactions, getCategories } from '@/services/api';
import { PieChart as PieChartIcon, TrendingUp, ArrowUpDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import WalletRequiredState from '@/components/wallet/WalletRequiredState';
import { useWallet } from '@/contexts/WalletContext';

const COLORS = ['#0D6EFD', '#198754', '#DC3545', '#FFC107', '#6610F2', '#20C997', '#FD7E14', '#0DCAF0'];

const AnalysisScreen = () => {
  const [scope, setScope] = useState('all');
  const [dateRange] = useState({ startDate: '', endDate: '' });
  const { walletAddress } = useWallet();
  const hasWallet = Boolean(walletAddress);

  const params = { scope, ...dateRange };

  const balanceQ = useQuery({ queryKey: ['analysis', 'net-balance', walletAddress, params], queryFn: () => getNetBalance(params), enabled: hasWallet });
  const breakdownQ = useQuery({ queryKey: ['analysis', 'category-breakdown', walletAddress, params], queryFn: () => getCategoryBreakdown(params), enabled: hasWallet });
  const trendsQ = useQuery({ queryKey: ['analysis', 'trends', walletAddress, params], queryFn: () => getTrends({ ...params, granularity: 'week' }), enabled: hasWallet });
  const txQ = useQuery({ queryKey: ['analysis', 'transactions', walletAddress, params], queryFn: () => getTransactions({ ...params, page: '1', limit: '20' }), enabled: hasWallet });
  useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const balance = balanceQ.data;
  const breakdown = breakdownQ.data || [];
  const trends = trendsQ.data || [];
  const transactions = txQ.data?.items || txQ.data || [];

  return (
    <AppLayout title="Analysis">
      <div className="px-4 py-4 space-y-5">
        {!hasWallet ? (
          <WalletRequiredState
            title="Connect wallet to view analysis"
            description="Spending analysis, trends, and transactions are generated from your wallet-linked activity."
          />
        ) : (
          <>
        {/* Scope filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'personal', 'groups', 'p2p'].map(s => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 rounded-full text-small font-medium capitalize whitespace-nowrap transition-colors ${
                scope === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        {balanceQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3"><CardSkeleton /><CardSkeleton /></div>
        ) : balanceQ.isError ? (
          <ErrorState message="Failed to load KPIs" onRetry={() => balanceQ.refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Spent', value: `₹${balance?.totalSpent?.toLocaleString() ?? '0'}`, color: 'text-destructive' },
              { label: 'Net P2P', value: `₹${balance?.netBalance?.toLocaleString() ?? '0'}`, color: (balance?.netBalance ?? 0) >= 0 ? 'text-positive' : 'text-destructive' },
              { label: 'Avg Daily', value: `₹${balance?.avgDaily?.toLocaleString() ?? '0'}`, color: 'text-foreground' },
              { label: 'MoM Change', value: `${balance?.momChange ?? 0}%`, color: (balance?.momChange ?? 0) >= 0 ? 'text-positive' : 'text-destructive' },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-lg bg-card p-3 shadow-card border border-border">
                <p className="text-small text-muted-foreground">{kpi.label}</p>
                <p className={`text-h2 font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Category Donut */}
        {breakdownQ.isLoading ? <ChartSkeleton /> : breakdown.length > 0 && (
          <div className="rounded-lg bg-card p-4 shadow-card border border-border">
            <h3 className="text-title text-foreground mb-3">By Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {breakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {breakdown.map((item: any, i: number) => (
                <span key={i} className="flex items-center gap-1 text-small text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trend Chart */}
        {trendsQ.isLoading ? <ChartSkeleton /> : trends.length > 0 && (
          <div className="rounded-lg bg-card p-4 shadow-card border border-border">
            <h3 className="text-title text-foreground mb-3">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* No data fallback */}
        {!balanceQ.isLoading && !breakdownQ.isLoading && !trendsQ.isLoading && breakdown.length === 0 && trends.length === 0 && (
          <EmptyState
            icon={PieChartIcon}
            title="No data yet"
            description="Start adding expenses or sending money to see your analysis"
          />
        )}

        {/* Transactions Table */}
        <div className="rounded-lg bg-card shadow-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-title text-foreground">Transactions</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="p-4">
              <p className="text-small text-muted-foreground text-center">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-foreground truncate">{tx.description || tx.note || 'Transaction'}</p>
                    <p className="text-small text-muted-foreground">
                      {tx.date ? new Date(tx.date).toLocaleDateString() : ''} {tx.category && `• ${tx.category}`}
                    </p>
                  </div>
                  <span className={`text-body font-semibold flex-shrink-0 ${tx.type === 'received' || tx.amount > 0 ? 'text-positive' : 'text-destructive'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AnalysisScreen;
