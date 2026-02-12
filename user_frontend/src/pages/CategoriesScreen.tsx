import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import { Tag, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CategoriesScreen = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0D6EFD');
  const [search, setSearch] = useState('');

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['analysis'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  };

  const createMut = useMutation({
    mutationFn: () => createCategory({ name, color }),
    onSuccess: () => { invalidateAll(); resetForm(); toast({ title: 'Category created' }); },
    onError: () => toast({ title: 'Failed', variant: 'destructive' }),
  });

  const updateMut = useMutation({
    mutationFn: () => updateCategory(editId!, { name, color }),
    onSuccess: () => { invalidateAll(); resetForm(); toast({ title: 'Category updated' }); },
    onError: () => toast({ title: 'Failed', variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => { invalidateAll(); toast({ title: 'Category deleted' }); },
    onError: () => toast({ title: 'Failed', variant: 'destructive' }),
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setName(''); setColor('#0D6EFD'); };

  const startEdit = (cat: any) => { setEditId(cat.id); setName(cat.name); setColor(cat.color || '#0D6EFD'); setShowForm(true); };

  const filtered = (categories || []).filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout title="Categories" showBack>
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories" className="flex-1" />
          <Button size="icon" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-border bg-card p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-title text-foreground">{editId ? 'Edit' : 'New'} Category</h3>
              <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" maxLength={30} />
            <div className="flex items-center gap-2">
              <label className="text-small text-muted-foreground">Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 rounded border-0 cursor-pointer" />
            </div>
            <Button
              className="w-full"
              disabled={!name.trim()}
              onClick={() => editId ? updateMut.mutate() : createMut.mutate()}
            >
              <Check className="h-4 w-4 mr-1" /> {editId ? 'Update' : 'Create'}
            </Button>
          </div>
        )}

        {isLoading ? (
          <ListSkeleton count={5} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No categories"
            description="Add a category to track your spending"
            actionLabel="Add Category"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-card border border-border">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color || '#0D6EFD' }}>
                  <Tag className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="flex-1 text-body font-medium text-foreground">{cat.name}</span>
                <button onClick={() => startEdit(cat)} className="p-1 text-muted-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMut.mutate(cat.id)} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CategoriesScreen;
