import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { searchUsers, createGroup } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateGroupScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  const { data: searchResults } = useQuery({
    queryKey: ['users/search', searchTerm],
    queryFn: () => searchUsers(searchTerm),
    enabled: searchTerm.length >= 2,
  });

  const createMutation = useMutation({
    mutationFn: () => createGroup({
      name,
      description: description || undefined,
      members: selectedMembers.map(m => m.id),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: 'Group created!', description: `"${name}" is ready to use.` });
      navigate('/groups');
    },
    onError: () => {
      toast({ title: 'Failed to create group', variant: 'destructive' });
    },
  });

  const addMember = (user: any) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchTerm('');
  };

  const removeMember = (id: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== id));
  };

  return (
    <AppLayout title="Create Group" showBack>
      <div className="px-4 py-4 space-y-5">
        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Group Name *</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Hostel Room 301"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Description</label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            maxLength={200}
          />
        </div>

        {/* Member Picker */}
        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Add Members</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or roll no."
              className="pl-9"
            />
          </div>

          {/* Search results */}
          {searchResults && searchResults.length > 0 && searchTerm.length >= 2 && (
            <div className="rounded-lg border border-border bg-card shadow-card max-h-40 overflow-y-auto">
              {searchResults.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => addMember(user)}
                  disabled={selectedMembers.some(m => m.id === user.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-small font-medium text-primary">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-foreground truncate">{user.name}</p>
                    {user.rollNo && <p className="text-small text-muted-foreground">{user.rollNo}</p>}
                  </div>
                  <UserPlus className="h-4 w-4 text-primary" />
                </button>
              ))}
            </div>
          )}

          {/* Selected chips */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMembers.map(m => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-small font-medium"
                >
                  {m.name}
                  <button onClick={() => removeMember(m.id)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          disabled={!name.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Group'}
        </Button>
      </div>
    </AppLayout>
  );
};

export default CreateGroupScreen;
