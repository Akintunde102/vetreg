import { useState, useId, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';

type FormType = 'client' | 'animal' | 'appointment' | 'payment' | 'org' | 'treatment' | 'quick';

interface AddNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: FormType;
  /** When opening for "Add Animal", pre-select this client. */
  defaultClientId?: string;
  showVetClinic?: boolean;
}

const baseQuickOptions: { label: string; value: FormType; emoji: string }[] = [
  { label: 'New Client', value: 'client', emoji: '👤' },
  { label: 'New Animal', value: 'animal', emoji: '🐾' },
  { label: 'New Treatment', value: 'treatment', emoji: '🩺' },
  { label: 'New Appointment', value: 'appointment', emoji: '📅' },
  { label: 'Record Payment', value: 'payment', emoji: '💰' },
];

const SPECIES_OPTIONS = [
  { label: 'Dog', value: 'DOG' },
  { label: 'Cat', value: 'CAT' },
  { label: 'Cattle', value: 'CATTLE' },
  { label: 'Goat', value: 'GOAT' },
  { label: 'Other', value: 'OTHER' },
];

export function AddNewDialog({ open, onOpenChange, defaultType = 'quick', defaultClientId, showVetClinic = false }: AddNewDialogProps) {
  const quickOptions = showVetClinic
    ? [{ label: 'Add Vet Clinic', value: 'org' as FormType, emoji: '🏥' }, ...baseQuickOptions]
    : baseQuickOptions;
  const [formType, setFormType] = useState<FormType>(defaultType);
  const [selectClientId, setSelectClientId] = useState('');
  const [selectAnimalId, setSelectAnimalId] = useState('');
  const [selectTreatmentId, setSelectTreatmentId] = useState('');
  const [selectSpecies, setSelectSpecies] = useState('DOG');
  const [selectGender, setSelectGender] = useState('');
  const [selectOrgType, setSelectOrgType] = useState('CLINIC');
  const [selectPayStatus, setSelectPayStatus] = useState('PAID');
  const [selectTreatmentAnimalId, setSelectTreatmentAnimalId] = useState('');
  const [treatmentPaymentStatus, setTreatmentPaymentStatus] = useState<'PAID' | 'OWED' | 'PARTIAL'>('OWED');
  const [selectPatientType, setSelectPatientType] = useState<'SINGLE_PET' | 'SINGLE_LIVESTOCK' | 'BATCH_LIVESTOCK'>('SINGLE_PET');
  const [selectBreed, setSelectBreed] = useState('');
  const { toast } = useToast();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const formId = useId();

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setFormType(defaultType);
      if (defaultClientId) setSelectClientId('');
      setSelectBreed('');
    }
    onOpenChange(isOpen);
  };

  useEffect(() => {
    if (open && defaultClientId && (formType === 'animal' || defaultType === 'animal')) {
      setSelectClientId(defaultClientId);
      if (formType !== 'animal') setFormType('animal');
    }
  }, [open, defaultClientId, defaultType, formType]);

  const getVal = (form: HTMLFormElement, id: string) =>
    (form.querySelector(`[id="${id}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value?.trim() ?? '';

  const clientMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; phoneNumber: string; email?: string; address?: string; city?: string; state?: string }) =>
      api.createClient(currentOrgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', currentOrgId!] });
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
      toast({ title: 'Client registered' });
      handleOpen(false);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to register client', description: e.message }),
  });

  const animalMutation = useMutation({
    mutationFn: (data: {
      clientId: string;
      name: string;
      species: string;
      breed?: string;
      gender?: string;
      dateOfBirth?: string;
      patientType: 'SINGLE_PET' | 'SINGLE_LIVESTOCK' | 'BATCH_LIVESTOCK';
      batchName?: string;
      batchSize?: number;
      batchIdentifier?: string;
    }) =>
      api.createAnimal(currentOrgId!, {
        ...data,
        patientType: data.patientType,
        ...(data.patientType === 'BATCH_LIVESTOCK' && {
          batchName: data.batchName || data.name,
          batchSize: data.batchSize,
          batchIdentifier: data.batchIdentifier,
        }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['animals', currentOrgId!] });
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
      if (variables.clientId) {
        queryClient.invalidateQueries({ queryKey: ['clients', currentOrgId!, variables.clientId, 'animals'] });
      }
      toast({ title: 'Animal registered' });
      handleOpen(false);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to register animal', description: e.message }),
  });

  const treatmentMutation = useMutation({
    mutationFn: (data: { animalId: string; diagnosis: string; scheduledFor: string; notes?: string }) => {
      const visitDate = data.scheduledFor.split('T')[0] + 'T00:00:00.000Z';
      const chiefComplaint = data.diagnosis.length >= 10 ? data.diagnosis : data.diagnosis + ' (scheduled)';
      const treatmentGiven = (data.notes && data.notes.length >= 10) ? data.notes : 'Scheduled visit';
      return api.createTreatment(currentOrgId!, {
        animalId: data.animalId,
        visitDate,
        chiefComplaint,
        treatmentGiven,
        diagnosis: data.diagnosis,
        notes: data.notes,
        scheduledFor: data.scheduledFor,
        isScheduled: true,
        status: 'IN_PROGRESS',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['treatments', currentOrgId!] });
      toast({ title: 'Appointment created' });
      handleOpen(false);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to create appointment', description: e.message }),
  });

  const recordTreatmentMutation = useMutation({
    mutationFn: (data: {
      animalId: string;
      visitDate: string;
      diagnosis: string;
      chiefComplaint: string;
      treatmentGiven: string;
      amount?: number;
      paymentStatus: 'PAID' | 'OWED' | 'PARTIAL';
      followUpDate?: string;
      notes?: string;
    }) => {
      const visitDateIso = data.visitDate.includes('T') ? data.visitDate : `${data.visitDate}T00:00:00.000Z`;
      return api.createTreatment(currentOrgId!, {
        animalId: data.animalId,
        visitDate: visitDateIso,
        chiefComplaint: data.chiefComplaint,
        treatmentGiven: data.treatmentGiven,
        diagnosis: data.diagnosis,
        amount: data.amount,
        paymentStatus: data.paymentStatus,
        followUpDate: data.followUpDate ? `${data.followUpDate}T00:00:00.000Z` : undefined,
        notes: data.notes,
        status: 'COMPLETED',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['treatments', currentOrgId!] });
      queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(currentOrgId!, variables.animalId) });
      toast({ title: 'Treatment recorded' });
      handleOpen(false);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to record treatment', description: e.message }),
  });

  const orgMutation = useMutation({
    mutationFn: (data: { name: string; address: string; city: string; state: string; phoneNumber: string; type: string }) =>
      api.createOrganization({ ...data, country: 'NG' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.all });
      toast({ title: 'Vet clinic created' });
      handleOpen(false);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to create clinic', description: e.message }),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { treatmentId: string; amountPaid: number; paymentStatus: 'PAID' | 'OWED' | 'PARTIAL'; paymentNotes?: string }) =>
      api.markPayment(currentOrgId!, data.treatmentId, {
        paymentStatus: data.paymentStatus,
        amountPaid: data.amountPaid,
        paymentNotes: data.paymentNotes ?? '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orgs', currentOrgId!, 'revenue'] });
      toast({ title: 'Payment recorded' });
      handleOpen(false);
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Failed to record payment', description: e.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const orgId = currentOrgId;
    if (!orgId && formType !== 'org') {
      toast({ variant: 'destructive', title: 'Select an organization first' });
      return;
    }

    if (formType === 'client') {
      clientMutation.mutate({
        firstName: getVal(form, formId + '-firstName'),
        lastName: getVal(form, formId + '-lastName'),
        phoneNumber: getVal(form, formId + '-phone'),
        email: getVal(form, formId + '-email') || undefined,
      });
      return;
    }
    if (formType === 'animal') {
      if (!selectClientId) { toast({ variant: 'destructive', title: 'Select a client' }); return; }
      const name = getVal(form, formId + '-animalName');
      const batchName = getVal(form, formId + '-batchName');
      const batchSizeStr = getVal(form, formId + '-batchSize');
      if (selectPatientType === 'BATCH_LIVESTOCK' && (!batchName || !batchSizeStr)) {
        toast({ variant: 'destructive', title: 'Batch name and batch size are required for batch livestock' });
        return;
      }
      animalMutation.mutate({
        clientId: selectClientId,
        name: selectPatientType === 'BATCH_LIVESTOCK' ? (batchName || name) : name,
        species: selectSpecies || 'OTHER',
        breed: selectBreed?.trim() || undefined,
        gender: selectGender || undefined,
        dateOfBirth: getVal(form, formId + '-dob') || undefined,
        patientType: selectPatientType,
        ...(selectPatientType === 'BATCH_LIVESTOCK' && {
          batchName: batchName || name,
          batchSize: Number(batchSizeStr) || undefined,
          batchIdentifier: getVal(form, formId + '-batchIdentifier') || undefined,
        }),
      });
      return;
    }
    if (formType === 'appointment') {
      if (!selectAnimalId) { toast({ variant: 'destructive', title: 'Select an animal' }); return; }
      const date = getVal(form, formId + '-apptDate');
      const time = getVal(form, formId + '-apptTime');
      const scheduledFor = date && time ? `${date}T${time}:00.000Z` : '';
      if (!scheduledFor) { toast({ variant: 'destructive', title: 'Enter date and time' }); return; }
      treatmentMutation.mutate({
        animalId: selectAnimalId,
        diagnosis: getVal(form, formId + '-diagnosis'),
        scheduledFor,
        notes: getVal(form, formId + '-apptNotes') || undefined,
      });
      return;
    }
    if (formType === 'org') {
      orgMutation.mutate({
        name: getVal(form, formId + '-orgName'),
        address: getVal(form, formId + '-orgAddress'),
        city: getVal(form, formId + '-orgCity'),
        state: getVal(form, formId + '-orgState'),
        phoneNumber: getVal(form, formId + '-orgPhone'),
        type: selectOrgType || 'CLINIC',
      });
      return;
    }
    if (formType === 'payment') {
      if (!selectTreatmentId) { toast({ variant: 'destructive', title: 'Select a treatment' }); return; }
      const amount = Number(getVal(form, formId + '-payAmount')) || 0;
      paymentMutation.mutate({
        treatmentId: selectTreatmentId,
        amountPaid: amount,
        paymentStatus: selectPayStatus as 'PAID' | 'OWED' | 'PARTIAL',
        paymentNotes: getVal(form, formId + '-payNotes') || undefined,
      });
      return;
    }
    if (formType === 'treatment') {
      if (!selectTreatmentAnimalId) { toast({ variant: 'destructive', title: 'Select an animal' }); return; }
      const visitDate = getVal(form, formId + '-txVisitDate');
      const diagnosis = getVal(form, formId + '-txDiagnosis');
      const treatmentGiven = getVal(form, formId + '-txTreatmentGiven');
      if (!visitDate) { toast({ variant: 'destructive', title: 'Visit date is required' }); return; }
      if (!diagnosis || diagnosis.length < 10) { toast({ variant: 'destructive', title: 'Diagnosis must be at least 10 characters' }); return; }
      if (!treatmentGiven || treatmentGiven.length < 10) { toast({ variant: 'destructive', title: 'Treatment given must be at least 10 characters' }); return; }
      const chiefComplaint = diagnosis.length >= 10 ? diagnosis : `Visit: ${diagnosis}`;
      const treatmentGivenPadded = treatmentGiven.length >= 10 ? treatmentGiven : `${treatmentGiven} (recorded)`;
      recordTreatmentMutation.mutate({
        animalId: selectTreatmentAnimalId,
        visitDate,
        diagnosis,
        chiefComplaint,
        treatmentGiven: treatmentGivenPadded,
        amount: getVal(form, formId + '-txAmount') ? Number(getVal(form, formId + '-txAmount')) : undefined,
        paymentStatus: treatmentPaymentStatus,
        followUpDate: getVal(form, formId + '-txFollowUpDate') || undefined,
        notes: getVal(form, formId + '-txNotes') || undefined,
      });
    }
  };

  const isLoading =
    clientMutation.isPending ||
    animalMutation.isPending ||
    treatmentMutation.isPending ||
    recordTreatmentMutation.isPending ||
    orgMutation.isPending ||
    paymentMutation.isPending;

  if (formType === 'quick') {
    return (
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New</DialogTitle>
            <DialogDescription>What would you like to create?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {quickOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFormType(opt.value)}
                className="flex flex-col items-center gap-2 p-4 bg-accent border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {formType === 'client' && 'Register Client'}
            {formType === 'animal' && 'Register Animal'}
            {formType === 'appointment' && 'Create Appointment'}
            {formType === 'treatment' && 'New Treatment'}
            {formType === 'payment' && 'Record Payment'}
            {formType === 'org' && 'Add Vet Clinic'}
          </DialogTitle>
          <DialogDescription>Fill in the details below. Data is saved to your organization.</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
          {formType === 'client' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={formId + '-firstName'}>First Name</Label>
                  <Input id={formId + '-firstName'} name="firstName" placeholder="e.g. Chidi" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={formId + '-lastName'}>Last Name</Label>
                  <Input id={formId + '-lastName'} name="lastName" placeholder="e.g. Okafor" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={formId + '-email'}>Email</Label>
                <Input id={formId + '-email'} name="email" type="email" placeholder="client@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={formId + '-phone'}>Phone Number</Label>
                <Input id={formId + '-phone'} name="phone" placeholder="+234..." required />
              </div>
            </>
          )}

          {formType === 'animal' && (
            <AnimalFormFields
              formId={formId}
              currentOrgId={currentOrgId}
              clientId={selectClientId}
              onClientIdChange={setSelectClientId}
              species={selectSpecies}
              onSpeciesChange={setSelectSpecies}
              gender={selectGender}
              onGenderChange={setSelectGender}
              patientType={selectPatientType}
              onPatientTypeChange={setSelectPatientType}
              breed={selectBreed}
              onBreedChange={setSelectBreed}
            />
          )}

          {formType === 'appointment' && (
            <AppointmentFormFields formId={formId} currentOrgId={currentOrgId} animalId={selectAnimalId} onAnimalIdChange={setSelectAnimalId} />
          )}

          {formType === 'treatment' && (
            <RecordTreatmentFormFields
              formId={formId}
              currentOrgId={currentOrgId}
              animalId={selectTreatmentAnimalId}
              onAnimalIdChange={setSelectTreatmentAnimalId}
              paymentStatus={treatmentPaymentStatus}
              onPaymentStatusChange={(v) => setTreatmentPaymentStatus(v)}
            />
          )}

          {formType === 'org' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={formId + '-orgName'}>Clinic Name</Label>
                <Input id={formId + '-orgName'} name="orgName" placeholder="e.g. Greenleaf Veterinary Clinic" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={formId + '-orgAddress'}>Address</Label>
                <Input id={formId + '-orgAddress'} name="orgAddress" placeholder="Street address" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={formId + '-orgCity'}>City</Label>
                  <Input id={formId + '-orgCity'} name="orgCity" placeholder="City" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={formId + '-orgState'}>State</Label>
                  <Input id={formId + '-orgState'} name="orgState" placeholder="State" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={formId + '-orgPhone'}>Phone Number</Label>
                <Input id={formId + '-orgPhone'} name="orgPhone" placeholder="+234..." required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={formId + '-orgType'}>Type</Label>
                <Select value={selectOrgType} onValueChange={setSelectOrgType}>
                  <SelectTrigger id={formId + '-orgType'}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLINIC">Clinic</SelectItem>
                    <SelectItem value="HOSPITAL">Hospital</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formType === 'payment' && (
            <PaymentFormFields formId={formId} currentOrgId={currentOrgId} treatmentId={selectTreatmentId} onTreatmentIdChange={setSelectTreatmentId} payStatus={selectPayStatus} onPayStatusChange={setSelectPayStatus} />
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => formType === defaultType ? handleOpen(false) : setFormType('quick' as FormType)} disabled={isLoading}>
              {defaultType === 'quick' ? 'Back' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const PATIENT_TYPE_OPTIONS = [
  { label: 'Pet', value: 'SINGLE_PET' },
  { label: 'Livestock', value: 'SINGLE_LIVESTOCK' },
  { label: 'Batch Livestock', value: 'BATCH_LIVESTOCK' },
] as const;

const COMMON_BREEDS = ['Labrador', 'German Shepherd', 'Persian', 'Siamese', 'Rottweiler', 'Mixed', 'Crossbreed'];

function AnimalFormFields({
  formId,
  currentOrgId,
  clientId,
  onClientIdChange,
  species,
  onSpeciesChange,
  gender,
  onGenderChange,
  patientType,
  onPatientTypeChange,
  breed,
  onBreedChange,
}: {
  formId: string;
  currentOrgId: string | null;
  clientId: string;
  onClientIdChange: (v: string) => void;
  species: string;
  onSpeciesChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
  patientType: 'SINGLE_PET' | 'SINGLE_LIVESTOCK' | 'BATCH_LIVESTOCK';
  onPatientTypeChange: (v: 'SINGLE_PET' | 'SINGLE_LIVESTOCK' | 'BATCH_LIVESTOCK') => void;
  breed: string;
  onBreedChange: (v: string) => void;
}) {
  const { data: clientsData } = useQuery({
    queryKey: queryKeys.clients.list(currentOrgId!, {}),
    queryFn: () => api.getClients(currentOrgId!, { limit: '500' }),
    enabled: !!currentOrgId,
  });
  const clients = clientsData?.data ?? [];
  const isBatch = patientType === 'BATCH_LIVESTOCK';
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-clientId'}>Client *</Label>
        <Select value={clientId} onValueChange={onClientIdChange} required>
          <SelectTrigger id={formId + '-clientId'}><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-patientType'}>Type *</Label>
        <Select value={patientType} onValueChange={(v) => onPatientTypeChange(v as 'SINGLE_PET' | 'SINGLE_LIVESTOCK' | 'BATCH_LIVESTOCK')}>
          <SelectTrigger id={formId + '-patientType'}><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            {PATIENT_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!isBatch && (
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-animalName'}>Animal Name *</Label>
          <Input id={formId + '-animalName'} name="animalName" placeholder="e.g. Bella" required={!isBatch} />
        </div>
      )}
      {isBatch && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-batchName'}>Batch Name *</Label>
            <Input id={formId + '-batchName'} name="batchName" placeholder="e.g. North Pasture Cattle" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={formId + '-batchSize'}>Batch Size *</Label>
              <Input id={formId + '-batchSize'} name="batchSize" type="number" min={1} placeholder="e.g. 25" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={formId + '-batchIdentifier'}>Batch ID</Label>
              <Input id={formId + '-batchIdentifier'} name="batchIdentifier" placeholder="e.g. B-001" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-animalName'}>Display Name (optional)</Label>
            <Input id={formId + '-animalName'} name="animalName" placeholder="Same as batch name if blank" />
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-species'}>Species *</Label>
          <Select value={species} onValueChange={onSpeciesChange}>
            <SelectTrigger id={formId + '-species'}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-breed'}>Breed (optional)</Label>
          <Input
            id={formId + '-breed'}
            name="breed"
            value={breed}
            onChange={(e) => onBreedChange(e.target.value)}
            placeholder="Type any breed name"
          />
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-1">
            <span>Quick:</span>
            {COMMON_BREEDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onBreedChange(breed === b ? '' : b)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium transition-colors',
                  breed === b ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-foreground'
                )}
              >
                {b}
              </button>
            ))}
          </p>
        </div>
      </div>
      {!isBatch && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-gender'}>Gender</Label>
            <Select value={gender} onValueChange={onGenderChange}>
              <SelectTrigger id={formId + '-gender'}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-dob'}>Date of Birth</Label>
            <Input id={formId + '-dob'} name="dob" type="date" />
          </div>
        </div>
      )}
    </>
  );
}

function AppointmentFormFields({
  formId,
  currentOrgId,
  animalId,
  onAnimalIdChange,
}: {
  formId: string;
  currentOrgId: string | null;
  animalId: string;
  onAnimalIdChange: (v: string) => void;
}) {
  const { data: animalsData } = useQuery({
    queryKey: queryKeys.animals.list(currentOrgId!, {}),
    queryFn: () => api.getAnimals(currentOrgId!, { limit: '500' }),
    enabled: !!currentOrgId,
  });
  const animals = animalsData?.data ?? [];
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-animalId'}>Animal / Patient</Label>
        <Select value={animalId} onValueChange={onAnimalIdChange} required>
          <SelectTrigger id={formId + '-animalId'}><SelectValue placeholder="Select animal" /></SelectTrigger>
          <SelectContent>
            {animals.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name} ({a.species})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-diagnosis'}>Reason / Diagnosis</Label>
        <Input id={formId + '-diagnosis'} name="diagnosis" placeholder="e.g. Annual vaccination" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-apptDate'}>Date</Label>
          <Input id={formId + '-apptDate'} name="apptDate" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-apptTime'}>Time</Label>
          <Input id={formId + '-apptTime'} name="apptTime" type="time" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-apptNotes'}>Notes</Label>
        <Textarea id={formId + '-apptNotes'} name="apptNotes" placeholder="Additional notes..." />
      </div>
    </>
  );
}

function PaymentFormFields({
  formId,
  currentOrgId,
  treatmentId,
  onTreatmentIdChange,
  payStatus,
  onPayStatusChange,
}: {
  formId: string;
  currentOrgId: string | null;
  treatmentId: string;
  onTreatmentIdChange: (v: string) => void;
  payStatus: string;
  onPayStatusChange: (v: string) => void;
}) {
  const { data: treatmentsRes } = useQuery({
    queryKey: ['treatments', currentOrgId, 'payment-dialog'],
    queryFn: () => api.getTreatments(currentOrgId!, { limit: '200' }),
    enabled: !!currentOrgId,
  });
  const treatments = treatmentsRes?.data ?? [];
  const unpaid = treatments.filter((t) => t.paymentStatus === 'OWED' || t.paymentStatus === 'PARTIAL');
  const list = unpaid.length > 0 ? unpaid : treatments;
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-treatmentId'}>Treatment / Invoice</Label>
        <Select value={treatmentId} onValueChange={onTreatmentIdChange} required>
          <SelectTrigger id={formId + '-treatmentId'}><SelectValue placeholder="Select treatment" /></SelectTrigger>
          <SelectContent>
            {list.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.animal?.name ?? 'Animal'} – ₦{(t.amount ?? 0).toLocaleString()} ({t.paymentStatus})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-payAmount'}>Amount (₦)</Label>
        <Input id={formId + '-payAmount'} name="payAmount" type="number" placeholder="e.g. 15000" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-payStatus'}>Payment Status</Label>
        <Select value={payStatus} onValueChange={onPayStatusChange}>
          <SelectTrigger id={formId + '-payStatus'}><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OWED">Pending</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-payNotes'}>Notes</Label>
        <Textarea id={formId + '-payNotes'} name="payNotes" placeholder="Payment details..." />
      </div>
    </>
  );
}

function RecordTreatmentFormFields({
  formId,
  currentOrgId,
  animalId,
  onAnimalIdChange,
  paymentStatus,
  onPaymentStatusChange,
}: {
  formId: string;
  currentOrgId: string | null;
  animalId: string;
  onAnimalIdChange: (v: string) => void;
  paymentStatus: 'PAID' | 'OWED' | 'PARTIAL';
  onPaymentStatusChange: (v: 'PAID' | 'OWED' | 'PARTIAL') => void;
}) {
  const { data: animalsData } = useQuery({
    queryKey: queryKeys.animals.list(currentOrgId!, {}),
    queryFn: () => api.getAnimals(currentOrgId!, { limit: '500' }),
    enabled: !!currentOrgId,
  });
  const animals = animalsData?.data ?? [];
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-txAnimalId'}>Animal / Patient *</Label>
        <Select value={animalId} onValueChange={onAnimalIdChange} required>
          <SelectTrigger id={formId + '-txAnimalId'}><SelectValue placeholder="Select animal" /></SelectTrigger>
          <SelectContent>
            {animals.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name} ({a.species})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-txVisitDate'}>Visit Date *</Label>
        <Input
          id={formId + '-txVisitDate'}
          name="txVisitDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-txDiagnosis'}>Diagnosis / Chief Complaint *</Label>
        <Input
          id={formId + '-txDiagnosis'}
          name="txDiagnosis"
          placeholder="e.g. Annual vaccination, Deworming"
          required
          minLength={10}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-txTreatmentGiven'}>Treatment Given *</Label>
        <Textarea
          id={formId + '-txTreatmentGiven'}
          name="txTreatmentGiven"
          placeholder="e.g. DHPP vaccine administered"
          required
          minLength={10}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-txAmount'}>Amount (₦)</Label>
          <Input id={formId + '-txAmount'} name="txAmount" type="number" min={0} step={1} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={formId + '-txPaymentStatus'}>Payment Status</Label>
          <Select value={paymentStatus} onValueChange={(v) => onPaymentStatusChange(v as 'PAID' | 'OWED' | 'PARTIAL')}>
            <SelectTrigger id={formId + '-txPaymentStatus'}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OWED">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-txFollowUpDate'}>Follow-up Date</Label>
        <Input id={formId + '-txFollowUpDate'} name="txFollowUpDate" type="date" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={formId + '-txNotes'}>Notes</Label>
        <Textarea id={formId + '-txNotes'} name="txNotes" placeholder="Additional notes..." rows={2} />
      </div>
    </>
  );
}
