# Page & Component Breakdown

**Version:** 1.0.0  
**Last Updated:** February 9, 2026  
**Purpose:** Comprehensive breakdown of every page, component, and their implementations

---

## Table of Contents

1. [Authentication Pages](#authentication-pages)
2. [Onboarding Pages](#onboarding-pages)
3. [Dashboard (Home)](#dashboard-home)
4. [Organizations (Clinics)](#organizations-clinics)
5. [Animals (Pets)](#animals-pets)
6. [Animal Detail](#animal-detail)
7. [Revenue](#revenue)
8. [Clients](#clients)
9. [Treatments](#treatments)
10. [Schedule](#schedule)
11. [Settings](#settings)
12. [Shared Components](#shared-components)

---

## Authentication Pages

### `/login` - Login Page

**Purpose:** Google OAuth authentication entry point

**Layout:** Centered card on full-screen background

**Components:**

```
<LoginPage>
  <AuthLayout>
    <IllustrationBackground />
    <LoginCard>
      <AppLogo />
      <Heading>Welcome to VetReg</Heading>
      <Subtitle>Manage your veterinary practice efficiently</Subtitle>
      <GoogleSignInButton>
        <GoogleIcon />
        Sign in with Google
      </GoogleSignInButton>
      <LegalText>
        By continuing, you agree to our{' '}
        <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>
      </LegalText>
    </LoginCard>
  </AuthLayout>
</LoginPage>
```

**API Calls:** None (handled by Supabase Auth)

**State Management:**

```typescript
const { signIn, isLoading } = useAuth();

const handleGoogleSignIn = async () => {
  try {
    await signIn('google', {
      redirectTo: `${window.location.origin}/auth/callback`
    });
  } catch (error) {
    toast.error('Failed to sign in');
  }
};
```

---

### `/auth/callback` - OAuth Callback Handler

**Purpose:** Handle OAuth redirect, exchange code for session, route based on user status

**Layout:** Full-screen loading state

**Components:**

```
<CallbackPage>
  <LoadingSpinner />
  <Text>Completing sign in...</Text>
</CallbackPage>
```

**Logic:**

```typescript
export default function CallbackPage() {
  const router = useRouter();
  const { getSession } = useAuth();
  
  useEffect(() => {
    async function handleCallback() {
      try {
        // Exchange code for session
        const session = await getSession();
        
        if (!session) {
          router.push('/login?error=auth_failed');
          return;
        }
        
        // Fetch vet profile
        const profile = await api.get('/vets/profile');
        
        // Route based on status
        if (!profile.profileCompleted) {
          router.push('/onboarding/profile');
        } else if (profile.status === 'PENDING_APPROVAL') {
          router.push('/onboarding/pending');
        } else if (profile.status === 'REJECTED') {
          router.push('/account/rejected');
        } else if (profile.status === 'SUSPENDED') {
          router.push('/account/suspended');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/login?error=something_went_wrong');
      }
    }
    
    handleCallback();
  }, []);
  
  return <CallbackPage />;
}
```

---

## Onboarding Pages

### `/onboarding/profile` - Profile Completion

**Purpose:** Multi-step form to complete vet profile

**Layout:** Centered form with progress indicator

**Components:**

```
<OnboardingPage>
  <OnboardingHeader>
    <BackButton />
    <Logo />
  </OnboardingHeader>
  
  <OnboardingContainer>
    <ProgressIndicator currentStep={currentStep} totalSteps={3} />
    
    {currentStep === 1 && (
      <PersonalInfoStep>
        <StepTitle>Personal Information</StepTitle>
        <Form>
          <ImageUploader label="Profile Photo" name="profilePhotoUrl" />
          <Input label="Full Name" name="fullName" required />
          <Input label="Phone Number" name="phoneNumber" type="tel" required />
          <DatePicker label="Date of Birth" name="dateOfBirth" required />
          <Select label="Gender" name="gender" options={genderOptions} />
        </Form>
      </PersonalInfoStep>
    )}
    
    {currentStep === 2 && (
      <ProfessionalInfoStep>
        <StepTitle>Professional Information</StepTitle>
        <Form>
          <Input label="VCN Number" name="vcnNumber" required />
          <Input label="Specialization" name="specialization" />
          <NumberInput label="Years of Experience" name="yearsOfExperience" />
          <TagInput label="Qualifications" name="qualifications" />
          <Input label="University Attended" name="universityAttended" />
          <NumberInput label="Graduation Year" name="graduationYear" />
        </Form>
      </ProfessionalInfoStep>
    )}
    
    {currentStep === 3 && (
      <PracticeInfoStep>
        <StepTitle>Practice Information</StepTitle>
        <Form>
          <Textarea label="Practice Address" name="practiceAddress" />
          <Input label="City" name="city" />
          <Input label="State" name="state" />
          <CountrySelect label="Country" name="country" defaultValue="NG" />
          <Select label="Practice Type" name="practiceType" options={practiceTypes} />
        </Form>
      </PracticeInfoStep>
    )}
    
    <ButtonGroup>
      {currentStep > 1 && (
        <Button variant="secondary" onClick={handlePrevious}>
          Back
        </Button>
      )}
      {currentStep < 3 ? (
        <Button variant="primary" onClick={handleNext}>
          Next
        </Button>
      ) : (
        <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
          Submit for Approval
        </Button>
      )}
    </ButtonGroup>
  </OnboardingContainer>
</OnboardingPage>
```

**API Call:**

```typescript
const submitProfile = useMutation({
  mutationFn: (data) => api.post('/vets/profile/complete', data),
  onSuccess: () => {
    router.push('/onboarding/pending');
  },
  onError: (error) => {
    if (error.response?.data?.error?.code === 'VCN_ALREADY_EXISTS') {
      toast.error('VCN Number already registered');
    } else {
      toast.error('Failed to submit profile');
    }
  }
});
```

**Form Validation:**

```typescript
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  dateOfBirth: z.date().max(new Date(), 'Date cannot be in the future'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  vcnNumber: z.string().min(5, 'VCN number is required'),
  // ... other fields
});

const form = useForm({
  resolver: zodResolver(profileSchema),
  defaultValues: {
    country: 'NG'
  }
});
```

---

### `/onboarding/pending` - Awaiting Approval

**Purpose:** Show status while profile is under review

**Layout:** Centered card with illustration

**Components:**

```
<PendingApprovalPage>
  <StatusCard>
    <Illustration src="/images/under-review.svg" />
    <Heading>Application Under Review</Heading>
    <Description>
      Your profile has been submitted for approval. Our team will review your
      credentials and notify you via email within 24-48 hours.
    </Description>
    
    <StatusTimeline>
      <TimelineItem status="completed">
        Profile Submitted
        <Timestamp>{format(submittedAt, 'MMM dd, yyyy')}</Timestamp>
      </TimelineItem>
      <TimelineItem status="in-progress">
        Under Review
      </TimelineItem>
      <TimelineItem status="pending">
        Approval Decision
      </TimelineItem>
    </StatusTimeline>
    
    <ButtonGroup>
      <Button variant="secondary" onClick={handleSignOut}>
        Sign Out
      </Button>
      <Button variant="primary" onClick={handleRefresh} loading={isRefreshing}>
        Check Status
      </Button>
    </ButtonGroup>
    
    <HelpText>
      Questions? Email us at <Link href="mailto:support@vetreg.com">support@vetreg.com</Link>
    </HelpText>
  </StatusCard>
</PendingApprovalPage>
```

**API Calls:**

```typescript
// Poll approval status every 30 seconds
const { data: approvalStatus } = useQuery({
  queryKey: ['vet', 'approval-status'],
  queryFn: () => api.get('/vets/approval-status'),
  refetchInterval: 30000,
  onSuccess: (data) => {
    if (data.status === 'APPROVED') {
      toast.success('Your profile has been approved!');
      router.push('/dashboard');
    } else if (data.status === 'REJECTED') {
      router.push('/account/rejected');
    }
  }
});
```

---

## Dashboard (Home)

### `/dashboard` - Main Dashboard

**Purpose:** Overview of all activities, quick access to key metrics

**Layout:** Full-width with sections

**Components:**

```
<DashboardPage>
  <DashboardLayout>
    {/* Header */}
    <GreetingSection>
      <GreetingContent>
        <Heading>Good {timeOfDay}, {profile.fullName}</Heading>
        <Subtitle>{format(new Date(), 'EEEE, MMMM dd')}</Subtitle>
        <VoiceSearchButton />
      </GreetingContent>
      <GreetingIllustration src="/images/greeting-bg.svg" />
    </GreetingSection>
    
    {/* Stats Grid */}
    <StatsGrid>
      <StatsWidget
        icon={<BuildingIcon />}
        value={orgs.length}
        label="Vet Clinics"
        badge={pendingOrgsCount}
        onClick={() => router.push('/organizations')}
      />
      <StatsWidget
        icon={<UsersIcon />}
        value={stats.clients.total}
        label="Clients"
        onClick={() => router.push('/dashboard/clients')}
      />
      <StatsWidget
        icon={<PawPrintIcon />}
        value={stats.animals.pets}
        label="Pets"
        onClick={() => router.push('/dashboard/animals?type=pet')}
      />
      <StatsWidget
        icon={<TractorIcon />}
        value={stats.animals.livestock}
        label="Livestocks"
        onClick={() => router.push('/dashboard/animals?type=livestock')}
      />
      <StatsWidget
        icon={<DollarSignIcon />}
        value={formatCurrency(stats.revenue.total)}
        label="Revenue"
        onClick={() => router.push('/dashboard/revenue')}
      />
      <StatsWidget
        icon={<ClipboardIcon />}
        value={stats.revenue.unpaidInvoices}
        label="Pending payments"
        onClick={() => router.push('/dashboard/revenue?status=owed')}
      />
      <StatsWidget
        icon={<CalendarIcon />}
        value={stats.treatments.scheduled}
        label="Upcoming appointments"
        onClick={() => router.push('/dashboard/schedule')}
      />
    </StatsGrid>
    
    {/* Today's Agenda */}
    <TodaySection>
      <SectionTitle>Today's Agenda</SectionTitle>
      
      <AgendaGrid>
        {/* Unsettled Schedules */}
        <UnsettledSchedules>
          <SectionHeader>
            <Heading>Unsettled schedules</Heading>
            <Badge>{scheduledToday.length}</Badge>
          </SectionHeader>
          
          {scheduledToday.length === 0 ? (
            <EmptyState>
              <IllustrationIcon />
              <Text>No schedules for today</Text>
            </EmptyState>
          ) : (
            scheduledToday.map(treatment => (
              <ScheduleCard key={treatment.id}>
                <ScheduleTime>
                  <ClockIcon />
                  {format(parseISO(treatment.scheduledFor), 'h:mm a')}
                </ScheduleTime>
                <ScheduleType>{treatment.diagnosis || 'General Check'}</ScheduleType>
                <SchedulePatient>
                  <AnimalIcon species={treatment.animal.species} />
                  {treatment.animal.name} ({treatment.animal.client.firstName} {treatment.animal.client.lastName})
                </SchedulePatient>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => handleSettle(treatment.id)}
                >
                  Settle
                </Button>
              </ScheduleCard>
            ))
          )}
        </UnsettledSchedules>
        
        {/* Don't Forget */}
        <DontForgetSection>
          <SectionHeader>
            <AlertIcon />
            <Heading>Don't Forget</Heading>
          </SectionHeader>
          
          <ReminderList>
            {followUpsToday.length > 0 && (
              <ReminderItem>
                <Bullet />
                {followUpsToday.length} follow-ups today
              </ReminderItem>
            )}
            {unpaidInvoices > 0 && (
              <ReminderItem>
                <Bullet />
                {unpaidInvoices} unpaid invoices
              </ReminderItem>
            )}
            {vaccinationsDue.length > 0 && (
              <ReminderItem>
                <Bullet />
                {vaccinationsDue.length} pets due for vaccination
              </ReminderItem>
            )}
          </ReminderList>
          
          <Button 
            variant="secondary" 
            onClick={() => router.push('/dashboard/schedule')}
          >
            View All →
          </Button>
        </DontForgetSection>
      </AgendaGrid>
    </TodaySection>
    
    {/* FAB */}
    <FloatingActionButton onClick={handleAddNew}>
      <PlusIcon />
    </FloatingActionButton>
  </DashboardLayout>
</DashboardPage>
```

**API Calls:**

```typescript
// Dashboard stats (single API call)
const { data: stats, isLoading } = useQuery({
  queryKey: ['dashboard', 'stats', currentOrgId],
  queryFn: () => api.get(`/orgs/${currentOrgId}/dashboard/stats`),
  staleTime: 2 * 60 * 1000, // 2 minutes
  enabled: !!currentOrgId
});

// Scheduled treatments for today
const { data: scheduledToday } = useQuery({
  queryKey: ['treatments', 'scheduled', 'today', currentOrgId],
  queryFn: () => api.get(`/orgs/${currentOrgId}/treatments/scheduled/today`),
  refetchInterval: 60000 // Refetch every minute
});

// Follow-ups due today
const { data: followUpsToday } = useQuery({
  queryKey: ['treatments', 'follow-ups', 'today', currentOrgId],
  queryFn: () => api.get(`/orgs/${currentOrgId}/treatments/follow-ups/today`)
});

// Vaccinations due (next 30 days)
const { data: vaccinationsDue } = useQuery({
  queryKey: ['animals', 'vaccination-due', currentOrgId],
  queryFn: () => api.get(`/orgs/${currentOrgId}/animals/vaccination-due`, {
    params: { days: 30, limit: 10 }
  })
});

// Organizations list
const { data: orgs } = useQuery({
  queryKey: ['orgs'],
  queryFn: () => api.get('/orgs'),
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

**Interactions:**

```typescript
// Settle scheduled treatment
const settleSchedule = useMutation({
  mutationFn: (treatmentId: string) => 
    api.patch(`/orgs/${currentOrgId}/treatments/${treatmentId}`, {
      status: 'COMPLETED',
      visitDate: new Date().toISOString()
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(['treatments', 'scheduled']);
    queryClient.invalidateQueries(['dashboard', 'stats']);
    toast.success('Schedule settled successfully');
  }
});

// Add new (opens modal with options)
const handleAddNew = () => {
  openModal({
    title: 'Add New',
    content: <AddNewModal />
  });
};

// Modal options: Add Client, Register Animal, Create Treatment, Schedule Appointment
```

---

## Organizations (Clinics)

### `/organizations` - Clinics List

**Purpose:** View and manage all vet clinics/organizations

**Layout:** Grid of clinic cards

**Components:**

```
<OrganizationsPage>
  <PageHeader>
    <Heading>Vet Clinics</Heading>
    <Button variant="primary" onClick={handleAddNew}>
      <PlusIcon /> Add New
    </Button>
  </PageHeader>
  
  <PageDescription>
    Manage the veterinary clinics in your network.
  </PageDescription>
  
  {/* Search */}
  <SearchBar>
    <SearchIcon />
    <Input placeholder="Search clinics..." value={search} onChange={setSearch} />
    <VoiceButton />
  </SearchBar>
  
  {/* Clinic Cards */}
  <ClinicGrid>
    {filteredOrgs.map(org => (
      <ClinicCard key={org.id}>
        <ClinicHeader>
          <ClinicIcon>
            {org.logoUrl ? (
              <Image src={org.logoUrl} alt={org.name} />
            ) : (
              <BuildingIcon />
            )}
            <ClientBadge>{org._counts.clients}</ClientBadge>
          </ClinicIcon>
          
          <ClinicInfo>
            <ClinicName>{org.name}</ClinicName>
            <ClinicAddress>{org.address}, {org.city}</ClinicAddress>
          </ClinicInfo>
        </ClinicHeader>
        
        <ClinicStats>
          <StatText>
            <strong>{org._counts.clients}</strong> patients referred this month
          </StatText>
          <UpdatedText>Updated {formatDistanceToNow(parseISO(org.updatedAt))} ago</UpdatedText>
        </ClinicStats>
        
        <ClinicMeta>
          {org.status === 'PENDING_APPROVAL' && (
            <StatusBadge variant="warning">
              <StatusDot />
              Pending approval
            </StatusBadge>
          )}
          {org.status === 'APPROVED' && org.paymentTerms && (
            <PaymentTerms>Payment terms: {org.paymentTerms}</PaymentTerms>
          )}
        </ClinicMeta>
        
        <ClinicFooter>
          <Button 
            variant="primary" 
            onClick={() => handleSwitchOrg(org.id)}
          >
            View
          </Button>
        </ClinicFooter>
      </ClinicCard>
    ))}
  </ClinicGrid>
  
  {/* Pending Verification Section */}
  {pendingOrgs.length > 0 && (
    <PendingSection>
      <PendingHeader>
        <AlertIcon />
        <Heading>Pending Verification ({pendingOrgs.length})</Heading>
        <Link href="/organizations?status=pending">View All →</Link>
      </PendingHeader>
      <Description>New clinics awaiting approval</Description>
      <Illustration src="/images/pending-verification.svg" />
    </PendingSection>
  )}
  
  {/* FAB */}
  <FloatingActionButton onClick={handleAddNew}>
    <PlusIcon />
  </FloatingActionButton>
</OrganizationsPage>
```

**API Calls:**

```typescript
// Get all organizations
const { data: orgs, isLoading } = useQuery({
  queryKey: ['orgs'],
  queryFn: () => api.get('/orgs'),
  select: (data) => data.data
});

// Client-side filtering
const filteredOrgs = orgs?.filter(org => 
  org.name.toLowerCase().includes(search.toLowerCase()) ||
  org.address.toLowerCase().includes(search.toLowerCase())
) || [];

const pendingOrgs = orgs?.filter(org => org.status === 'PENDING_APPROVAL') || [];
```

**Interactions:**

```typescript
// Switch to organization
const handleSwitchOrg = (orgId: string) => {
  localStorage.setItem('currentOrgId', orgId);
  queryClient.invalidateQueries(); // Refresh all org-scoped data
  router.push('/dashboard');
};

// Create new organization
const createOrg = useMutation({
  mutationFn: (data: CreateOrgDto) => api.post('/orgs', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['orgs']);
    toast.success('Organization created successfully');
    closeModal();
  }
});
```

---

## Animals (Pets)

### `/dashboard/animals` - Animals List

**Purpose:** View and manage all animals (pets and livestock)

**Layout:** List with filters

**Components:**

```
<AnimalsPage>
  <PageHeader>
    <Heading>Pets</Heading>
    <Button variant="primary" onClick={handleAddNew}>
      <PlusIcon /> Add New
    </Button>
  </PageHeader>
  
  <PageDescription>
    Manage the individual pets of your clients.
  </PageDescription>
  
  {/* Search */}
  <SearchBar>
    <SearchIcon />
    <Input placeholder="Search pets..." value={search} onChange={setSearch} />
    <VoiceButton />
  </SearchBar>
  
  {/* Filter Tabs */}
  <FilterTabs>
    <Tab active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
      All ({counts.all})
    </Tab>
    <Tab active={filter === 'DOG'} onClick={() => setFilter('DOG')}>
      Dogs ({counts.dogs})
    </Tab>
    <Tab active={filter === 'CAT'} onClick={() => setFilter('CAT')}>
      Cats ({counts.cats})
    </Tab>
    <Tab active={filter === 'OTHER'} onClick={() => setFilter('OTHER')}>
      Other ({counts.other})
      <SpecialBadge />
    </Tab>
  </FilterTabs>
  
  {/* Animal Cards */}
  <AnimalList>
    {animals.map(animal => (
      <AnimalCard key={animal.id}>
        <AnimalImage src={animal.photoUrl || getDefaultImage(animal.species)} />
        
        <AnimalInfo>
          <AnimalName>{animal.name}</AnimalName>
          <OwnerName>{animal.client.firstName} {animal.client.lastName}</OwnerName>
          
          <AnimalMeta>
            <SpeciesTag>
              <SpeciesIcon species={animal.species} />
              {animal.species}
            </SpeciesTag>
          </AnimalMeta>
          
          <AnimalStatus>
            {animal.nextSchedule ? (
              <>
                <StatusIcon variant="info" />
                {animal.nextSchedule.type} • {formatDistanceToNow(parseISO(animal.nextSchedule.date))}
              </>
            ) : (
              <>
                <StatusIcon variant="neutral" />
                Last visit updated {formatDistanceToNow(parseISO(animal.lastVisit))} ago
              </>
            )}
          </AnimalStatus>
          
          {animal.vaccinationStatus && (
            <VaccinationBadge variant={animal.vaccinationStatus.variant}>
              <BadgeIcon />
              {animal.vaccinationStatus.text}
            </VaccinationBadge>
          )}
        </AnimalInfo>
        
        <AnimalActions>
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => router.push(`/dashboard/animals/${animal.id}`)}
          >
            View
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => openMessageModal(animal.client)}
          >
            Message
          </Button>
          <IconButton onClick={() => router.push(`/dashboard/clients/${animal.clientId}`)}>
            <UserIcon />
            Client
          </IconButton>
        </AnimalActions>
      </AnimalCard>
    ))}
  </AnimalList>
  
  {/* Pagination */}
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
  
  {/* Don't Forget Section */}
  <DontForgetSection>
    <AlertIcon />
    <Heading>Don't Forget</Heading>
    <ReminderList>
      {vaccinationsDue.length > 0 && (
        <ReminderItem>
          {vaccinationsDue.length} pets due for vaccination
        </ReminderItem>
      )}
      {followUps.length > 0 && (
        <ReminderItem>
          {followUps.length} follow-ups today
        </ReminderItem>
      )}
    </ReminderList>
    <Button variant="secondary">View All</Button>
  </DontForgetSection>
  
  {/* FAB */}
  <FloatingActionButton onClick={handleAddNew}>
    <PlusIcon />
  </FloatingActionButton>
</AnimalsPage>
```

**API Calls:**

```typescript
// Fetch animals with filters
const { data, isLoading } = useQuery({
  queryKey: ['animals', currentOrgId, page, filter, search],
  queryFn: () => api.get(`/orgs/${currentOrgId}/animals`, {
    params: {
      page,
      limit: 20,
      species: filter === 'ALL' ? undefined : filter,
      search
    }
  }),
  keepPreviousData: true
});

// Get counts for filter tabs
const { data: counts } = useQuery({
  queryKey: ['animals', 'counts', currentOrgId],
  queryFn: async () => {
    const [all, dogs, cats, other] = await Promise.all([
      api.get(`/orgs/${currentOrgId}/animals`, { params: { limit: 1 } }),
      api.get(`/orgs/${currentOrgId}/animals`, { params: { species: 'DOG', limit: 1 } }),
      api.get(`/orgs/${currentOrgId}/animals`, { params: { species: 'CAT', limit: 1 } }),
      // Calculate other by subtracting dogs and cats from all
    ]);
    
    return {
      all: all.meta.totalCount,
      dogs: dogs.meta.totalCount,
      cats: cats.meta.totalCount,
      other: all.meta.totalCount - dogs.meta.totalCount - cats.meta.totalCount
    };
  },
  staleTime: 5 * 60 * 1000
});

// Vaccinations due
const { data: vaccinationsDue } = useQuery({
  queryKey: ['animals', 'vaccination-due', currentOrgId],
  queryFn: () => api.get(`/orgs/${currentOrgId}/animals/vaccination-due`, {
    params: { days: 30, limit: 10 }
  })
});
```

---

Due to length constraints, I'll create separate files for the remaining pages. Let me save this and continue with more pages in the next file.

