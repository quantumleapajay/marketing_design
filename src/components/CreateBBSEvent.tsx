import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export interface NewBBSEventPayload {
  id: string;
  name: string;
  code: string;
  date: string;
  slot: 'Morning' | 'Evening';
  city: string;
  venue: string;
  trainer: string;
  targetCapacity: number;
  extendedCapacity?: number;
  registrationsCloseDate: string;
  status?: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  registrations?: number;
  attended?: number;
  rsvpConfirmed?: number;
  edgeCaseType?: 'registration_full' | 'attendance_sync_failed' | 'cancelled_after_registrations' | 'reg_closes_soon';
  regClosesInDays?: number;
}

interface TrackedLink {
  id: string;
  source: string;
  medium: string;
  term: string;
}

interface CreateBBSEventProps {
  onBack: () => void;
  onCreated: (event: NewBBSEventPayload) => void;
}

const TRAINER_OPTIONS = ['Siddharth Shah', 'Amit Patel', 'Rajesh Kumar'];
const ACTIVE_UTM_SOURCES = ['Google', 'Facebook', 'Organic', 'Instagram'];
const ACTIVE_UTM_MEDIUMS = ['Paid', 'Social', 'Email', 'Organic'];
const ACTIVE_UTM_TERMS = ['BBS', 'Mumbai', 'Evening', 'Awareness'];

