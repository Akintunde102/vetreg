import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Shield, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useToast } from '@/hooks/use-toast';
import type { OrgMember, MembershipRole } from '@/types/api';

function RoleBadge({ role }: { role: MembershipRole }) {
  if (role === 'OWNER') return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full"><ShieldCheck className="w-3 h-3" /> Owner</span>;
  if (role === 'ADMIN') return <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"><Shield className="w-3 h-3" /> Admin</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full"><User className="w-3 h-3" /> Member</span>;
}

export default function MembersPage() {
  const navigate = useNavigate();
  const { currentOrgId, currentOrg } = useCurrentOrg();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [permDraft, setPermDraft] = useState<OrgMember['permissions'] | null>(null);

  const isOwner = currentOrg?.membership?.role === 'OWNER';

  const { data: members = [], isLoading } = useQuery({
    queryKey: queryKeys.orgs.members(currentOrgId!),
    queryFn: () => api.getMembers(currentOrgId!),
    enabled: !!currentOrgId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: MembershipRole }) =>
      api.updateMemberRole(currentOrgId!, membershipId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.members(currentOrgId!) });
      toast({ title: 'Role updated' });
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to update role', description: e.message }),
  });

  const updatePermMutation = useMutation({
    mutationFn: ({ membershipId, permissions }: { membershipId: string; permissions: OrgMember['permissions'] }) =>
      api.updateMemberPermissions(currentOrgId!, membershipId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.members(currentOrgId!) });
      toast({ title: 'Permissions updated' });
      setPermissionsOpen(false);
      setEditingMember(null);
      setPermDraft(null);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to update permissions', description: e.message }),
  });

  const openPermissions = (member: OrgMember) => {
    if (member.role === 'OWNER') return;
    setEditingMember(member);
    setPermDraft({ ...member.permissions });
    setPermissionsOpen(true);
  };

  const savePermissions = () => {
    if (!editingMember || !permDraft) return;
    updatePermMutation.mutate({ membershipId: editingMember.id, permissions: permDraft });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} aria-label="Back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Team members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View roles and permissions. Only clinic owners can change roles and grant permissions (per doc).
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{member.vet.fullName}</p>
                  <p className="text-sm text-muted-foreground">{member.vet.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <RoleBadge role={member.role} />
                  {isOwner && member.role !== 'OWNER' && (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(role) => updateRoleMutation.mutate({ membershipId: member.id, role: role as MembershipRole })}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => openPermissions(member)}>
                        Permissions
                      </Button>
                    </>
                  )}
                  {member.role === 'OWNER' && (
                    <span className="text-xs text-muted-foreground">Owner has all permissions</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Invite new vets from the <button type="button" onClick={() => navigate('/organizations')} className="text-primary hover:underline">Clinics</button> page → Manage invitations.
      </p>

      <Dialog open={permissionsOpen} onOpenChange={(open) => { if (!open) { setPermissionsOpen(false); setEditingMember(null); setPermDraft(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member permissions</DialogTitle>
            <DialogDescription>
              Only owners can grant or revoke these. {editingMember && `${editingMember.vet.fullName} – ${editingMember.role}`}
            </DialogDescription>
          </DialogHeader>
          {permDraft && (
            <div className="space-y-3 py-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permDraft.canDeleteClients}
                  onChange={(e) => setPermDraft((p) => p ? { ...p, canDeleteClients: e.target.checked } : null)}
                />
                Can delete clients
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permDraft.canDeleteAnimals}
                  onChange={(e) => setPermDraft((p) => p ? { ...p, canDeleteAnimals: e.target.checked } : null)}
                />
                Can delete animals
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permDraft.canDeleteTreatments}
                  onChange={(e) => setPermDraft((p) => p ? { ...p, canDeleteTreatments: e.target.checked } : null)}
                />
                Can delete treatments
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permDraft.canViewActivityLog}
                  onChange={(e) => setPermDraft((p) => p ? { ...p, canViewActivityLog: e.target.checked } : null)}
                />
                Can view activity log
              </Label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsOpen(false)}>Cancel</Button>
            <Button onClick={savePermissions} disabled={!permDraft || updatePermMutation.isPending}>
              {updatePermMutation.isPending ? 'Saving…' : 'Save permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
