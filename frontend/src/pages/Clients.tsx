import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, PawPrint, AlertCircle, ArrowRight, Plus } from 'lucide-react';
import { mockClients, mockClientDetails } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AddNewDialog } from '@/components/AddNewDialog';

const tabs = [
  { label: 'All', value: 'ALL', count: 86 },
  { label: 'Pets', value: 'PETS', count: 62 },
  { label: 'Livestock', value: 'LIVESTOCK', count: 24 },
  { label: 'Has Balance', value: 'BALANCE', count: 5 },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const clients = mockClients.map(c => {
    const details = mockClientDetails.find(d => d.clientId === c.id);
    return { ...c, ...details };
  });

  const filtered = clients.filter(c => {
    const matchesSearch = !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'PETS') return matchesSearch && (c.petCount ?? 0) > 0;
    if (activeTab === 'LIVESTOCK') return matchesSearch && (c.livestockCount ?? 0) > 0;
    if (activeTab === 'BALANCE') return matchesSearch && (c.balance ?? 0) > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all pet and livestock owners.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
        {filtered.map(client => {
          const hasBalance = (client.balance ?? 0) > 0;
          const petText: string[] = [];
          if (client.petCount && client.petCount > 0) petText.push(`${client.petCount} pet${client.petCount > 1 ? 's' : ''}`);
          if (client.livestockCount && client.livestockCount > 0) petText.push(`${client.livestockCount} goats`);

          return (
            <div key={client.id} onClick={() => navigate(`/dashboard/clients/${client.id}`)} className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-lg flex-shrink-0 font-bold text-primary">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{client.firstName} {client.lastName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {client.phoneNumber} | {client.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{petText.join(', ')}</p>
                    </div>
                    {hasBalance ? (
                      <span className="text-xs font-bold text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-lg">
                        ₦{(client.balance ?? 0).toLocaleString()} Due
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({ title: 'Message sent', description: `SMS sent to ${client.firstName} ${client.lastName}.` });
                        }}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn('w-2 h-2 rounded-full', hasBalance ? 'bg-warning' : 'bg-primary')} />
                  <span>{client.lastVisit}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/dashboard/animals'); }}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <PawPrint className="w-3 h-3" /> Pets <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No clients found</p>
        </div>
      )}

      <div className="bg-accent border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-foreground">Don't Forget</h3>
          </div>
          <button onClick={() => navigate('/dashboard/schedule')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>2</strong> follow-ups today
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>2</strong> unpaid invoices
          </li>
        </ul>
      </div>

      <div className="lg:hidden pb-4">
        <button
          onClick={() => setAddOpen(true)}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="hidden lg:flex fixed right-8 bottom-8 items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity z-40"
      >
        <Plus className="w-4 h-4" /> Add Client
      </button>

      <AddNewDialog open={addOpen} onOpenChange={setAddOpen} defaultType="client" />
    </div>
  );
}
