import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'VR';

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">
        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Profile</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {initials}
            </div>
            <div>
              <p className="font-bold text-foreground">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.specialization}</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            {[
              { label: 'Full Name', value: user?.fullName },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phoneNumber || 'Not set' },
              { label: 'VCN Number', value: user?.vcnNumber || 'Not set' },
              { label: 'Specialization', value: user?.specialization || 'Not set' },
              { label: 'City', value: user?.city || 'Not set' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => toast({ title: 'Edit Profile', description: 'Profile editing will be available with backend integration.' })}
            className="w-full mt-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
              </div>
              <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Privacy & Security</h2>
          </div>
          <div className="space-y-1">
            {['Change Password', 'Two-Factor Authentication', 'Login History', 'Data Export'].map(item => (
              <button
                key={item}
                onClick={() => toast({ title: item, description: `${item} will be available with backend integration.` })}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-foreground hover:bg-muted px-3 rounded-lg transition-colors"
              >
                {item}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Support</h2>
          </div>
          <div className="space-y-1">
            {[
              { icon: HelpCircle, label: 'Help Center' },
              { icon: FileText, label: 'Terms of Service' },
              { icon: Shield, label: 'Privacy Policy' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => toast({ title: item.label, description: `${item.label} page will be available soon.` })}
                className="w-full flex items-center justify-between py-3 text-sm font-medium text-foreground hover:bg-muted px-3 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
