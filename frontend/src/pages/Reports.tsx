import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
      <p className="text-muted-foreground">Advanced analytics and reports will be available here.</p>
      <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
        <BarChart3 className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
        <p className="text-muted-foreground text-center">Reports dashboard coming soon</p>
      </div>
    </div>
  );
}
