import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, Building2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: pendingVets, isLoading: vetsLoading } = useQuery({
    queryKey: queryKeys.admin.pendingVets,
    queryFn: () => api.getPendingVetApprovals(),
  });
  const { data: pendingOrgs, isLoading: orgsLoading } = useQuery({
    queryKey: queryKeys.admin.pendingOrgs,
    queryFn: () => api.getPendingOrgApprovals(),
  });

  const vetCount = pendingVets?.length ?? 0;
  const orgCount = pendingOrgs?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Admin</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve vet registrations and organization requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending vet approvals</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {vetsLoading ? (
              <Skeleton className="h-8 w-16 mb-4" />
            ) : (
              <p className="text-2xl font-bold">{vetCount}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Vets who completed profile and are awaiting approval
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/admin/vets">
                Review <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending org approvals</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <Skeleton className="h-8 w-16 mb-4" />
            ) : (
              <p className="text-2xl font-bold">{orgCount}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Organizations awaiting approval
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/admin/organizations">
                Review <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
