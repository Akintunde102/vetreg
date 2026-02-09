import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type FormType = 'client' | 'animal' | 'appointment' | 'payment' | 'quick';

interface AddNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: FormType;
}

const quickOptions: { label: string; value: FormType; emoji: string }[] = [
  { label: 'New Client', value: 'client', emoji: '👤' },
  { label: 'New Animal', value: 'animal', emoji: '🐾' },
  { label: 'New Appointment', value: 'appointment', emoji: '📅' },
  { label: 'Record Payment', value: 'payment', emoji: '💰' },
];

export function AddNewDialog({ open, onOpenChange, defaultType = 'quick' }: AddNewDialogProps) {
  const [formType, setFormType] = useState<FormType>(defaultType);
  const { toast } = useToast();

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) setFormType(defaultType);
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const labels: Record<FormType, string> = {
      client: 'Client registered',
      animal: 'Animal registered',
      appointment: 'Appointment created',
      payment: 'Payment recorded',
      quick: '',
    };
    toast({ title: labels[formType] || 'Saved', description: 'This is a demo. Connect a backend to persist data.' });
    handleOpen(false);
  };

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {formType === 'client' && 'Register Client'}
            {formType === 'animal' && 'Register Animal'}
            {formType === 'appointment' && 'Create Appointment'}
            {formType === 'payment' && 'Record Payment'}
          </DialogTitle>
          <DialogDescription>Fill in the details below. Data is demo-only until a backend is connected.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formType === 'client' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="e.g. Chidi" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="e.g. Okafor" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="client@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+234..." required />
              </div>
            </>
          )}

          {formType === 'animal' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="animalName">Animal Name</Label>
                <Input id="animalName" placeholder="e.g. Bella" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="species">Species</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Cattle">Cattle</SelectItem>
                      <SelectItem value="Goat">Goat</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="breed">Breed</Label>
                  <Input id="breed" placeholder="e.g. Labrador" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
            </>
          )}

          {formType === 'appointment' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="apptAnimal">Animal / Patient</Label>
                <Input id="apptAnimal" placeholder="Search animal name..." required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="diagnosis">Reason / Diagnosis</Label>
                <Input id="diagnosis" placeholder="e.g. Annual vaccination" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="apptDate">Date</Label>
                  <Input id="apptDate" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apptTime">Time</Label>
                  <Input id="apptTime" type="time" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apptNotes">Notes</Label>
                <Textarea id="apptNotes" placeholder="Additional notes..." />
              </div>
            </>
          )}

          {formType === 'payment' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="payAnimal">Animal / Patient</Label>
                <Input id="payAnimal" placeholder="Search animal name..." required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payAmount">Amount (₦)</Label>
                <Input id="payAmount" type="number" placeholder="e.g. 15000" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payStatus">Payment Status</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OWED">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payNotes">Notes</Label>
                <Textarea id="payNotes" placeholder="Payment details..." />
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => formType === defaultType ? handleOpen(false) : setFormType('quick' as FormType)}>
              {defaultType === 'quick' ? 'Back' : 'Cancel'}
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
