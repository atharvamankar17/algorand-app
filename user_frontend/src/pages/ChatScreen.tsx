import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { ListSkeleton } from '@/components/common/LoadingSkeletons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { getChatMessages, sendChatMessage, sendTransfer, getCategories } from '@/services/api';
import { Send, DollarSign, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ChatScreen = () => {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'text' | 'money'>('text');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { data: messages, isLoading, isError, refetch } = useQuery({
    queryKey: ['chat', userId],
    queryFn: () => getChatMessages(userId!),
    enabled: !!userId,
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['chat', userId] });
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    queryClient.invalidateQueries({ queryKey: ['analysis'] });
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  };

  const sendMsg = useMutation({
    mutationFn: () => sendChatMessage(userId!, { text }),
    onSuccess: () => { setText(''); invalidateAll(); },
    onError: () => toast({ title: 'Failed to send', variant: 'destructive' }),
  });

  const sendMoney = useMutation({
    mutationFn: () => sendTransfer({ toUserId: userId!, amount: parseFloat(amount), note: note || undefined }),
    onSuccess: () => {
      setAmount(''); setNote(''); setMode('text');
      invalidateAll();
      toast({ title: 'Money sent!' });
    },
    onError: () => toast({ title: 'Failed to send money', variant: 'destructive' }),
  });

  const msgList = messages || [];

  return (
    <AppLayout title="Chat" showBack showSettings={false}>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : msgList.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No messages" description="Send money to start chatting" />
          ) : (
            msgList.map((m: any) => (
              <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  m.fromMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  {m.amount != null && (
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span className="text-body font-bold">₹{m.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {m.text && <p className="text-body">{m.text}</p>}
                  {m.category && <p className="text-small opacity-70 mt-0.5">{m.category}</p>}
                  <p className="text-[11px] opacity-50 mt-1">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card px-4 py-3 space-y-2">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1 rounded-full text-small font-medium ${mode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              Message
            </button>
            <button
              onClick={() => setMode('money')}
              className={`px-3 py-1 rounded-full text-small font-medium ${mode === 'money' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              Send Money
            </button>
          </div>

          {mode === 'text' ? (
            <div className="flex gap-2">
              <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" className="flex-1" onKeyDown={e => e.key === 'Enter' && text.trim() && sendMsg.mutate()} />
              <Button size="icon" disabled={!text.trim() || sendMsg.isPending} onClick={() => sendMsg.mutate()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="pl-7" min="0" />
                </div>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Note" className="flex-1" />
              </div>
              <Button className="w-full" disabled={!(parseFloat(amount) > 0) || sendMoney.isPending} onClick={() => sendMoney.mutate()}>
                <Send className="h-4 w-4 mr-1" /> {sendMoney.isPending ? 'Sending...' : 'Send Money'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatScreen;
