import { useState } from 'react';
import { Search, PawPrint, Plus, ChevronRight } from 'lucide-react';
import { mockAnimals } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AddNewDialog } from '@/components/AddNewDialog';

const tabs = [
  { label: 'All', value: 'ALL', count: 62 },
  { label: 'Dogs', value: 'Dog', count: 32 },
  { label: 'Cats', value: 'Cat', count: 18 },
  { label: 'Other', value: 'OTHER', count: 12 },
];

function getSpeciesEmoji(species: string) {
  switch (species.toLowerCase()) {
    case 'dog': return '🐕';
    case 'cat': return '🐈';
    case 'cattle': return '🐄';
    default: return '🐾';
  }
}

export default function AnimalsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const animals = mockAnimals;

  const filtered = animals.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.client.firstName.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'ALL' ||
      (activeTab === 'OTHER' ? !['Dog', 'Cat'].includes(a.species) : a.species === activeTab);
    return matchesSearch && matchesTab;
  });

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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pets..."
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
        {filtered.map(animal => (
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
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{animal.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/animals/${animal.id}`); }}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    View
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {animal.client.firstName} {animal.client.lastName}
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
                onClick={(e) => { e.stopPropagation(); navigate('/dashboard/clients'); }}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <PawPrint className="w-3 h-3" /> Client <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No animals found</p>
        </div>
      )}

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
