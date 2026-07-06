
import React, { useState, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, X, Mail, MessageSquare, RotateCcw, Video, Info, Inbox } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { motion } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface CreateWebinarProps {
  onBack: () => void;
  initialWebinar?: any;
}

const MOCK_TRAINERS = [
  'Siddharth Shah',
  'Rajesh Kumar',
  'Ria Sharma',
  'Amit Patel'
];

const ALL_BATCH_OPTIONS = [
  { id: '1', title: 'BSW April Week 3 – Day 1', date: '19 Apr 2026', nonAttendees: 10 },
  { id: '2', title: 'BSW April Week 2', date: '16 Apr 2026', nonAttendees: 10 },
  { id: '3', title: 'BSW April Week 1', date: '9 Apr 2026', nonAttendees: 10 },
  { id: '4', title: 'BSW March Finale', date: '2 Apr 2026', nonAttendees: 10 },
  { id: '5', title: 'BSW March Week 3', date: '26 Mar 2026', nonAttendees: 10 },
  { id: 'feb-week-2', title: 'BSW February Week 2', date: '12 Feb 2026', nonAttendees: 10 },
  { id: 'jan-week-4', title: 'BSW January Week 4', date: '25 Jan 2026', nonAttendees: 5 },
];

export const CreateWebinar: React.FC<CreateWebinarProps> = ({ onBack, initialWebinar }) => {
  const { user } = useAuth();
  const canCreateWebinar = user?.role === 'Marketing Head';
  const [selectedSourceWebinars, setSelectedSourceWebinars] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [zoomConflictOverride, setZoomConflictOverride] = useState(false);
  
  // Scenario Simulator State
  const [scenario, setScenario] = useState<'normal' | 'some-threshold' | 'all-threshold' | 'multi-batch' | 'empty'>('normal');
  const [overrideThreshold, setOverrideThreshold] = useState(false);

  const [formData, setFormData] = useState({
    programName: initialWebinar?.title || '',
    date: initialWebinar?.id === 'edge-zoom-conflict' ? '2026-04-28' : '',
    time: initialWebinar?.id === 'edge-zoom-conflict' ? '19:00' : '19:00',
    bswCode: initialWebinar?.id === 'edge-zoom-conflict' ? 'BSW-APR-W4-C' : '',
    registrationsCloseDate: '',
    programStatus: 'Upcoming (Live)',
    trainer: initialWebinar?.instructor || '',
    paymentLink: '',
    paceBatch: initialWebinar?.conversions || 'None',
    zoomAccount: initialWebinar?.id === 'edge-zoom-conflict' ? 'zoom1' : '',
    whatsappLink: '',
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for scrolling to errors
  const programNameRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const zoomAccountRef = useRef<HTMLDivElement>(null);

  const totalPool = selectedSourceWebinars.length * 10;

  const handleSave = () => {
    if (formData.programStatus === 'Upcoming (Re-Invite)') {
      if (selectedSourceWebinars.length === 0) {
        toast.error("Please select at least one source batch for re-invite.");
        return;
      }
      setIsSuccess(true);
      toast.success("Re-invite webinar created successfully.");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!formData.programName.trim()) newErrors.programName = 'This field is required.';
    if (!formData.date) newErrors.date = 'This field is required.';
    if (!formData.time) newErrors.time = 'This field is required.';
    if (!formData.zoomAccount) newErrors.zoomAccount = 'This field is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      const refs: Record<string, React.RefObject<HTMLDivElement>> = {
        programName: programNameRef,
        date: dateRef,
        time: timeRef,
        zoomAccount: zoomAccountRef
      };
      
      refs[firstError]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    toast.success("Webinar created. Zoom link is being generated.", {
      duration: 3000
    });
    onBack();
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-screen flex flex-col">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="self-start px-0 h-auto mb-6 text-slate-600 hover:bg-transparent"
        onClick={onBack}
      >
        {'← Back to BSW (Webinars)'}
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Webinar</h1>
        <p className="text-slate-500 mt-1">Set up a new BSW webinar session.</p>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[640px] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-slate-900">Re-invite webinar created</h2>
                  <p className="text-slate-500 mt-2">
                    {totalPool} leads assigned to {formData.programName || 'New Webinar'}
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    Batch name: Re-invite — {ALL_BATCH_OPTIONS.filter(e => selectedSourceWebinars.includes(e.id)).map(e => e.title).join(', ')}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-4">HubSpot sequence triggered</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">Day 1 — Invitation</p>
                      <p className="text-[12px] text-slate-500">Email + WhatsApp invite link sent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">Day 3 — Reminder 1</p>
                      <p className="text-[12px] text-slate-500">Follow-up via SMS/WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                    <div className="h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">Day 5 — Final reminder</p>
                      <p className="text-[12px] text-slate-500">Last call for registration</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 font-bold rounded-xl"
                  onClick={onBack}
                >
                  View re-invite webinar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 border-slate-200 text-slate-600 font-bold rounded-xl"
                  onClick={() => {
                    setIsSuccess(false);
                    setSelectedSourceWebinars([]);
                  }}
                >
                  Create another
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6">PROGRAM DETAILS</h3>
                
                <div className="space-y-6">
                  {/* 1. Program Name */}
                  <div className="space-y-2" ref={programNameRef}>
                    <Label htmlFor="programName" className="text-sm font-bold">Program Name *</Label>
                    <Input 
                      id="programName"
                      placeholder="e.g. BSW May Week 2" 
                      className={`h-11 border-slate-200 focus-visible:ring-primary/20 ${errors.programName ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                      value={formData.programName}
                      onChange={(e) => {
                        setFormData({ ...formData, programName: e.target.value });
                        if (errors.programName) setErrors({ ...errors, programName: '' });
                      }}
                    />
                    {errors.programName && <p className="text-xs text-red-500 mt-1">{errors.programName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 2. Date */}
                    <div className="space-y-2" ref={dateRef}>
                      <Label htmlFor="date" className="text-sm font-bold">Webinar Date *</Label>
                      <Input 
                        id="date"
                        type="date"
                        className={`h-11 border-slate-200 focus-visible:ring-primary/20 ${errors.date ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: '' });
                        }}
                      />
                      {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                    </div>

                    {/* 3. Time */}
                    <div className="space-y-2" ref={timeRef}>
                      <Label htmlFor="time" className="text-sm font-bold">Webinar Time *</Label>
                      <Input 
                        id="time"
                        type="time"
                        className={`h-11 border-slate-200 focus-visible:ring-primary/20 ${errors.time ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                        value={formData.time}
                        onChange={(e) => {
                          setFormData({ ...formData, time: e.target.value });
                          if (errors.time) setErrors({ ...errors, time: '' });
                        }}
                      />
                      {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                    </div>
                  </div>

                  {/* 4. BSW Batch Code */}
                  <div className="space-y-2">
                    <Label htmlFor="bswCode" className="text-sm font-bold">BSW Batch Code</Label>
                    <Input 
                      id="bswCode"
                      placeholder="e.g. BSW-MAY-W2" 
                      className="h-11 border-slate-200 focus-visible:ring-primary/20"
                      value={formData.bswCode}
                      onChange={(e) => setFormData({ ...formData, bswCode: e.target.value })}
                    />
                  </div>

                  {/* 5. Registration Close Date */}
                  <div className="space-y-2">
                    <Label htmlFor="registrationsCloseDate" className="text-sm font-bold">Registrations Close On</Label>
                    <Input 
                      id="registrationsCloseDate"
                      type="date"
                      className="h-11 border-slate-200 focus-visible:ring-primary/20"
                      value={formData.registrationsCloseDate}
                      onChange={(e) => setFormData({ ...formData, registrationsCloseDate: e.target.value })}
                    />
                  </div>

                  {/* 6. Program Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Program Status</Label>
                    <Select 
                      value={formData.programStatus}
                      onValueChange={(value) => {
                        setFormData({ ...formData, programStatus: value });
                      }}
                    >
                      <SelectTrigger className="h-11 border-slate-200 text-slate-900 font-medium">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Upcoming (Live)">Upcoming (Live)</SelectItem>
                        <SelectItem value="Upcoming (Recorded)">Upcoming (Recorded)</SelectItem>
                        <SelectItem value="Upcoming (Re-Invite)">Upcoming (Re-Invite)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 7. Trainer */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Trainer</Label>
                    <Select value={formData.trainer} onValueChange={(val) => setFormData({ ...formData, trainer: val })}>
                      <SelectTrigger className="h-11 border-slate-200 text-slate-900 font-medium">
                        <SelectValue placeholder="Select trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_TRAINERS.map(trainer => (
                          <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 8. Payment Link */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentLink" className="text-sm font-bold">Payment Link</Label>
                    <Input 
                      id="paymentLink"
                      placeholder="Paste Stripe/Payment link" 
                      className="h-11 border-slate-200 focus-visible:ring-primary/20"
                      value={formData.paymentLink}
                      onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                    />
                  </div>

                  {/* 9. PACE Program Linked */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">PACE Program Linked</Label>
                    <Select value={formData.paceBatch} onValueChange={(val) => setFormData({ ...formData, paceBatch: val })}>
                      <SelectTrigger className="h-11 border-slate-200 text-slate-900 font-medium">
                        <SelectValue placeholder="Select PACE batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PACE Batch 7">PACE Batch 7</SelectItem>
                        <SelectItem value="PACE Batch 8">PACE Batch 8</SelectItem>
                        <SelectItem value="PACE Batch 9">PACE Batch 9</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 10. Zoom Account */}
                  <div className="space-y-2" ref={zoomAccountRef}>
                    <Label className="text-sm font-bold">Zoom Account *</Label>
                    <Select 
                      value={formData.zoomAccount}
                      onValueChange={(value) => {
                        setFormData({ ...formData, zoomAccount: value });
                        if (value !== 'zoom1') {
                          setZoomConflictOverride(false);
                        }
                        if (errors.zoomAccount) setErrors({ ...errors, zoomAccount: '' });
                      }}
                    >
                      <SelectTrigger className={`h-11 border-slate-200 text-slate-900 font-medium ${errors.zoomAccount ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}>
                        <SelectValue placeholder="Select Zoom account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom1">zoom1@quantumleap.co.in</SelectItem>
                        <SelectItem value="zoom2">zoom2@quantumleap.co.in</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.zoomAccount && <p className="text-xs text-red-500 mt-1">{errors.zoomAccount}</p>}
                    
                    {initialWebinar?.id === 'edge-zoom-conflict' && formData.zoomAccount === 'zoom1' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 leading-normal">
                            This account already has a scheduled meeting at 7:00 PM on 28 Apr 2026. 
                            Scheduling anyway may cause conflict.
                          </p>
                        </div>
                        {canCreateWebinar && (
                          <div className="pl-8 flex items-center justify-between gap-3">
                            <p className={cn(
                              "text-[11px] font-bold",
                              zoomConflictOverride ? "text-emerald-700" : "text-amber-700"
                            )}>
                              {zoomConflictOverride ? 'Override enabled for this conflict.' : 'Review and confirm if you want to proceed.'}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setZoomConflictOverride(prev => !prev)}
                              className={cn(
                                "h-9 text-[10px] font-bold uppercase tracking-widest",
                                zoomConflictOverride
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  : "border-amber-200 text-amber-700 hover:bg-amber-100"
                              )}
                            >
                              {zoomConflictOverride ? 'Undo override' : 'Override'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 11. WhatsApp Group Link */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsappLink" className="text-sm font-bold">WhatsApp Group Link</Label>
                    <Input 
                      id="whatsappLink"
                      placeholder="Paste WhatsApp group invite link" 
                      className="h-11 border-slate-200 focus-visible:ring-primary/20"
                      value={formData.whatsappLink}
                      onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                    />
                  </div>

                  {/* RE-INVITE CONFIGURATION SECTION */}
                  {formData.programStatus === 'Upcoming (Re-Invite)' && (
                    <div className="pt-6 border-t border-slate-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="border-l-2 border-[#8B5CF6] pl-4 py-1">
                        <h4 className="text-sm font-medium text-purple-700">↩ Re-invite Configuration</h4>
                        <p className="text-[12px] text-slate-500 mt-1">
                          Select the past BSW events you want to re-invite from. 
                          All people who registered but did not attend those events 
                          will be automatically enrolled in this new webinar.
                        </p>
                      </div>

                      {/* SCENARIO SIMULATOR DROPDOWN */}
                      <div className="space-y-2">
                        <Select 
                          value={scenario} 
                          onValueChange={(val: any) => {
                            setScenario(val);
                            setOverrideThreshold(false);
                            // Set defaults for scenarios
                            if (val === 'normal') setSelectedSourceWebinars(['1']);
                            else if (val === 'some-threshold') setSelectedSourceWebinars(['4']);
                            else if (val === 'all-threshold') setSelectedSourceWebinars(['feb-week-2']);
                            else if (val === 'multi-batch') setSelectedSourceWebinars(['1', '4']);
                            else if (val === 'empty') setSelectedSourceWebinars(['jan-week-4']);
                          }}
                        >
                          <SelectTrigger className="h-11 border-slate-200 text-slate-900 font-medium bg-amber-50/30">
                            <SelectValue placeholder="Scenario Simulator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <span>Normal Pool</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="some-threshold">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span>Some at Threshold</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="all-threshold">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span>All at Threshold</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="multi-batch">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span>Multi-batch + Dedup</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="empty">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                                <span>Empty Pool</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider pl-1">
                          Simulation mode — for testing only
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-bold">Select source batches</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full h-auto min-h-11 justify-between border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 flex transition-all rounded-xl"
                            >
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {selectedSourceWebinars.length === 0 ? (
                                  <span className="text-slate-400 font-medium">Choose past webinars...</span>
                                ) : (
                                  selectedSourceWebinars.map(id => {
                                    const batch = ALL_BATCH_OPTIONS.find(b => b.id === id);
                                    return (
                                      <Badge key={id} variant="secondary" className="bg-purple-100 text-purple-700 border-none px-2 py-0 h-5 font-bold text-[10px] flex items-center gap-1">
                                        {batch?.title.split(' – ')[0] || id}
                                        <X className="h-2.5 w-2.5 cursor-pointer" onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSourceWebinars(prev => prev.filter(p => p !== id));
                                        }}/>
                                      </Badge>
                                    )
                                  })
                                )}
                              </div>
                              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[400px] overflow-y-auto p-2 rounded-xl shadow-xl border-slate-200 bg-white z-[100]" align="start">
                            <div className="p-2 border-b border-slate-100 mb-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select multiple batches</p>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {ALL_BATCH_OPTIONS.map((batch) => (
                                <div 
                                  key={batch.id}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                    selectedSourceWebinars.includes(batch.id) ? "bg-purple-50 border-purple-200" : "hover:bg-slate-50 border-slate-200"
                                  )}
                                  onClick={(e) => {
                                    // Prevent closing the menu on item click to allow multiple selection
                                    e.preventDefault();
                                    setSelectedSourceWebinars(prev => 
                                      prev.includes(batch.id) ? prev.filter(id => id !== batch.id) : [...prev, batch.id]
                                    );
                                  }}
                                >
                                  <Checkbox 
                                    checked={selectedSourceWebinars.includes(batch.id)} 
                                    onCheckedChange={() => {}}
                                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 pointer-events-none"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-slate-900 leading-tight">{batch.title}</span>
                                    <span className="text-[11px] text-slate-400 font-medium">{batch.date}</span>
                                  </div>
                                  <div className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                                    <RotateCcw className="h-2.5 w-2.5 text-slate-400" />
                                    {batch.nonAttendees} non-attendees
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {scenario === 'empty' ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 animate-in zoom-in-95 duration-300">
                          <div className="text-center py-12">
                            <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">No eligible leads found</h3>
                            <p className="text-xs text-gray-400 mb-1 max-w-[280px] mx-auto">
                              All non-attendees from this batch have opted out or are already Closed Won.
                            </p>
                            <p className="text-xs text-gray-400 mb-4 max-w-[280px] mx-auto font-medium italic">
                              Try selecting a different source batch.
                            </p>
                          </div>
                        </div>
                      ) : selectedSourceWebinars.length > 0 && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-300">
                          <Card className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-none">
                            <h5 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <RotateCcw className="h-3.5 w-3.5 text-purple-600" />
                              Re-invite pool summary
                            </h5>
                            <div className="space-y-3">
                              {scenario === 'multi-batch' ? (
                                <>
                                  <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500">From BSW April Week 3:</span>
                                    <span className="font-bold text-slate-900">10</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500">From BSW March Finale:</span>
                                    <span className="font-bold text-slate-900">10</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[12px] bg-blue-50/30 p-1 rounded">
                                    <span className="text-slate-500">Combined total:</span>
                                    <span className="font-bold text-slate-900">20</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[12px]">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500">Duplicates removed:</span>
                                      <Info className="h-3 w-3 text-blue-500 cursor-help" />
                                    </div>
                                    <span className="font-bold text-blue-600">3</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500">Excluded (limit):</span>
                                    <span className="font-bold text-amber-600">2</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500">Total non-attendees found:</span>
                                    <span className="font-bold text-slate-900">
                                      {scenario === 'all-threshold' ? 10 : 30}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500">Duplicates removed:</span>
                                    <span className="font-bold text-slate-900">0</span>
                                  </div>
                                  {scenario === 'some-threshold' && (
                                    <div className="flex justify-between items-center text-[12px]">
                                      <span className="text-slate-500">Excluded (limit reached):</span>
                                      <span className="font-bold text-slate-900">3</span>
                                    </div>
                                  )}
                                  {scenario === 'all-threshold' && (
                                    <div className="flex justify-between items-center text-[12px]">
                                      <span className="text-slate-500">Excluded (limit reached):</span>
                                      <span className="font-bold text-red-600">10</span>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              <Separator className="bg-slate-200 my-1" />
                              
                              <div className="flex justify-between items-center">
                                <span className="text-[13px] font-bold text-slate-900">Final pool:</span>
                                <span className={cn(
                                  "text-[15px] font-bold",
                                  scenario === 'all-threshold' && !overrideThreshold ? 'text-red-600' : 'text-green-600'
                                )}>
                                  {scenario === 'normal' && '30 leads'}
                                  {scenario === 'some-threshold' && (overrideThreshold ? '30 leads' : '27 leads')}
                                  {scenario === 'all-threshold' && (overrideThreshold ? '10 leads' : '0 leads')}
                                  {scenario === 'multi-batch' && (overrideThreshold ? '17 leads' : '15 leads')}
                                </span>
                              </div>
                            </div>
                          </Card>

                          {scenario === 'multi-batch' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              <p className="text-[12px] text-blue-700 font-medium">
                                3 leads appeared in both batches and are counted once.
                              </p>
                            </div>
                          )}

                          {scenario === 'some-threshold' && (
                            <div className={cn(
                              "border rounded-xl p-4 space-y-3 transition-colors",
                              overrideThreshold ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"
                            )}>
                              <div className="flex items-start gap-3">
                                {overrideThreshold ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                )}
                                <div className="space-y-1">
                                  <p className={cn(
                                    "text-[13px] font-bold",
                                    overrideThreshold ? "text-green-800" : "text-amber-800"
                                  )}>
                                    {overrideThreshold 
                                      ? "3 over-limit leads added. They will be flagged on their records."
                                      : "3 leads have been re-invited 3 times and are excluded from this pool."
                                    }
                                  </p>
                                  <Button 
                                    variant="link" 
                                    className={cn(
                                      "h-auto p-0 font-bold text-[12px] underline underline-offset-4 decoration-2",
                                      overrideThreshold ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"
                                    )}
                                    onClick={() => setOverrideThreshold(!overrideThreshold)}
                                  >
                                    {overrideThreshold ? "Undo — remove them" : "+ Include them anyway"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {scenario === 'all-threshold' && (
                            <div className={cn(
                              "border rounded-xl p-4 space-y-3 transition-colors",
                              overrideThreshold ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
                            )}>
                              <div className="flex items-start gap-3">
                                {overrideThreshold ? (
                                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                )}
                                <div className="space-y-1">
                                  <p className={cn(
                                    "text-[13px] font-bold",
                                    overrideThreshold ? "text-amber-800" : "text-red-800"
                                  )}>
                                    {overrideThreshold 
                                      ? "10 over-limit leads added. Use carefully."
                                      : "All non-attendees from this batch have reached the re-invite limit."
                                    }
                                  </p>
                                  <Button 
                                    variant="link" 
                                    className={cn(
                                      "h-auto p-0 font-bold text-[12px] underline underline-offset-4 decoration-2",
                                      overrideThreshold ? "text-amber-600 hover:text-amber-700" : "text-red-600 hover:text-red-700"
                                    )}
                                    onClick={() => setOverrideThreshold(!overrideThreshold)}
                                  >
                                    {overrideThreshold ? "Undo override" : "+ Add all of them anyway (override)"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {scenario === 'multi-batch' && (
                            <div className={cn(
                              "border rounded-xl p-4 space-y-3 transition-colors",
                              overrideThreshold ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"
                            )}>
                              <div className="flex items-start gap-3">
                                {overrideThreshold ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                )}
                                <div className="space-y-1">
                                  <p className={cn(
                                    "text-[13px] font-bold",
                                    overrideThreshold ? "text-green-800" : "text-amber-800"
                                  )}>
                                    {overrideThreshold 
                                      ? "2 excluded leads added back to the pool."
                                      : "2 leads excluded — re-invite limit reached."
                                    }
                                  </p>
                                  <Button 
                                    variant="link" 
                                    className={cn(
                                      "h-auto p-0 font-bold text-[12px] underline underline-offset-4 decoration-2",
                                      overrideThreshold ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"
                                    )}
                                    onClick={() => setOverrideThreshold(!overrideThreshold)}
                                  >
                                    {overrideThreshold ? "Undo" : "+ Include them anyway"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isSuccess && scenario !== 'empty' && (
        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="h-11 px-8 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl min-w-[140px]"
            onClick={onBack}
          >
            Cancel
          </Button>
          {formData.programStatus === 'Upcoming (Re-Invite)' && scenario === 'all-threshold' && !overrideThreshold ? (
            <div className="relative group min-w-[200px]">
              <Button 
                disabled
                className="w-full h-11 px-8 font-bold bg-slate-200 text-slate-400 cursor-not-allowed rounded-xl"
              >
                Create re-invite batch (0 leads)
              </Button>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Add leads to pool before creating a batch
              </div>
            </div>
          ) : (
            <Button 
              className="h-11 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl min-w-[200px]"
              onClick={handleSave}
            >
              {formData.programStatus === 'Upcoming (Re-Invite)' 
                ? `Create re-invite batch (${
                    scenario === 'normal' ? '30 leads' :
                    scenario === 'some-threshold' ? (overrideThreshold ? '30 leads' : '27 leads') :
                    scenario === 'all-threshold' ? (overrideThreshold ? '10 leads' : '0 leads') :
                    scenario === 'multi-batch' ? (overrideThreshold ? '17 leads' : '15 leads') : '0 leads'
                  })`
                : 'Create Webinar'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
