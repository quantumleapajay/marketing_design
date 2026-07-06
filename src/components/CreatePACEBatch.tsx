import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock as ClockIcon, 
  CheckCircle2, 
  ChevronRight,
  Info,
  MapPin,
  Globe,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CreatePACEBatchProps {
  onBack: () => void;
}

export const CreatePACEBatch: React.FC<CreatePACEBatchProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Offline' as 'Online' | 'Offline',
    date: '',
    endDate: '',
    time: '',
    venueName: '',
    city: '',
    address: '',
    capacity: '',
    extendedCapacity: '',
    paymentLink: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = () => {
    if (!formData.name || !formData.date || !formData.capacity) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (formData.type === 'Offline' && (!formData.endDate || !formData.venueName || !formData.city || !formData.address)) {
      toast.error('For Offline batches, End Date, Venue Name, City, and Address are mandatory.');
      return;
    }
    if (formData.extendedCapacity && Number(formData.extendedCapacity) < Number(formData.capacity)) {
      toast.error('Extended Capacity must be greater than or equal to Target Capacity.');
      return;
    }
    toast.success('Batch created.');
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Batch created.</h2>
          <p className="text-slate-500 mb-10">
            The new batch <span className="font-bold text-slate-900">{formData.name}</span> has been added to the system.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button 
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold border-slate-200 text-slate-600 bg-white"
            >
              Create another
            </Button>
            <Button 
              onClick={onBack}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg"
            >
              View all batches
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-screen">
      <Button variant="ghost" className="px-0 h-auto mb-6 text-slate-600 hover:bg-transparent" onClick={onBack}>
        {'← Back to PACE Batches'}
      </Button>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create PACE Batch</h1>
          <p className="text-slate-500 mt-1">Add a new session/batch for the PACE program.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-10">
            {/* Batch Name */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Batch Name <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="e.g. PACE Batch 9"
                className="h-12 border-slate-200 text-lg font-medium focus:ring-blue-500/20"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Type Selection Cards */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Batch Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, type: 'Offline'})}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 group",
                    formData.type === 'Offline' 
                      ? "bg-blue-50 border-blue-600 shadow-lg shadow-blue-100/50" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-1",
                    formData.type === 'Offline' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  )}>
                    <MapPin className="h-6 w-6" />
                  </div>
                  <span className={cn("text-base font-bold", formData.type === 'Offline' ? "text-blue-900" : "text-slate-600")}>Offline</span>
                  <span className="text-xs text-slate-400">In-person venue program</span>
                </button>

                <button 
                  onClick={() => setFormData({...formData, type: 'Online', extendedCapacity: ''})}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 group",
                    formData.type === 'Online' 
                      ? "bg-blue-50 border-blue-600 shadow-lg shadow-blue-100/50" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-1",
                    formData.type === 'Online' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  )}>
                    <Globe className="h-6 w-6" />
                  </div>
                  <span className={cn("text-base font-bold", formData.type === 'Online' ? "text-blue-900" : "text-slate-600")}>Online</span>
                  <span className="text-xs text-slate-400">Virtual program (Zoom)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
              {/* Date & Time */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Start Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="date"
                    className="h-11 pl-10 border-slate-200"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              {formData.type === 'Offline' && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">End Date <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="date"
                      className="h-11 pl-10 border-slate-200"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Time <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="time"
                    className="h-11 pl-10 border-slate-200"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              {/* Target Capacity */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Target Capacity <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  placeholder="e.g. 60"
                  className="h-11 border-slate-200"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
                <p className="text-[11px] text-slate-400 leading-tight">
                  Soft limit. Alert triggers when reached and registration stays open.
                </p>
              </div>

              {formData.type === 'Offline' && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Extended Capacity
                    <span className="ml-2 text-[11px] font-normal text-slate-400 normal-case">
                      Optional
                    </span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 65"
                    className="h-11 border-slate-200"
                    value={formData.extendedCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, extendedCapacity: e.target.value })
                    }
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Buffer seats beyond target capacity for walk-ins or 
                    late registrations. Flagged separately from confirmed enrollments.
                  </p>
                </div>
              )}

              {/* Payment Link Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Payment Link</Label>
                <Select value={formData.paymentLink} onValueChange={(val) => setFormData({...formData, paymentLink: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Select active link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">PACE BSW June (₹15,000)</SelectItem>
                    <SelectItem value="L2">PACE BBS Apr (₹15,000)</SelectItem>
                    <SelectItem value="L3">PACE Direct (₹18,000)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">Links created in PACE Payment Links section appear here.</p>
              </div>
              {formData.type === 'Offline' && (
                <>
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Venue Name <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      placeholder="e.g. ITC Maratha"
                      className="h-11 border-slate-200"
                      value={formData.venueName}
                      onChange={(e) => setFormData({...formData, venueName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-gray-500 mb-1.5 block">City <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      placeholder="e.g. Mumbai"
                      className="h-11 border-slate-200"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3 col-span-2">
                    <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Address <span className="text-red-500">*</span></Label>
                    <textarea
                      placeholder="Enter full venue address"
                      className="w-full min-h-[84px] rounded-md border border-slate-200 px-3 py-2 text-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-12 rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              Create batch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
