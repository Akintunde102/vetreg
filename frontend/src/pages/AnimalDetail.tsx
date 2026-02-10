import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, PawPrint, Phone, Syringe, ClipboardList, Edit } from 'lucide-react';
import { mockAnimals, mockTreatments } from '@/lib/mock-data';
import { format, parseISO, differenceInYears, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import type { Animal } from '@/types/api';

const useMockFallback = false; // Always use API

function getSpeciesEmoji(species: string) {
  switch (species.toLowerCase()) {
    case 'dog': return '🐕';
    case 'cat': return '🐈';
    case 'cattle': return '🐄';
    default: return '🐾';
  }
}

function getAge(dob?: string) {
  if (!dob) return 'Unknown';
  const d = parseISO(dob);
  const years = differenceInYears(new Date(), d);
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} old`;
  const months = differenceInMonths(new Date(), d);
  return `${months} month${months !== 1 ? 's' : ''} old`;
}

export default function AnimalDetailPage() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { currentOrgId } = useCurrentOrg();

  const { data: animalData, isLoading, isError } = useQuery({
    queryKey: queryKeys.animals.detail(currentOrgId!, animalId!),
    queryFn: () => api.getAnimal(currentOrgId!, animalId!),
    enabled: !!currentOrgId && !!animalId && !useMockFallback,
  });
  const { data: treatmentsData } = useQuery({
    queryKey: [...queryKeys.animals.detail(currentOrgId!, animalId!), 'treatments'],
    queryFn: () => api.getAnimalTreatments(currentOrgId!, animalId!),
    enabled: !!currentOrgId && !!animalId && !useMockFallback,
  });

  const animal: (Animal & { client?: Animal['client'] }) | undefined = useMockFallback || isError
    ? mockAnimals.find((a) => a.id === animalId)
    : animalData;
  const treatments = useMockFallback || isError
    ? mockTreatments.filter((t) => t.animalId === animalId)
    : Array.isArray(treatmentsData) ? treatmentsData : (treatmentsData?.data ?? []);

  if (!animal && !isLoading) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-fade-in">
        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Animal not found</p>
        <button onClick={() => navigate('/dashboard/animals')} className="mt-4 text-primary font-medium hover:underline">
          Back to Animals
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-accent flex items-center justify-center text-4xl flex-shrink-0">
            {getSpeciesEmoji(animal.species)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{animal.breed || animal.species}</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground flex items-center gap-1">
                <Edit className="w-3 h-3" /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Species</p>
            <p className="text-sm font-semibold text-foreground">{animal.species}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gender</p>
            <p className="text-sm font-semibold text-foreground">{animal.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="text-sm font-semibold text-foreground">{getAge(animal.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-semibold text-foreground">
              {animal.patientType === 'SINGLE_PET' ? 'Pet' : animal.patientType === 'SINGLE_LIVESTOCK' ? 'Livestock' : `Batch (${animal.batchSize})`}
            </p>
          </div>
        </div>
      </div>

      {/* Owner Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Owner</p>
        <div className="flex items-center gap-3">
          {animal.client && (
            <>
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-primary">
                {animal.client.firstName[0]}{animal.client.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{animal.client.firstName} {animal.client.lastName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {animal.client.phoneNumber}
                </p>
              </div>
            </>
          )}
          {!animal.client && <p className="text-sm text-muted-foreground">Owner not loaded</p>}
          {animal.client && (
            <button
              onClick={() => navigate(`/dashboard/clients/${animal.client!.id}`)}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              View
            </button>
          )}
        </div>
      </div>

      {/* Medical History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Syringe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Medical History</h2>
          <span className="w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {treatments.length}
          </span>
        </div>

        {treatments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No treatment records yet</p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {treatments.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{t.diagnosis}</h3>
                    {t.treatmentGiven && <p className="text-xs text-muted-foreground mt-0.5">{t.treatmentGiven}</p>}
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-lg',
                    t.status === 'COMPLETED' ? 'bg-primary/10 text-primary' :
                    t.status === 'FOLLOW_UP_REQUIRED' ? 'bg-warning/10 text-warning border border-warning/20' :
                    'bg-accent text-foreground'
                  )}>
                    {t.status === 'COMPLETED' ? 'Completed' : t.status === 'FOLLOW_UP_REQUIRED' ? 'Follow-up' : 'Scheduled'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(parseISO(t.visitDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">₦{(t.amount || 0).toLocaleString()}</span>
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      t.paymentStatus === 'PAID' ? 'bg-primary' : 'bg-destructive'
                    )} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