export const CreateBBSEvent: React.FC<CreateBBSEventProps> = ({ onBack, onCreated }) => {
  const [formData, setFormData] = useState({
    programName: '',
    code: '',
    date: '',
    slot: '' as '' | 'Morning' | 'Evening',
    city: '',
    venue: '',
    trainer: '',
    targetCapacity: '',
    extendedCapacity: '',
    registrationsCloseDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTrackedLinksOpen, setIsTrackedLinksOpen] = useState(false);
  const [trackedLinks, setTrackedLinks] = useState<TrackedLink[]>([]);

  const isPastDate = useMemo(() => {
    if (!formData.date) return false;
    const picked = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return picked < today;
  }, [formData.date]);

  const addTrackedLink = () => {
    setTrackedLinks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        source: '',
        medium: '',
        term: '',
      },
    ]);
  };

  const updateTrackedLink = (id: string, key: 'source' | 'medium' | 'term', value: string) => {
    setTrackedLinks((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const removeTrackedLink = (id: string) => {
    setTrackedLinks((prev) => prev.filter((row) => row.id !== id));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.programName.trim()) nextErrors.programName = 'Program Name is required.';
    if (!formData.code.trim()) nextErrors.code = 'BBS Batch Code is required.';
    if (!formData.date) nextErrors.date = 'Date is required.';
    if (!formData.slot) nextErrors.slot = 'Slot is required.';
    if (!formData.city.trim()) nextErrors.city = 'City is required.';
    if (!formData.venue.trim()) nextErrors.venue = 'Venue is required.';
    if (!formData.trainer) nextErrors.trainer = 'Trainer is required.';
    if (!formData.targetCapacity) {
      nextErrors.targetCapacity = 'Target Capacity is required.';
    } else if (Number(formData.targetCapacity) < 1) {
      nextErrors.targetCapacity = 'Target Capacity must be at least 1.';
    }
    if (!formData.registrationsCloseDate) nextErrors.registrationsCloseDate = 'Registrations Close Date is required.';
    return nextErrors;
  };

  const handleCreate = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: NewBBSEventPayload = {
      id: formData.code || `BBS-${Date.now()}`,
      name: formData.programName,
      code: formData.code,
      date: formData.date,
      slot: formData.slot,
      city: formData.city,
      venue: formData.venue,
      trainer: formData.trainer,
      targetCapacity: Number(formData.targetCapacity),
      extendedCapacity: Number(formData.extendedCapacity) || 0,
      registrationsCloseDate: formData.registrationsCloseDate,
      status: 'Upcoming',
      registrations: 0,
      attended: 0,
      rsvpConfirmed: 0,
    };

    toast.success('BBS event created.');
    onCreated(payload);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <Button variant="ghost" className="px-0 h-auto mb-6 text-slate-600 hover:bg-transparent" onClick={onBack}>
        {'← Back to BBS Events'}
      </Button>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Create BBS Event</h1>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-8">
        <section className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Details</h3>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Program Name *</Label>
            <Input
              placeholder="e.g. BBS Mumbai — May 2026"
              value={formData.programName}
              onChange={(e) => setFormData((prev) => ({ ...prev, programName: e.target.value }))}
              className={cn(errors.programName && 'border-red-500')}
            />
            {errors.programName && <p className="text-xs text-red-500 font-medium">{errors.programName}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">BBS Batch Code *</Label>
            <Input
              placeholder="e.g. BBS-MUM-MAY26"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              className={cn(errors.code && 'border-red-500')}
            />
            {errors.code && <p className="text-xs text-red-500 font-medium">{errors.code}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Date *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className={cn(errors.date && 'border-red-500')}
            />
            {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date}</p>}
            {isPastDate && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-xs font-medium text-amber-800">This date is in the past. Are you sure?</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Slot *</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Morning Batch', subtext: '9:00 AM - 1:00 PM', value: 'Morning' as const },
                { label: 'Evening Batch', subtext: '5:00 PM - 9:00 PM', value: 'Evening' as const },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, slot: option.value }))}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    formData.slot === option.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <p className="text-sm font-bold text-slate-900">{option.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{option.subtext}</p>
                </button>
              ))}
            </div>
            {errors.slot && <p className="text-xs text-red-500 font-medium">{errors.slot}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">City *</Label>
            <Input
              placeholder="e.g. Mumbai"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              className={cn(errors.city && 'border-red-500')}
            />
            {errors.city && <p className="text-xs text-red-500 font-medium">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Venue *</Label>
            <Input
              placeholder="e.g. ITC Maratha, Andheri"
              value={formData.venue}
              onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
              className={cn(errors.venue && 'border-red-500')}
            />
            {errors.venue && <p className="text-xs text-red-500 font-medium">{errors.venue}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Trainer *</Label>
            <Select value={formData.trainer} onValueChange={(value) => setFormData((prev) => ({ ...prev, trainer: value }))}>
              <SelectTrigger className={cn(errors.trainer && 'border-red-500')}>
                <SelectValue placeholder="Select trainer" />
              </SelectTrigger>
              <SelectContent>
                {TRAINER_OPTIONS.map((trainer) => (
                  <SelectItem key={trainer} value={trainer}>
                    {trainer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trainer && <p className="text-xs text-red-500 font-medium">{errors.trainer}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Target Capacity *</Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 200"
              value={formData.targetCapacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetCapacity: e.target.value }))}
              className={cn(errors.targetCapacity && 'border-red-500')}
            />
            <p className="text-xs text-slate-500">Registrations will close automatically when this number is reached.</p>
            <p className="text-xs text-slate-500">This Target Capacity is also used as the "vs. target" baseline in real-time lead flow and projection reports.</p>
            {errors.targetCapacity && <p className="text-xs text-red-500 font-medium">{errors.targetCapacity}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">
              Extended Capacity
              <span className="ml-2 text-[11px] font-medium text-slate-400 normal-case">
                Optional
              </span>
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 220"
              value={formData.extendedCapacity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, extendedCapacity: e.target.value }))
              }
            />
            <p className="text-xs text-slate-500">
              Buffer seats beyond target. Extended registrations are accepted 
              but flagged for manual review.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Registrations Close Date *</Label>
            <Input
              type="date"
              value={formData.registrationsCloseDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, registrationsCloseDate: e.target.value }))}
              className={cn(errors.registrationsCloseDate && 'border-red-500')}
            />
            <p className="text-xs text-slate-500">
              After this date, registration form shows Registrations Closed.
            </p>
            {errors.registrationsCloseDate && <p className="text-xs text-red-500 font-medium">{errors.registrationsCloseDate}</p>}
          </div>
        </section>

        <section className="border-t border-slate-100 pt-6 space-y-4">
          <button
            type="button"
            onClick={() => setIsTrackedLinksOpen((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-bold text-slate-700"
          >
            {isTrackedLinksOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Add UTM-tracked links
          </button>

          {isTrackedLinksOpen && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <p className="text-xs font-medium text-blue-800">
                  BBS uses a free registration form. Create UTM-tracked links to attribute registrations to specific channels.
                </p>
              </div>

              <Button type="button" variant="outline" className="h-9 text-xs font-bold" onClick={addTrackedLink}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add tracked link
              </Button>

              {trackedLinks.map((row) => (
                <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                  <Select value={row.source} onValueChange={(value) => updateTrackedLink(row.id, 'source', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="UTM Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_UTM_SOURCES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={row.medium} onValueChange={(value) => updateTrackedLink(row.id, 'medium', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="UTM Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_UTM_MEDIUMS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={row.term} onValueChange={(value) => updateTrackedLink(row.id, 'term', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="UTM Term" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_UTM_TERMS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-red-500"
                    onClick={() => removeTrackedLink(row.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3">
          <Button variant="outline" className="h-10 px-6" onClick={onBack}>
            Cancel
          </Button>
          <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleCreate}>
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
};
