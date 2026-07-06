import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronRight, 
  Lock,
  Globe,
  Tag,
  Link as LinkIcon,
  Layout,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface CreatePACEPaymentLinkProps {
  onBack: () => void;
  initialData?: any;
}

export const CreatePACEPaymentLink: React.FC<CreatePACEPaymentLinkProps> = ({ onBack, initialData }) => {
  const isEdit = !!initialData;
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState({ direct: '', short: '' });
  const [copiedType, setCopiedType] = useState<'direct' | 'short' | null>(null);

  const [formData, setFormData] = useState({
    linkName: initialData?.name || '',
    programName: initialData?.programName || initialData?.program || '',
    selectedPace: initialData?.selectedPace || [],
    gatewayType: initialData?.gatewayType || '',
    trainerName: initialData?.trainerName || '',
    amount: initialData?.amount?.replace(/[^\d]/g, '') || '',
    country: initialData?.country || 'India',
    countryCode: initialData?.countryCode || '+91',
    currency: initialData?.currencySymbol || '₹',
    showBatch: initialData?.showBatch === 'Yes' ? true : false,
    
    leadTracking: initialData?.leadTracking || 'Organic',
    department: initialData?.department || 'Marketing',
    utmSource: initialData?.utmSource || '',
    utmTerm: initialData?.utmTerm || '',
    utmMedium: initialData?.utmMedium || '',
    programMode: initialData?.programMode || '',
    adsType: initialData?.adsType || 'No Ads',
    thankYouPageLink: initialData?.thankYouPageLink || '',
  });

  const handleSave = () => {
    if (!formData.linkName || !formData.programName) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Simulate generation
    const uid = Math.random().toString(36).substring(2, 8).toUpperCase();
    const direct = `https://payment.qloneapp.com/razorpay?${uid}`;
    const short = `qlone.co/${uid}`;

    setGeneratedLinks({ direct, short });
    setIsSuccess(true);
    toast.success(isEdit ? 'Payment link updated.' : 'Payment link created.');
  };

  const handleCopy = (type: 'direct' | 'short', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type === 'direct' ? 'Direct' : 'Short'} link copied.`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const paceBatches = ['PACE Batch 7', 'PACE Batch 8', 'PACE Batch 9'];
  const gateways = ['Razorpay', 'Exly', 'Instamojo', 'Free Webinar'];
  const departments = ['Marketing', 'Sales', 'CX', 'Community', 'Accounts', 'BIC', 'Tech'];
  const adsTypes = ['Meta Ads', 'Google Ads', 'No Ads'];
  const utmSources = ['Google', 'Facebook', 'Instagram', 'Email', 'Organic', 'Direct'];
  const utmTerms = ['BSW', 'BBS', 'PACE', 'Webinar'];
  const utmMediums = ['Paid', 'Social', 'Organic', 'CPC'];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 border border-slate-100 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment link created.</h2>
          <p className="text-slate-500 mb-8">Successfully generated and ready to share with clients.</p>

          <div className="w-full space-y-4 mb-10">
            <div className="text-left">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Direct Link</Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 font-medium truncate">
                  {generatedLinks.direct}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCopy('direct', generatedLinks.direct)}
                  className="h-12 w-12 border border-slate-200 rounded-xl bg-white hover:bg-slate-50"
                >
                  {copiedType === 'direct' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-slate-400" />}
                </Button>
              </div>
            </div>
            <div className="text-left">
              <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Short Link</Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 font-medium truncate">
                  {generatedLinks.short}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCopy('short', generatedLinks.short)}
                  className="h-12 w-12 border border-slate-200 rounded-xl bg-white hover:bg-slate-50"
                >
                  {copiedType === 'short' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-slate-400" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <Button 
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold border-slate-200 text-slate-600"
            >
              Create another
            </Button>
            <Button 
              onClick={onBack}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              View all links
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="font-bold text-slate-600 hover:bg-slate-100 px-2"
          >
            ← Back to Payment Links
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit PACE Payment Link' : 'Create PACE Payment Link'}</h1>
            <p className="text-xs text-slate-500 font-medium">Under PROGRAMS → PACE → Payment Links</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="font-bold text-slate-500 hover:bg-slate-100 px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-10 shadow-lg shadow-blue-200"
          >
            {isEdit ? 'Update Link' : 'Save & Generate Link'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 px-6">
        {isEdit && (
          <div className="mb-8 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-slate-400 mt-0.5" />
            <p className="text-[13px] text-slate-600">
              <span className="font-bold text-slate-900">Some fields are locked</span> after link creation to preserve payment accuracy and tracking continuity.
            </p>
          </div>
        )}

        <div className="space-y-12">
          {/* SECTION: LINK DETAILS */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">Link Details</h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link Name <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="e.g. PACE Batch 7 Early Bird"
                  className="h-11 border-slate-200 focus:ring-blue-500/20"
                  value={formData.linkName}
                  onChange={(e) => setFormData({...formData, linkName: e.target.value})}
                />
              </div>

              <div className="space-y-2 relative">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. PACE Masterclass"
                    disabled={isEdit}
                    className={cn("h-11 border-slate-200", isEdit && "bg-slate-50 text-slate-400 pr-10 cursor-not-allowed")}
                    value={formData.programName}
                    onChange={(e) => setFormData({...formData, programName: e.target.value})}
                  />
                  {isEdit && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select PACE (Multiselect)</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {paceBatches.map(batch => (
                    <div 
                      key={batch}
                      onClick={() => {
                        const current = formData.selectedPace;
                        const next = current.includes(batch) 
                          ? current.filter(b => b !== batch)
                          : [...current, batch];
                        setFormData({...formData, selectedPace: next});
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all",
                        formData.selectedPace.includes(batch)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {batch}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Type</Label>
                <div className="relative">
                  <Select 
                    disabled={isEdit}
                    value={formData.gatewayType} 
                    onValueChange={(val) => setFormData({...formData, gatewayType: val})}
                  >
                    <SelectTrigger className={cn("h-11 border-slate-200", isEdit && "bg-slate-50 text-slate-400 cursor-not-allowed")}>
                      <SelectValue placeholder="Select Gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      {gateways.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {isEdit && <Lock className="absolute -right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer Name</Label>
                <div className="relative">
                  <Select 
                    disabled={isEdit}
                    value={formData.trainerName} 
                    onValueChange={(val) => setFormData({...formData, trainerName: val})}
                  >
                    <SelectTrigger className={cn("h-11 border-slate-200", isEdit && "bg-slate-50 text-slate-400 cursor-not-allowed")}>
                      <SelectValue placeholder="Select Trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Siddharth Shah">Siddharth Shah</SelectItem>
                      <SelectItem value="Rajesh Kumar">Rajesh Kumar</SelectItem>
                      <SelectItem value="Amit Patel">Amit Patel</SelectItem>
                    </SelectContent>
                  </Select>
                  {isEdit && <Lock className="absolute -right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                  <Input 
                    type="number"
                    disabled={isEdit}
                    className={cn("h-11 border-slate-200 pl-8", isEdit && "bg-slate-50 text-slate-400 pr-10 cursor-not-allowed")}
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                  {isEdit && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</Label>
                <div className="relative">
                  <Input 
                    disabled={isEdit}
                    className={cn("h-11 border-slate-200", isEdit && "bg-slate-50 text-slate-400 pr-10 cursor-not-allowed")}
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                  {isEdit && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-400">Country Code + Currency</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input readOnly value={formData.countryCode} className="h-11 bg-slate-50 border-slate-100 text-slate-500 font-mono" />
                  <Input readOnly value={formData.currency} className="h-11 bg-slate-50 border-slate-100 text-slate-500 font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t md:border-none border-slate-100">
                <div 
                  onClick={() => !isEdit && setFormData({...formData, showBatch: !formData.showBatch})}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all cursor-pointer",
                    formData.showBatch ? "bg-blue-600" : "bg-slate-200",
                    isEdit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    formData.showBatch ? "left-7" : "left-1"
                  )} />
                </div>
                <div className="flex flex-col">
                  <Label className="text-sm font-bold text-slate-700">Show Batch to User</Label>
                  <span className="text-[11px] text-slate-400">Display batch selection on checkout</span>
                </div>
                {isEdit && <Lock className="h-3.5 w-3.5 text-slate-300" />}
              </div>
            </div>
          </section>

          {/* SECTION: TRACKING */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Tag className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">Tracking & Marketing</h2>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Tracking</Label>
                <Select value={formData.leadTracking} onValueChange={(val) => setFormData({...formData, leadTracking: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Tracking Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Organic">Organic</SelectItem>
                    <SelectItem value="Non Organic">Non Organic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</Label>
                <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UTM Source</Label>
                <Select value={formData.utmSource} onValueChange={(val) => setFormData({...formData, utmSource: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {utmSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UTM Term</Label>
                <Select value={formData.utmTerm} onValueChange={(val) => setFormData({...formData, utmTerm: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    {utmTerms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UTM Medium</Label>
                <Select value={formData.utmMedium} onValueChange={(val) => setFormData({...formData, utmMedium: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {utmMediums.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program Mode</Label>
                <Input 
                  placeholder="e.g. Online Live"
                  className="h-11 border-slate-200"
                  value={formData.programMode}
                  onChange={(e) => setFormData({...formData, programMode: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ads Type</Label>
                <Select value={formData.adsType} onValueChange={(val) => setFormData({...formData, adsType: val})}>
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Ads Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {adsTypes.map(at => <SelectItem key={at} value={at}>{at}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thank You Page Link</Label>
                <Input 
                  placeholder="https://..."
                  className="h-11 border-slate-200"
                  value={formData.thankYouPageLink}
                  onChange={(e) => setFormData({...formData, thankYouPageLink: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 flex justify-end gap-3 pb-20">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="font-bold text-slate-500 hover:bg-slate-100 px-8 h-12"
          >
            Go Back
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-12 h-12 rounded-xl shadow-xl shadow-slate-200"
          >
            {isEdit ? 'Update Link' : 'Save & Generate Link'}
          </Button>
        </div>
      </div>
    </div>
  );
};
