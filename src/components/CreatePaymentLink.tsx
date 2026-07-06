import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  Check, 
  CheckCircle2, 
  CircleDot, 
  ArrowLeftRight, 
  Flag, 
  Eye, 
  UserPlus, 
  Building2, 
  Link as LinkIcon, 
  X,
  CircleChevronRight,
  ChevronDown,
  ChevronRight,
  Lock,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreatePaymentLinkProps {
  onBack: () => void;
  initialData?: any;
  isSidebar?: boolean;
}

interface FormErrors {
  linkName?: string;
  programName?: string;
  paceBatches?: string;
  amount?: string;
  gatewayType?: string;
  trainerName?: string;
  country?: string;
  reasonForEdit?: string;
}

const INITIAL_FORM_DATA = {
  linkName: '',
  programName: 'PACE',
  gatewayType: 'Razorpay',
  trainerName: '',
  amount: '',
  country: '',
  paceBatches: [] as string[],
  showBatch: '',
  leadTracking: '',
  adsType: '',
  utmSource: '',
  paceDates: ['PACE - 2609 - AMD', 'PACE 2609 AMD'],
  utmMedium: '',
  department: '',
  thankYouLinkYes: '',
  utmTerm: '',
  thankYouLinkNo: '',
  programMode: '',
  reasonForEdit: '',
};

const MOCK_TRAINERS = [
  'Siddharth Shah',
  'Rajesh Kumar',
  'Ria Sharma',
  'Amit Patel'
];

