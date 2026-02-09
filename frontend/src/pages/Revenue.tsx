import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, Search, AlertCircle, ArrowRight, Filter, ArrowUpDown, Plus } from 'lucide-react';
import { mockRevenue, mockTreatments } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AddNewDialog } from '@/components/AddNewDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const statusTabs = [
  { label: 'Revenue', value: 'ALL', highlight: true },
  { label: 'Pending', value: 'OWED', count: 8 },
  { label: 'Paid', value: 'PAID', count: 14 },
];

const categoryTabs = [
  { label: 'All Payments', value: 'ALL' },
  { label: 'Clinic Payments', value: 'PET' },
  { label: 'Farm Payments', value: 'LIVESTOCK' },
];

const sortOptions = [
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' },
  { label: 'Amount (High)', value: 'amount-desc' },
  { label: 'Amount (Low)', value: 'amount-asc' },
];

export default function RevenuePage() {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const revenue = mockRevenue;
  const treatments = mockTreatments;

  const filtered = treatments
    .filter(t => {
      const matchesStatus = activeStatus === 'ALL' || t.paymentStatus === activeStatus;
      const matchesCategory = activeCategory === 'ALL' || t.paymentCategory === activeCategory;
      const matchesSearch = search === '' ||
        t.animal.name.toLowerCase().includes(search.toLowerCase()) ||
        t.organization.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
      if (sortBy === 'date-asc') return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
      return (a.amount || 0) - (b.amount || 0);
    });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Revenue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all payments and invoices.</p>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">Apr 1, 2024 – Apr 25, 2024</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border',
              activeStatus === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            )}
          >
            {tab.highlight
              ? `Revenue ₦${(revenue.totalRevenue / 1000).toLocaleString()}k`
              : `${tab.label} (${tab.count})`
            }
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices by client or batch..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-2 pb-1">Filter by status</p>
            {['ALL', 'PAID', 'OWED'].map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={cn('w-full text-left px-3 py-2 text-sm rounded-lg transition-colors', activeStatus === s ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground')}
              >
                {s === 'ALL' ? 'All' : s === 'PAID' ? 'Paid' : 'Pending'}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-2 pb-1">Sort by</p>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn('w-full text-left px-3 py-2 text-sm rounded-lg transition-colors', sortBy === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground')}
              >
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categoryTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              activeCategory === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
        {filtered.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-lg flex-shrink-0">
                {t.animal.species === 'Dog' ? '🐕' : t.animal.species === 'Cat' ? '🐈' : '🐄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">
                      {t.animal.patientType === 'BATCH_LIVESTOCK' ? `Batch ${t.animal.batchIdentifier}` : t.animal.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t.organization.name}</p>
                    <p className="text-xs text-muted-foreground">{t.diagnosis}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">₦{(t.amount || 0).toLocaleString()}</p>
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-medium',
                      t.paymentStatus === 'PAID' ? 'text-primary' : 'text-destructive'
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', t.paymentStatus === 'PAID' ? 'bg-primary' : 'bg-destructive')} />
                      {t.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>{format(parseISO(t.visitDate), 'MMM dd, yyyy')}</span>
              </div>
              {t.paymentStatus === 'OWED' && (
                <button
                  onClick={() => toast({ title: 'Reminder sent', description: `Payment reminder sent for ₦${(t.amount || 0).toLocaleString()}.` })}
                  className="text-xs font-medium text-warning border border-warning/30 px-3 py-1 rounded-lg hover:bg-warning/5 transition-colors"
                >
                  💛 Send Reminder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No payments found</p>
        </div>
      )}

      <div className="bg-accent border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-foreground">Don't Forget</h3>
          </div>
          <button onClick={() => navigate('/dashboard/payments')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>2</strong> unpaid invoices
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>3</strong> follow-ups today
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
        <Plus className="w-4 h-4" /> Record Payment
      </button>

      <AddNewDialog open={addOpen} onOpenChange={setAddOpen} defaultType="payment" />
    </div>
  );
}
