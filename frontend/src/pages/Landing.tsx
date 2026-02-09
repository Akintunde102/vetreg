import { Link } from 'react-router-dom';
import { ClipboardList, Bell, Tractor, CheckSquare, Users, PawPrint, Stethoscope, Check } from 'lucide-react';
import heroVet from '@/assets/hero-vet.png';

const painPoints = [
  { icon: ClipboardList, question: 'Too many records to keep?', answer: 'All in one place' },
  { icon: Bell, question: 'Missing follow-ups?', answer: 'Automatic reminders' },
  { icon: Tractor, question: 'Farm records messy?', answer: 'Livestock tracking' },
  { icon: CheckSquare, question: 'Too much admin work?', answer: 'Easy invoicing' },
];

const steps = [
  { num: 1, title: 'Add your client', desc: 'Owner details & contact', icon: Users },
  { num: 2, title: 'Add pets or livestock', desc: 'Create pet profiles or batches', icon: PawPrint },
  { num: 3, title: 'Record treatments', desc: 'Treat & set reminders', icon: Stethoscope },
];

const benefits = [
  'Saves time on paperwork',
  'Reduces missed appointments',
  'Organizes all records',
  'Great for farms & clinics',
];

export default function LandingPage() {
  return (
    <div className="landing-green min-h-screen bg-[hsl(0,0%,100%)]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[hsl(0,0%,100%)]/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--landing-green))] flex items-center justify-center">
              <span className="text-[hsl(0,0%,100%)] font-bold text-sm">VR</span>
            </div>
            <span className="font-bold text-lg text-foreground">VetReg</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="text-sm font-medium text-foreground hover:text-[hsl(var(--landing-green))] transition-colors px-3 py-1.5">Log in</button>
            </Link>
            <Link to="/login">
              <button className="text-sm font-semibold bg-[hsl(var(--landing-green))] text-[hsl(0,0%,100%)] px-4 py-2 rounded-lg hover:bg-[hsl(var(--landing-green-dark))] transition-colors">
                Start Free
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--landing-green-light))] via-[hsl(140,30%,90%)] to-[hsl(0,0%,100%)]">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-10 lg:pt-20 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            {/* Mobile: image on top, text below — use order */}
            <div className="order-2 lg:order-1">
              <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--landing-green-dark))] leading-[1.2]">
                Run your entire vet practice from your phone
              </h1>
              <p className="mt-3 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md">
                Manage clients, pets, livestock batches, treatments, reminders, and payments in one simple app.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/login">
                  <button className="font-semibold bg-[hsl(var(--landing-green))] text-[hsl(0,0%,100%)] px-6 py-3 rounded-lg hover:bg-[hsl(var(--landing-green-dark))] transition-colors text-sm sm:text-base">
                    Start Free
                  </button>
                </Link>
                <button className="font-semibold border border-border bg-[hsl(0,0%,100%)] text-foreground px-6 py-3 rounded-lg hover:bg-muted transition-colors text-sm sm:text-base">
                  Watch Demo
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                <PawPrint className="w-4 h-4" /> Made for private practicing veterinarians
              </p>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <img
                src={heroVet}
                alt="Veterinarian with animals"
                className="w-48 sm:w-64 lg:w-full lg:max-w-md rounded-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-6xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {painPoints.map((p) => (
            <div key={p.question} className="bg-[hsl(0,0%,100%)] border border-border rounded-xl p-3 lg:p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--landing-green))]/10 flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <p.icon className="w-5 h-5 text-[hsl(var(--landing-green))]" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">{p.question}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{p.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[hsl(var(--landing-green-light))] py-10 lg:py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Title with decorative lines */}
          <div className="flex items-center gap-4 justify-center mb-8 lg:mb-10">
            <div className="h-px flex-1 max-w-[60px] bg-border" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[hsl(var(--landing-green-dark))]">How It Works</h2>
            <div className="h-px flex-1 max-w-[60px] bg-border" />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[hsl(var(--landing-green))]/10 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <s.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(var(--landing-green))]" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  <span className="text-[hsl(var(--landing-green))]">{s.num}.</span> {s.title}
                </p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 hidden sm:block">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Livestock CTA */}
      <section className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
        <div className="bg-[hsl(var(--landing-green-light))] border border-[hsl(var(--landing-green))]/20 rounded-2xl p-5 sm:p-6 lg:p-10 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[hsl(var(--landing-green-dark))] mb-1 lg:mb-2">
              Finally manage livestock batches properly
            </h2>
            <p className="text-sm text-muted-foreground mb-4 lg:mb-0 max-w-md">
              Track and treat specific animals in any batch with ease.
            </p>
          </div>
          <button className="font-semibold bg-[hsl(var(--landing-green))] text-[hsl(0,0%,100%)] px-5 py-2.5 rounded-lg hover:bg-[hsl(var(--landing-green-dark))] transition-colors text-sm">
            See Batch Tracking
          </button>
        </div>
      </section>

      {/* Why Vets Love Us */}
      <section className="bg-[hsl(0,0%,100%)] py-10 lg:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px flex-1 max-w-[60px] bg-border" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[hsl(var(--landing-green-dark))]">Why Vets Love Us</h2>
            <div className="h-px flex-1 max-w-[60px] bg-border" />
          </div>
          <ul className="flex flex-col gap-3 max-w-sm mx-auto lg:max-w-none lg:flex-row lg:justify-center lg:gap-10">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-foreground">
                <Check className="w-5 h-5 text-[hsl(var(--landing-green))] flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-10 lg:py-16 text-center">
        <Link to="/login">
          <button className="w-full max-w-sm font-bold bg-[hsl(var(--landing-green))] text-[hsl(0,0%,100%)] px-6 py-4 rounded-xl hover:bg-[hsl(var(--landing-green-dark))] transition-colors text-base sm:text-lg">
            Start Free
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 VetReg. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