export const CreatePaymentLink: React.FC<CreatePaymentLinkProps> = ({ onBack, initialData, isSidebar }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        linkName: initialData.name || initialData.sourceEventName || '',
        programName: initialData.program || initialData.programName || 'PACE',
        gatewayType: initialData.gatewayType || 'Razorpay',
        trainerName: initialData.trainer || '',
        amount: initialData.amount?.replace('₹', '') || '',
        country: initialData.country || '',
        paceBatches: Array.isArray(initialData.paceBatches) ? initialData.paceBatches : [],
        showBatch: initialData.showBatch || '',
        leadTracking: initialData.leadTracking || '',
        adsType: initialData.adsType || '',
        utmSource: initialData.utmSource || '',
        paceDates: ['PACE - 2609 - AMD', 'PACE 2609 AMD'],
        utmMedium: initialData.utmMedium || '',
        department: initialData.department || initialData.leadDept || '',
        thankYouLinkYes: initialData.thankYouLinkYes || initialData.thankYouPage || '',
        utmTerm: initialData.utmTerm || '',
        thankYouLinkNo: initialData.thankYouLinkNo || '',
        programMode: initialData.programMode || initialData.mode || '',
        reasonForEdit: '',
      };
    }
    return INITIAL_FORM_DATA;
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!initialData) {
      if (!formData.linkName.trim()) newErrors.linkName = 'This field is required.';
      if (!formData.programName) newErrors.programName = 'This field is required.';
      if (formData.programName === 'PACE' && formData.paceBatches.length === 0) {
        newErrors.paceBatches = 'Please select at least one PACE batch.';
      }
      if (!formData.amount.trim()) newErrors.amount = 'This field is required.';
      if (!formData.gatewayType) newErrors.gatewayType = 'This field is required.';
    } else {
      if (initialData && !formData.linkName.trim()) {
        newErrors.linkName = 'Link name is required.';
      }
      if (!formData.utmSource) newErrors.reasonForEdit = 'UTM Source is required.';
      if (!formData.utmMedium) newErrors.reasonForEdit = 'UTM Medium is required.';
      if (!formData.utmTerm) newErrors.reasonForEdit = 'UTM Term is required.';
      if (!formData.reasonForEdit.trim()) newErrors.reasonForEdit = 'Reason for edit is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSuccess(true);
      toast.success(initialData ? 'Payment link updated' : 'Payment link created successfully!');
      if (initialData) {
        const auditFields = [
          { field: 'Link Name', old: initialData.name, new: formData.linkName },
          { field: 'Lead Tracking', old: initialData.leadTracking, new: formData.leadTracking },
          { field: 'Department', old: initialData.department, new: formData.department },
          { field: 'UTM Source', old: initialData.utmSource, new: formData.utmSource },
          { field: 'UTM Term', old: initialData.utmTerm, new: formData.utmTerm },
          { field: 'UTM Medium', old: initialData.utmMedium, new: formData.utmMedium },
          { field: 'Program Mode', old: initialData.programMode, new: formData.programMode },
          { field: 'Ads Type', old: initialData.adsType, new: formData.adsType },
          { field: 'Thank You Page Link', old: initialData.thankYouLinkYes, new: formData.thankYouLinkYes },
        ].filter((f) => f.old !== f.new);

        console.log('AUDIT LOG — Payment Link Edit', {
          editedBy: 'Current User',
          linkId: initialData.id,
          reason: formData.reasonForEdit,
          changes: auditFields,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleCopy = (text: string, type: 'direct' | 'short') => {
    navigator.clipboard.writeText(text);
    if (type === 'direct') {
      setCopiedDirect(true);
      setTimeout(() => setCopiedDirect(false), 2000);
    } else {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setIsSuccess(false);
  };

  const getPaceBatchLabel = () => {
    if (formData.paceBatches.length === 0) return 'Select one or more batches';
    if (formData.paceBatches.length === 1) return formData.paceBatches[0];
    return `${formData.paceBatches.length} selected`;
  };

  if (isSuccess) {
    return (
      <div className={cn(
        "bg-[#F9FAFB] flex items-center justify-center p-8",
        isSidebar ? "flex-1" : "min-h-full"
      )}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6",
            isSidebar ? "p-6 w-full" : "p-10 max-w-[600px] w-full"
          )}
        >
          <div className="mb-2">
            <CheckCircle2 className={cn("text-[#16A34A]", isSidebar ? "h-12 w-12" : "h-16 w-16")} />
          </div>
          
          <div className="space-y-2">
            <h2 className={cn("font-bold text-slate-900", isSidebar ? "text-xl" : "text-2xl")}>
              {initialData ? 'Payment link updated' : 'Payment link created'}
            </h2>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              Your link is ready to share. Copy and use it immediately.
            </p>
          </div>

          <div className="w-full space-y-6 pt-6">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Link</Label>
              <div className="relative flex items-center">
                <Input 
                  readOnly
                  value="https://payment.qloneapp.com/razorpay?BSW24"
                  className="h-10 bg-slate-50 border-slate-200 pr-20 font-mono text-[10px] text-slate-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy('https://payment.qloneapp.com/razorpay?BSW24', 'direct')}
                  className="absolute right-1 h-8 px-3 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  {copiedDirect ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Link</Label>
              <div className="relative flex items-center">
                <Input 
                  readOnly
                  value="https://ql.one/BSW24"
                  className="h-10 bg-slate-50 border-slate-200 pr-20 font-mono text-[10px] text-slate-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy('https://ql.one/BSW24', 'short')}
                  className="absolute right-1 h-8 px-3 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  {copiedShort ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 pt-4">
            <Button 
              onClick={resetForm}
              variant="outline"
              className="h-11 font-bold text-slate-600 border-slate-200 hover:bg-slate-50 text-xs"
            >
              Create another link
            </Button>
            <Button 
              onClick={onBack}
              className="h-11 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white text-xs"
            >
              Back to Payment Links
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white flex flex-col relative", isSidebar ? "h-full" : "min-h-full")} ref={formRef}>
      <div className={cn("flex-1 overflow-y-auto", isSidebar ? "p-6" : "p-10 pb-32")}>
        <div className={cn(isSidebar ? "w-full" : "max-w-7xl mx-auto")}>
            <div className={cn("mb-8", isSidebar && "mb-6")}>
              {isSidebar && (
                <button 
                  onClick={onBack}
                  className="mb-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <h1 className={cn("font-bold text-slate-900", isSidebar ? "text-xl uppercase tracking-widest text-[11px]" : "text-2xl")}>
                {initialData ? 'Edit payment link details' : 'Create new payment link'}
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                {initialData 
                  ? 'Modify the details below to update your payment link.' 
                  : 'Fill in the details below to generate a new payment link.'}
              </p>
            </div>

            {initialData && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                <Info className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800 font-medium">Only tracking parameters can be edited after link creation.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={cn("grid gap-x-8 gap-y-6", isSidebar ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
              {initialData ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 leading-none">
                      Link Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Link Name"
                      className={cn(
                        'h-12 border-slate-200 focus:ring-0 focus:border-blue-500 bg-white',
                        errors.linkName && 'border-red-500'
                      )}
                      value={formData.linkName}
                      onChange={(e) => setFormData({ ...formData, linkName: e.target.value })}
                    />
                    {errors.linkName && <p className="text-xs text-red-500 mt-1">{errors.linkName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Lead Tracking <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.leadTracking}
                      onValueChange={(v) => setFormData({ ...formData, leadTracking: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enabled">Enabled</SelectItem>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(v) => setFormData({ ...formData, department: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Ads Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.adsType}
                      onValueChange={(v) => setFormData({ ...formData, adsType: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                        <SelectItem value="No Ads">No Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Program Mode <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.programMode}
                      onValueChange={(v) => setFormData({ ...formData, programMode: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Thank You Page Link
                    </Label>
                    <Input
                      placeholder="Paste URL"
                      className="h-12 border-slate-200 focus:ring-0 focus:border-blue-500 bg-white"
                      value={formData.thankYouLinkYes}
                      onChange={(e) => setFormData({ ...formData, thankYouLinkYes: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 leading-none">
                      UTM Source <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.utmSource} 
                      onValueChange={(v) => setFormData({ ...formData, utmSource: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Organic">Organic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 leading-none">
                      UTM Medium <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.utmMedium} 
                      onValueChange={(v) => setFormData({ ...formData, utmMedium: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 leading-none">
                      UTM Term <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.utmTerm} 
                      onValueChange={(v) => setFormData({ ...formData, utmTerm: v })}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Choose an option..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BSW">BSW</SelectItem>
                        <SelectItem value="BBS">BBS</SelectItem>
                        <SelectItem value="PACE">PACE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-full space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 leading-none">
                      Reason for Edit <span className="text-red-500">*</span>
                    </Label>
                    <Textarea 
                      placeholder="e.g. UTM was incorrectly captured"
                      className={cn(
                        "min-h-[100px] border-slate-200 focus:ring-0 focus:border-blue-500 bg-white",
                        errors.reasonForEdit && "border-red-500"
                      )}
                      value={formData.reasonForEdit}
                      onChange={(e) => setFormData({ ...formData, reasonForEdit: e.target.value })}
                    />
                    {errors.reasonForEdit && <p className="text-xs text-red-500 mt-1">{errors.reasonForEdit}</p>}
                  </div>
                </>
              ) : (
                <>
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 leading-none">
                      Link Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      placeholder="Link Name"
                      className={cn(
                        "h-12 border-slate-200 focus:ring-0 focus:border-blue-500 bg-white",
                        errors.linkName && "border-red-500"
                      )}
                      value={formData.linkName}
                      onChange={(e) => setFormData({ ...formData, linkName: e.target.value })}
                    />
                  </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Program Name <span className="text-red-500">*</span>
                {initialData && <Lock className="h-3 w-3 text-slate-400" />}
              </Label>
              <Select 
                value={formData.programName} 
                onValueChange={(v) => {
                  setFormData((prev) => ({
                    ...prev,
                    programName: v,
                    paceBatches: v === 'PACE' ? prev.paceBatches : [],
                  }));
                  setErrors((prev) => ({ ...prev, paceBatches: undefined }));
                }}
                disabled={!!initialData}
              >
                <SelectTrigger className={cn(
                  "h-12 border-slate-200 bg-white",
                  initialData && "bg-slate-50 text-slate-500 cursor-not-allowed",
                  errors.programName && "border-red-500"
                )}>
                  <div className="flex items-center gap-2">
                    <CircleChevronRight className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PACE">PACE</SelectItem>
                  <SelectItem value="BSW">BSW</SelectItem>
                  <SelectItem value="BBS">BBS</SelectItem>
                </SelectContent>
              </Select>
              {errors.programName && <p className="text-xs text-red-500 mt-1">{errors.programName}</p>}
            </div>

            {formData.programName === 'PACE' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 leading-none">
                  PACE batch <span className="text-red-500">*</span>
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-12 w-full justify-between border-slate-200 bg-white font-normal text-slate-700 hover:bg-white",
                        errors.paceBatches && "border-red-500"
                      )}
                    >
                      <span className="truncate">{getPaceBatchLabel()}</span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    {formData.paceDates.map((paceDate) => (
                      <DropdownMenuCheckboxItem
                        key={paceDate}
                        checked={formData.paceBatches.includes(paceDate)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => {
                            const isSelected = prev.paceBatches.includes(paceDate);
                            if (checked && !isSelected) {
                              return { ...prev, paceBatches: [...prev.paceBatches, paceDate] };
                            }
                            if (!checked && isSelected) {
                              return { ...prev, paceBatches: prev.paceBatches.filter((batch) => batch !== paceDate) };
                            }
                            return prev;
                          });
                          setErrors((prev) => ({ ...prev, paceBatches: undefined }));
                        }}
                      >
                        {paceDate}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.paceBatches && <p className="text-xs text-red-500 mt-1">{errors.paceBatches}</p>}
              </div>
            )}

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Gateway Type <span className="text-red-500">*</span>
                {initialData && <Lock className="h-3 w-3 text-slate-400" />}
              </Label>
              <Select 
                value={formData.gatewayType} 
                onValueChange={(v) => setFormData({ ...formData, gatewayType: v })}
                disabled={!!initialData}
              >
                <SelectTrigger className={cn(
                  "h-12 border-slate-200 bg-white",
                  initialData && "bg-slate-50 text-slate-500 cursor-not-allowed",
                  errors.gatewayType && "border-red-500"
                )}>
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Razorpay">Razorpay</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Trainer Name <span className="text-red-500">*</span>
                {initialData && <Lock className="h-3 w-3 text-slate-400" />}
              </Label>
              <Select 
                value={formData.trainerName} 
                onValueChange={(v) => setFormData({ ...formData, trainerName: v })}
                disabled={!!initialData}
              >
                <SelectTrigger className={cn(
                  "h-12 border-slate-200 bg-white",
                  initialData && "bg-slate-50 text-slate-500 cursor-not-allowed"
                )}>
                  <div className="flex items-center gap-2">
                    <CircleChevronRight className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TRAINERS.map(trainer => (
                    <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Amount <span className="text-red-500">*</span>
                {initialData && <Lock className="h-3 w-3 text-slate-400" />}
              </Label>
              <Input 
                placeholder="Amount"
                type="number"
                className={cn(
                  "h-12 border-slate-200 focus:ring-0 focus:border-blue-500 bg-white",
                  initialData && "bg-slate-50 text-slate-500 cursor-not-allowed",
                  errors.amount && "border-red-500"
                )}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={!!initialData}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Country <span className="text-red-500">*</span>
                {initialData && <Lock className="h-3 w-3 text-slate-400" />}
              </Label>
              <Select 
                value={formData.country} 
                onValueChange={(v) => setFormData({ ...formData, country: v })}
                disabled={!!initialData}
              >
                <SelectTrigger className={cn(
                  "h-12 border-slate-200 bg-white",
                  initialData && "bg-slate-50 text-slate-500 cursor-not-allowed"
                )}>
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 4 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                Do you want to show batch to user <span className="text-red-500">*</span>
                {initialData && <Lock className="h-3 w-3 text-slate-400" />}
              </Label>
              <Select 
                value={formData.showBatch} 
                onValueChange={(v) => setFormData({ ...formData, showBatch: v })}
                disabled={!!initialData}
              >
                <SelectTrigger className={cn(
                  "h-12 border-slate-200 bg-white",
                  initialData && "bg-slate-50 text-slate-500 cursor-not-allowed"
                )}>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Lead tracking <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.leadTracking} 
                onValueChange={(v) => setFormData({ ...formData, leadTracking: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enabled">Enabled</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 5 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Ads Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.adsType} 
                onValueChange={(v) => setFormData({ ...formData, adsType: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                UTM Source <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.utmSource} 
                onValueChange={(v) => setFormData({ ...formData, utmSource: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 6 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.department} 
                onValueChange={(v) => setFormData({ ...formData, department: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                UTM Medium <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.utmMedium} 
                onValueChange={(v) => setFormData({ ...formData, utmMedium: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPC">CPC</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 7 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                UTM Term <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.utmTerm} 
                onValueChange={(v) => setFormData({ ...formData, utmTerm: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PACE">PACE</SelectItem>
                  <SelectItem value="BSW">BSW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Add thank you page link (If "Yes") <span className="text-red-500">*</span>
              </Label>
              <Input 
                placeholder="Link"
                className="h-12 border-slate-200 focus:ring-0 focus:border-blue-500 bg-white"
                value={formData.thankYouLinkYes}
                onChange={(e) => setFormData({ ...formData, thankYouLinkYes: e.target.value })}
              />
            </div>

            {/* Row 8 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Program Mode <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.programMode} 
                onValueChange={(v) => setFormData({ ...formData, programMode: v })}
              >
                <SelectTrigger className="h-12 border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Choose an option..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Add thank you page link (If "No") <span className="text-red-500">*</span>
              </Label>
              <Input 
                placeholder="Link"
                className="h-12 border-slate-200 focus:ring-0 focus:border-blue-500 bg-white"
                value={formData.thankYouLinkNo}
                onChange={(e) => setFormData({ ...formData, thankYouLinkNo: e.target.value })}
              />
            </div>
          </>
        )}
      </form>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className={cn(
        "sticky bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]",
        isSidebar ? "px-6" : "p-4"
      )}>
        <div className={cn("flex justify-end gap-3", !isSidebar && "max-w-7xl mx-auto")}>
          <Button 
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-10 px-8 font-bold text-[#6B7280] border-slate-200 hover:bg-slate-50 text-xs uppercase tracking-widest rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            disabled={
              initialData &&
              (!formData.linkName.trim() ||
                !formData.reasonForEdit.trim() ||
                !formData.utmSource ||
                !formData.utmMedium ||
                !formData.utmTerm)
            }
            onClick={handleSubmit}
            className="h-10 px-10 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
          >
            {initialData ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};
