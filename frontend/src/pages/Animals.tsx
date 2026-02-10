import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, PawPrint, Plus, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AddNewDialog } from '@/components/AddNewDialog';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertCircle } from 'lucide-react';

const PAGE_SIZE = 20;

function getSpeciesEmoji(species: string) {
  switch (species?.toLowerCase()) {
    case 'dog': return '🐕';
    case 'cat': return '🐈';
    case 'cattle': return '🐄';
    default: return '🐾';
  }
}

export default function AnimalsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const { currentOrgId } = useCurrentOrg();
  const { toast } = useToast();

  const speciesParam = activeTab === 'ALL' ? undefined : activeTab === 'OTHER' ? 'OTHER' : activeTab.toUpperCase();
  const { data: dashboardStats } = useQuery({
    queryKey: queryKeys.dashboard.stats(currentOrgId!),
    queryFn: () => api.getDashboardStats(currentOrgId!),
    enabled: !!currentOrgId,
  });
  const { data: animalsRes, isLoading, isError } = useQuery({
    queryKey: queryKeys.animals.list(currentOrgId!, { page, search, species: activeTab }),
    queryFn: () =>
      api.getAnimals(currentOrgId!, {
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(speciesParam ? { species: speciesParam } : {}),
      }),
    enabled: !!currentOrgId,
  });

  const animals = Array.isArray(animalsRes?.data) ? animalsRes.data : [];
  const meta = animalsRes?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const filtered = animals;

  const counts = {
    all: meta?.totalCount ?? filtered.length,
    dogs: animals.filter((a) => a.species === 'Dog').length,
    cats: animals.filter((a) => a.species === 'Cat').length,
    other: (meta?.totalCount ?? animals.length) - animals.filter((a) => ['Dog', 'Cat'].includes(a.species)).length,
  };
  const tabs = [
    { label: 'All', value: 'ALL', count: counts.all },
    { label: 'Dogs', value: 'Dog', count: counts.dogs },
    { label: 'Cats', value: 'Cat', count: counts.cats },
    { label: 'Other', value: 'OTHER', count: Math.max(0, counts.other) },
  ];

  const handleMessage = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    toast({ title: 'Message', description: 'Messaging will be available with backend integration.' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Pets</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage the individual pets of your clients.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search pets..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setPage(1); }}
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

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
          {filtered.map((animal) => (
            <div
              key={animal.id}
              onClick={() => navigate(`/dashboard/animals/${animal.id}`)}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center text-2xl flex-shrink-0">
                  {getSpeciesEmoji(animal.species)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground">{animal.name}</h3>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); handleMessage(e, animal.clientId); }}
                      >
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/animals/${animal.id}`); }}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {animal.client?.firstName} {animal.client?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {animal.breed ? `💛 ${animal.breed}` : animal.species}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Vaccination as due</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/clients/${animal.clientId}`); }}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <PawPrint className="w-3 h-3" /> Client <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No animals found</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Don't Forget – real counts from dashboard */}
      <div className="bg-accent border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-foreground">Don't Forget</h3>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/schedule')}>
            View All
          </Button>
        </div>
        <ul className="space-y-1 text-sm text-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>{dashboardStats?.animals?.vaccinationDue ?? 0}</strong> pets due for vaccination
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <strong>{dashboardStats?.treatments?.followUpsDue ?? 0}</strong> follow-ups today
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
        <Plus className="w-4 h-4" /> Register Animal
      </button>

      <AddNewDialog open={addOpen} onOpenChange={setAddOpen} defaultType="animal" />
    </div>
  );
}
