import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { addGroupExpense, getGroupDetail, getCategories } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const AddExpenseScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [splitType, setSplitType] = useState('equal');

  const { data: group } = useQuery({
    queryKey: ['groups', id],
    queryFn: () => getGroupDetail(id!),
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const mutation = useMutation({
    mutationFn: () => addGroupExpense(id!, {
      amount: parseFloat(amount),
      description,
      categoryId: categoryId || undefined,
      splitType,
      participants: group?.members?.map((m: any) => ({ userId: m.id })) || [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Expense added!' });
      navigate(-1);
    },
    onError: () => toast({ title: 'Failed to add expense', variant: 'destructive' }),
  });

  const isValid = parseFloat(amount) > 0 && description.trim();

  return (
    <AppLayout title="Add Expense" showBack>
      <div className="px-4 py-4 space-y-4">
        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Amount *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="pl-8 text-h2"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Description *</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What was this for?" rows={2} maxLength={200} />
        </div>

        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Category</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-body text-foreground"
          >
            <option value="">None</option>
            {categories?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Split Type</label>
          <div className="flex gap-2">
            {['equal', 'custom'].map(type => (
              <button
                key={type}
                onClick={() => setSplitType(type)}
                className={`flex-1 rounded-md border py-2 text-body font-medium capitalize transition-colors ${
                  splitType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-small text-muted-foreground mb-2">
            Split among {group?.members?.length ?? 0} members
          </p>
          <Button className="w-full" disabled={!isValid || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddExpenseScreen;
