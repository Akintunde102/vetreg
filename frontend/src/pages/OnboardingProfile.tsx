import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  vcnNumber: z.string().min(5, 'VCN number is required'),
  specialization: z.string().optional(),
  yearsOfExperience: z.coerce.number().optional(),
  practiceAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('NG'),
  practiceType: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const STEPS = 3;

export default function OnboardingProfilePage() {
  const { profileCompleted, isApproved } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profileCompleted && isApproved) {
      navigate('/dashboard', { replace: true });
    }
  }, [profileCompleted, isApproved, navigate]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { country: 'NG', gender: 'MALE' },
  });

  const handleNext = async () => {
    const fieldsByStep: Record<number, (keyof ProfileForm)[]> = {
      1: ['fullName', 'phoneNumber', 'dateOfBirth', 'gender'],
      2: ['vcnNumber', 'specialization', 'yearsOfExperience'],
      3: ['practiceAddress', 'city', 'state', 'country', 'practiceType'],
    };

    const fields = fieldsByStep[step] ?? [];
    const ok = await form.trigger(fields, { shouldFocus: true });
    if (!ok) return;

    if (step < STEPS) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      await api.completeProfile({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
        vcnNumber: data.vcnNumber,
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        practiceAddress: data.practiceAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        practiceType: data.practiceType as any,
      });
      toast({ title: 'Profile submitted', description: 'Your application is under review.' });
      navigate('/onboarding/pending');
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'VCN_ALREADY_EXISTS') {
        toast({ variant: 'destructive', title: 'VCN already registered', description: err.message });
      } else {
        toast({ variant: 'destructive', title: 'Failed to submit', description: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center gap-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VR</span>
          </div>
          <span className="font-semibold">Complete your profile</span>
        </div>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full p-6">
        <div className="mb-6">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Step {step} of {STEPS}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...form.register('fullName')} placeholder="Dr. Adebayo Johnson" />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...form.register('phoneNumber')} placeholder="+2348012345678" />
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...form.register('dateOfBirth')} />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={form.watch('gender') ?? 'MALE'}
                  onValueChange={(v) => form.setValue('gender', v as ProfileForm['gender'], { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-destructive">{form.formState.errors.gender.message}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Professional Information</h2>
              <div className="space-y-2">
                <Label htmlFor="vcnNumber">VCN Number</Label>
                <Input id="vcnNumber" {...form.register('vcnNumber')} placeholder="VCN-2024-0042" />
                {form.formState.errors.vcnNumber && (
                  <p className="text-sm text-destructive">{form.formState.errors.vcnNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" {...form.register('specialization')} placeholder="Small Animal Medicine" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input id="yearsOfExperience" type="number" {...form.register('yearsOfExperience')} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Practice Information</h2>
              <div className="space-y-2">
                <Label htmlFor="practiceAddress">Practice Address</Label>
                <Textarea id="practiceAddress" {...form.register('practiceAddress')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...form.register('city')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...form.register('state')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select onValueChange={(v) => form.setValue('country', v)} defaultValue="NG">
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NG">Nigeria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handlePrev} className="flex-1">
                Back
              </Button>
            )}
            {step < STEPS ? (
              <Button type="button" className="flex-1" onClick={handleNext} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                Submit for Approval
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
