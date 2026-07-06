import React, { useMemo, useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../lib/utils';

type ProfileType = 'Aspiring Business Owner' | 'Professional' | 'Freelancer' | 'Consultant' | 'Student';
type TeamSize = '1-5' | '6-20' | '21-50' | '50+';
type Turnover = 'Under ₹10L' | '₹10L–50L' | '₹50L–1Cr' | '₹1Cr–5Cr' | '5Cr+';

interface EventMeta {
  code: string;
  name: string;
  date: string;
  city: string;
  registrationsClosed: boolean;
  slotType: 'single' | 'both';
  defaultSlot?: 'Morning' | 'Evening';
}

const EVENTS: Record<string, EventMeta> = {
  'BBS-MUM-MAY26': {
    code: 'BBS-MUM-MAY26',
    name: 'BBS Mumbai — May 2026',
    date: '15 May 2026',
    city: 'Mumbai',
    registrationsClosed: false,
    slotType: 'both',
  },
  'BBS-DEL-APR26': {
    code: 'BBS-DEL-APR26',
    name: 'BBS Delhi — Apr 2026',
    date: '12 Apr 2026',
    city: 'Delhi',
    registrationsClosed: true,
    slotType: 'single',
    defaultSlot: 'Morning',
  },
};

interface BBSRegistrationPageProps {
  eventCode: string;
}

export const BBSRegistrationPage: React.FC<BBSRegistrationPageProps> = ({ eventCode }) => {
  const event = EVENTS[eventCode] || {
    code: eventCode,
    name: `BBS Event (${eventCode})`,
    date: 'TBD',
    city: 'TBD',
    registrationsClosed: false,
    slotType: 'both' as const,
  };

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    slot: event.slotType === 'single' ? event.defaultSlot || 'Morning' : '',
    isBusinessOwner: '' as '' | 'Yes' | 'No',
    yearsInBusiness: '',
    teamSize: '',
    industry: '',
    annualTurnover: '',
    description: '',
    profileType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showOwnerFields = form.isBusinessOwner === 'Yes';
  const showProfileType = form.isBusinessOwner === 'No';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full Name is required.';
    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!form.mobile.trim()) {
      next.mobile = 'Mobile Number is required.';
    } else if (!/^\d{10}$/.test(form.mobile)) {
      next.mobile = 'Mobile number must be exactly 10 digits.';
    }
    if (event.slotType === 'both' && !form.slot) next.slot = 'Please select a slot.';
    if (!form.isBusinessOwner) next.isBusinessOwner = 'Please choose an option.';

    if (showOwnerFields) {
      if (!form.yearsInBusiness) next.yearsInBusiness = 'Required.';
      if (!form.teamSize) next.teamSize = 'Required.';
      if (!form.industry.trim()) next.industry = 'Required.';
      if (!form.description.trim()) next.description = 'Required.';
      if (form.description.length > 200) next.description = 'Maximum 200 characters allowed.';
    }

    if (showProfileType && !form.profileType) next.profileType = 'Required.';
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
  };

  if (event.registrationsClosed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Lock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Registrations Closed</h1>
          <p className="text-sm text-slate-600 mt-2">
            Registrations for this event have closed. Check our website for upcoming events.
          </p>
          <a className="text-sm font-semibold text-blue-600 mt-4 inline-block" href="https://qloneapp.com" target="_blank" rel="noreferrer">
            qloneapp.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="w-full max-w-[480px] mx-auto bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 mb-2">
            <div className="w-6 h-6 border-2 border-slate-900 rounded-full flex items-center justify-center">
              <div className="w-px h-6 bg-slate-900 absolute" />
              <div className="w-6 h-px bg-slate-900 absolute" />
            </div>
          </div>
          <p className="font-bold text-slate-900">QL One</p>
          <p className="text-sm font-semibold text-slate-800 mt-2">{event.name}</p>
          <p className="text-xs text-slate-500">{event.date} · {event.city}</p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-900">You're registered!</h2>
            <p className="text-sm text-slate-600 mt-2">
              We'll see you at {event.name} on {event.date} in {event.city}. Check your email for confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Register for {event.name}</h1>

            <div>
              <Label>Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label>Mobile Number *</Label>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              />
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>

            {event.slotType === 'both' && (
              <div>
                <Label>Slot Selection *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    { id: 'Morning', label: 'Morning Batch', sub: '9:00 AM – 1:00 PM' },
                    { id: 'Evening', label: 'Evening Batch', sub: '5:00 PM – 9:00 PM' },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, slot: slot.id }))}
                      className={cn(
                        'rounded-xl border p-3 text-left',
                        form.slot === slot.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                      )}
                    >
                      <p className="text-sm font-semibold">{slot.label}</p>
                      <p className="text-xs text-slate-500">{slot.sub}</p>
                    </button>
                  ))}
                </div>
                {errors.slot && <p className="text-xs text-red-500 mt-1">{errors.slot}</p>}
              </div>
            )}

            <div>
              <Label>Are you a Business Owner? *</Label>
              <div className="flex gap-6 mt-2">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="businessOwner"
                      checked={form.isBusinessOwner === option}
                      onChange={() => setForm((p) => ({ ...p, isBusinessOwner: option as 'Yes' | 'No' }))}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.isBusinessOwner && <p className="text-xs text-red-500 mt-1">{errors.isBusinessOwner}</p>}
            </div>

            {showOwnerFields && (
              <>
                <div>
                  <Label>Number of Years in Business *</Label>
                  <Input type="number" value={form.yearsInBusiness} onChange={(e) => setForm((p) => ({ ...p, yearsInBusiness: e.target.value }))} />
                  {errors.yearsInBusiness && <p className="text-xs text-red-500 mt-1">{errors.yearsInBusiness}</p>}
                </div>
                <div>
                  <Label>Team Size *</Label>
                  <Select value={form.teamSize} onValueChange={(v: TeamSize) => setForm((p) => ({ ...p, teamSize: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5</SelectItem>
                      <SelectItem value="6-20">6-20</SelectItem>
                      <SelectItem value="21-50">21-50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.teamSize && <p className="text-xs text-red-500 mt-1">{errors.teamSize}</p>}
                </div>
                <div>
                  <Label>Industry *</Label>
                  <Input value={form.industry} onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} />
                  {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
                </div>
                <div>
                  <Label>Annual Turnover</Label>
                  <Select value={form.annualTurnover} onValueChange={(v: Turnover) => setForm((p) => ({ ...p, annualTurnover: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select turnover" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under ₹10L">Under ₹10L</SelectItem>
                      <SelectItem value="₹10L–50L">₹10L–50L</SelectItem>
                      <SelectItem value="₹50L–1Cr">₹50L–1Cr</SelectItem>
                      <SelectItem value="₹1Cr–5Cr">₹1Cr–5Cr</SelectItem>
                      <SelectItem value="5Cr+">5Cr+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Product/Service Description *</Label>
                  <Textarea
                    maxLength={200}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">{form.description.length}/200</p>
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>
              </>
            )}

            {showProfileType && (
              <div>
                <Label>Profile Type *</Label>
                <Select value={form.profileType} onValueChange={(v: ProfileType) => setForm((p) => ({ ...p, profileType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select profile type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aspiring Business Owner">Aspiring Business Owner</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
                {errors.profileType && <p className="text-xs text-red-500 mt-1">{errors.profileType}</p>}
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold">
              Register for Free →
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

