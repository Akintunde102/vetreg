import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Plus, Building2, ArrowRight, AlertCircle, Info, Mail, UserPlus, X,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useOrgStore } from '@/lib/stores/org-store';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { useToast } from '@/hooks/use-toast';
import { AddNewDialog } from '@/components/AddNewDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Organization } from '@/types/api';
import type { MembershipRole } from '@/types/api';

function canManageInvitations(org: Organization): boolean {
  const role = org.membership?.role;
  return role === 'OWNER' || role === 'ADMIN';
}

function InviteVetDialog({
  open,
  onOpenChange,
  orgId,
  orgName,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  orgName: string;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MembershipRole>('MEMBER');
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: { invitedEmail: string; role: MembershipRole }) =>
      api.createInvitation(orgId, data),
    onSuccess: () => {
      toast({ title: 'Invitation sent' });
      setEmail('');
      setRole('MEMBER');
      onSuccess();
      onOpenChange(false);
    },
    onError: (e: Error) =>
      toast({ variant: 'destructive', title: 'Failed to send invitation', description: e.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutation.mutate({ invitedEmail: email.trim(), role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite vet to {orgName}</DialogTitle>
          <DialogDescription>
            They must have an approved VetReg account. An email invitation will be sent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="vet@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MembershipRole)}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitationsForOrgId, setInvitationsForOrgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setCurrentOrgId } = useOrgStore();
  const { currentOrg, orgs = [] } = useCurrentOrg();
  const [showNoOrgBanner, setShowNoOrgBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get('reason') === 'no_org') {
      setShowNoOrgBanner(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('reason');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: orgsList = [] } = useQuery({
    queryKey: queryKeys.orgs.all,
    queryFn: () => api.getOrganizations(),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  const displayOrgs = orgsList;
  const filtered = displayOrgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.address?.toLowerCase().includes(search.toLowerCase())) ||
      org.city.toLowerCase().includes(search.toLowerCase())
  );
  const pending = filtered.filter((o) => o.status === 'PENDING_APPROVAL');

  const manageableOrgs = useMemo(
    () => displayOrgs.filter(canManageInvitations),
    [displayOrgs]
  );

  const defaultManageableId =
    manageableOrgs.find((o) => o.id === currentOrg?.id)?.id ?? manageableOrgs[0]?.id ?? null;
  const selectedInvitationsOrgId = invitationsForOrgId ?? defaultManageableId ?? null;
  const selectedInvitationsOrg = displayOrgs.find((o) => o.id === selectedInvitationsOrgId);

  const { data: invitations = [], refetch: refetchInvitations } = useQuery({
    queryKey: queryKeys.orgs.invitations(selectedInvitationsOrgId ?? ''),
    queryFn: () => api.getInvitations(selectedInvitationsOrgId!),
    enabled: !!selectedInvitationsOrgId && !!selectedInvitationsOrg && canManageInvitations(selectedInvitationsOrg),
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: ({ orgId, invitationId }: { orgId: string; invitationId: string }) =>
      api.cancelInvitation(orgId, invitationId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.invitations(orgId) });
    },
  });

  const handleSwitchOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    queryClient.invalidateQueries();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {showNoOrgBanner && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Organization required</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              All activity in the app is tied to a clinic. Create a clinic or accept an invitation to continue.
            </p>
          </div>
        </div>
      )}

      {/* Vet Clinics – tenant hub */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vet Clinics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Switch between clinics to work with that clinic’s clients, animals, and treatments. Everything is scoped to the selected clinic.
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create clinic
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center relative flex-shrink-0">
                  <Building2 className="w-6 h-6 text-accent-foreground" />
                  {(org._counts?.clients ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {org._counts?.clients}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">{org.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {org.address}, {org.city}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">{org._counts?.clients || 0}</span>{' '}
                patients referred this month
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {org.status === 'PENDING_APPROVAL' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      Pending approval
                    </span>
                  ) : org.paymentTerms ? (
                    <span className="text-xs text-muted-foreground">{org.paymentTerms}</span>
                  ) : null}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Updated {formatDistanceToNow(parseISO(org.updatedAt))} ago
                </span>
              </div>

              <button
                onClick={() => handleSwitchOrg(org.id)}
                className="mt-3 w-full py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-1"
              >
                Switch & open dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {pending.length > 0 && (
          <div className="mt-4 bg-warning/5 border border-warning/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-foreground">Pending Verification ({pending.length})</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">New clinics awaiting approval</p>
          </div>
        )}

        <button
          onClick={() => setAddOpen(true)}
          className="sm:hidden fixed right-4 bottom-[calc(var(--bottomnav-height)+16px)] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40"
          aria-label="Create clinic"
        >
          <Plus className="w-6 h-6" />
        </button>
      </section>

      {/* Manage invitations */}
      <section className="border-t border-border pt-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Manage invitations</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Invite vets to a clinic. Only admins and owners can send or cancel invitations.
        </p>

        {manageableOrgs.length === 0 ? (
          <div className="rounded-xl bg-muted/50 border border-border p-5 text-center text-sm text-muted-foreground">
            Create a clinic or join one as Admin or Owner to manage invitations.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">Invitations for:</span>
              <Select
                value={selectedInvitationsOrgId ?? ''}
                onValueChange={(id) => setInvitationsForOrgId(id)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {manageableOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => setInviteOpen(true)}
                disabled={!selectedInvitationsOrgId}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" /> Invite vet
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {invitations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Mail className="w-8 h-8 text-muted-foreground/50" />
                  <p>No pending invitations for this clinic.</p>
                  <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
                    Send first invitation
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {invitations.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">{inv.invitedEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          Role: {inv.role} · Expires {formatDistanceToNow(parseISO(inv.expiresAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          cancelInvitationMutation.mutate({
                            orgId: selectedInvitationsOrgId!,
                            invitationId: inv.id,
                          })
                        }
                        disabled={cancelInvitationMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>

      <AddNewDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
        }}
        showVetClinic
      />

      {selectedInvitationsOrg && (
        <InviteVetDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          orgId={selectedInvitationsOrg.id}
          orgName={selectedInvitationsOrg.name}
          onSuccess={() => {
            refetchInvitations();
            queryClient.invalidateQueries({ queryKey: queryKeys.orgs.invitations(selectedInvitationsOrg.id) });
          }}
        />
      )}
    </div>
  );
}
