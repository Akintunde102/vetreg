import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, PawPrint, Calendar, DollarSign, Clock } from 'lucide-react';
import { mockClients, mockClientDetails, mockAnimals, mockTreatments } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import type { Client } from '@/types/api';
import type { Animal as AnimalType, Treatment } from '@/types/api';

const useMockFallback = false; // Always use API

function getSpeciesEmoji(species: string) {
  switch (species.toLowerCase()) {
    case 'dog': return '🐕';
    case 'cat': return '🐈';
    case 'cattle': return '🐄';
    default: return '🐾';
  }
}

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { currentOrgId } = useCurrentOrg();

  const { data: clientData, isLoading, isError } = useQuery({
    queryKey: queryKeys.clients.detail(currentOrgId!, clientId!),
    queryFn: () => api.getClient(currentOrgId!, clientId!),
    enabled: !!currentOrgId && !!clientId && !useMockFallback,
  });
  const { data: clientAnimals = [] } = useQuery({
    queryKey: ['clients', currentOrgId, clientId, 'animals'],
    queryFn: () => api.getClientAnimals(currentOrgId!, clientId!),
    enabled: !!currentOrgId && !!clientId && !useMockFallback,
  });
  const { data: orgTreatmentsRes } = useQuery({
    queryKey: queryKeys.treatments.list(currentOrgId!, { clientDetail: clientId }),
    queryFn: () => api.getTreatments(currentOrgId!, { limit: '200' }),
    enabled: !!currentOrgId && !!clientId && !useMockFallback && (clientAnimals?.length ?? 0) > 0,
  });

  const client: Client | undefined = useMockFallback || isError
    ? mockClients.find((c) => c.id === clientId)
    : clientData;
  const details = mockClientDetails.find((d) => d.clientId === clientId);
  const animals: AnimalType[] = useMockFallback || isError
    ? mockAnimals.filter((a) => a.clientId === clientId)
    : (clientAnimals ?? []);
  const allTreatments = useMockFallback || isError
    ? mockTreatments
    : orgTreatmentsRes?.data ?? [];
  const treatments: Treatment[] = useMockFallback || isError
    ? mockTreatments.filter((t) => animals.some((a) => a.id === t.animalId))
    : allTreatments.filter((t) => animals.some((a) => a.id === t.animalId));

  if (!client && !isLoading) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-fade-in">
        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Client not found</p>
        <button onClick={() => navigate('/dashboard/clients')} className="mt-4 text-primary font-medium hover:underline">
          Back to Clients
        </button>
      </div>
    );
  }

  if (isLoading && !useMockFallback) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-card border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  const initials = `${client!.firstName[0]}${client!.lastName[0]}`;
  const balance = details?.balance ?? 0;
  const totalPaid = treatments.filter(t => t.paymentStatus === 'PAID').reduce((s, t) => s + (t.amount || 0), 0);
  const totalOwed = treatments.filter(t => t.paymentStatus === 'OWED').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{client.firstName} {client.lastName}</h1>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {client.phoneNumber}
              </p>
              {client.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {client.email}
                </p>
              )}
            </div>
          </div>
          {balance > 0 && (
            <span className="text-xs font-bold text-warning bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-lg h-fit flex-shrink-0">
              ₦{balance.toLocaleString()} Due
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{animals.length}</p>
            <p className="text-xs text-muted-foreground">Animals</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">₦{totalPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-destructive">₦{totalOwed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">
        {/* Animals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PawPrint className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Animals</h2>
            <span className="w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {animals.length}
            </span>
          </div>

          {animals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
              <PawPrint className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No animals registered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {animals.map(animal => (
                <div
                  key={animal.id}
                  onClick={() => navigate(`/dashboard/animals/${animal.id}`)}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-xl flex-shrink-0">
                      {getSpeciesEmoji(animal.species)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{animal.name}</h3>
                      <p className="text-xs text-muted-foreground">{animal.breed || animal.species} · {animal.gender || 'N/A'}</p>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {animal.patientType === 'SINGLE_PET' ? 'Pet' : 'Livestock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment History & Visit Timeline */}
        <div className="space-y-5">
          {/* Payment Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Payment History</h2>
            </div>

            {treatments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {treatments.map(t => (
                  <div key={t.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{t.diagnosis}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.animal.patientType === 'BATCH_LIVESTOCK' ? `Batch ${t.animal.batchIdentifier}` : t.animal.name} · {t.organization.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-foreground">₦{(t.amount || 0).toLocaleString()}</p>
                        <span className={cn(
                          'inline-flex items-center gap-1 text-[11px] font-medium',
                          t.paymentStatus === 'PAID' ? 'text-primary' : 'text-destructive'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', t.paymentStatus === 'PAID' ? 'bg-primary' : 'bg-destructive')} />
                          {t.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {format(parseISO(t.visitDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visit Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Visit Timeline</h2>
            </div>

            {treatments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No visits recorded</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-border space-y-4">
                {[...treatments]
                  .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                  .map(t => (
                    <div key={`tl-${t.id}`} className="relative">
                      <div className="absolute -left-[1.625rem] w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      <div className="bg-card border border-border rounded-xl p-3">
                        <p className="text-xs text-muted-foreground">{format(parseISO(t.visitDate), 'MMM dd, yyyy · h:mm a')}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{t.diagnosis}</p>
                        {t.treatmentGiven && <p className="text-xs text-muted-foreground">{t.treatmentGiven}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{t.animal.name}</span>
                          <span className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                            t.status === 'COMPLETED' ? 'bg-primary/10 text-primary' :
                            t.status === 'FOLLOW_UP_REQUIRED' ? 'bg-warning/10 text-warning' :
                            'bg-accent text-foreground'
                          )}>
                            {t.status === 'COMPLETED' ? 'Completed' : t.status === 'FOLLOW_UP_REQUIRED' ? 'Follow-up' : 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
