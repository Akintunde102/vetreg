import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClinicSettingsPage() {
  const navigate = useNavigate();
  const { currentOrgId, currentOrg } = useCurrentOrg();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orgDetail, isLoading } = useQuery({
    queryKey: queryKeys.orgs.detail(currentOrgId!),
    queryFn: () => api.getOrganization(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.updateOrganization>[1]) =>
      api.updateOrganization(currentOrgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.detail(currentOrgId!) });
      toast({ title: 'Clinic updated' });
    },
    onError: (e: Error) => {
      toast({ variant: 'destructive', title: 'Failed to update', description: e.message });
    },
  });

  const canEdit = currentOrg?.membership?.role === 'OWNER' || currentOrg?.membership?.role === 'ADMIN';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit) return;
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value?.trim() ?? '';
    updateMutation.mutate({
      name: get('name'),
      description: get('description') || undefined,
      address: get('address'),
      city: get('city'),
      state: get('state'),
      country: get('country') || undefined,
      phoneNumber: get('phoneNumber'),
      email: get('email') || undefined,
      website: get('website') || undefined,
      paymentTerms: get('paymentTerms') || undefined,
      welcomeMessage: get('welcomeMessage') || undefined,
      settings: orgDetail?.settings ?? undefined,
    });
  };

  if (!currentOrgId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Select a clinic first.</p>
        <Button variant="outline" onClick={() => navigate('/organizations')}>
          Go to Clinics
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clinic details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edit clinic info and welcome message. Only owners and admins can save changes.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Building2 className="w-5 h-5 text-primary" />
              Clinic details
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name">Clinic name</Label>
                <Input id="name" name="name" required defaultValue={orgDetail?.name ?? ''} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" name="description" rows={2} defaultValue={orgDetail?.description ?? ''} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required defaultValue={orgDetail?.address ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required defaultValue={orgDetail?.city ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue={orgDetail?.state ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={orgDetail?.country ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" required defaultValue={orgDetail?.phoneNumber ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" name="email" type="email" defaultValue={orgDetail?.email ?? ''} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input id="website" name="website" type="url" placeholder="https://" defaultValue={orgDetail?.website ?? ''} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="paymentTerms">Payment terms (optional)</Label>
                <Input id="paymentTerms" name="paymentTerms" placeholder="e.g. Net 30" defaultValue={orgDetail?.paymentTerms ?? ''} />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <Label htmlFor="welcomeMessage">Welcome message</Label>
            <Textarea
              id="welcomeMessage"
              name="welcomeMessage"
              placeholder="e.g. Welcome to our clinic. We're here for your pets and livestock."
              className="min-h-[100px] resize-y"
              defaultValue={orgDetail?.welcomeMessage ?? ''}
            />
            <p className="text-xs text-muted-foreground">
              Shown on the dashboard for everyone using this clinic.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canEdit ? (
              <>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Only clinic owners and admins can edit these details.</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
