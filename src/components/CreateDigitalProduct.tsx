import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Gift, 
  CreditCard, 
  Upload, 
  Link as LinkIcon,
  ChevronRight,
  FileText,
  Lock,
  Plus,
  Check,
  Play,
  Download,
  GripVertical,
  X,
  Circle,
  Layout,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CustomField {
  id: string;
  name: string;
  type: 'Text' | 'Number' | 'Dropdown' | 'Date' | 'Yes/No';
  options?: string[];
}

interface CreateDigitalProductProps {
  onBack: () => void;
  onComplete: (data: any) => void;
  onViewProduct: (data: any) => void;
}

export const CreateDigitalProduct: React.FC<CreateDigitalProductProps> = ({ onBack, onComplete, onViewProduct }) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  
  // Step 1 State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Free' | 'Paid' | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [contentMethod, setContentMethod] = useState<'pdf' | 'video' | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2 State
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomField['type']>('Text');
  const [newDropdownOption, setNewDropdownOption] = useState('');
  const [newDropdownOptions, setNewDropdownOptions] = useState<string[]>([]);
  const [fieldBuilderError, setFieldBuilderError] = useState('');
  const [createdProduct, setCreatedProduct] = useState<any | null>(null);

  const PAYMENT_LINKS = [
    { id: '1', name: 'BSW June – Google Ads', price: '₹99' },
    { id: '2', name: 'PACE Batch 7 Paid', price: '₹15,000' },
    { id: '3', name: 'BBS Mumbai Organic', price: '₹0' },
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!type) newErrors.type = 'Product type is required';
    if (type === 'Paid' && !paymentLink) newErrors.paymentLink = 'Payment link is required';
    if (!contentMethod) newErrors.contentMethod = 'Product content is required';
    if (contentMethod === 'video' && !videoUrl.trim()) newErrors.videoUrl = 'Video link is required';
    if (contentMethod === 'pdf' && !file) newErrors.file = 'File upload is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      if (type === 'Free') {
        setStep(2);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const finalData = {
      id: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      name,
      type: type as 'Free' | 'Paid',
      status: 'Active' as const,
      createdDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      sent: 0,
      failed: 0,
      fields: {
        fixed: ['Full Name', 'Email Address', 'Mobile Number'],
        custom: customFields
      },
      paymentLink: type === 'Paid' ? paymentLink : undefined,
    };
    
    setCreatedProduct(finalData);
    setShowSuccess(true);
    onComplete(finalData);
  };

  const addField = () => {
    if (!newFieldName.trim()) {
      setFieldBuilderError('Field name is required.');
      return;
    }
    if (newFieldType === 'Dropdown' && newDropdownOptions.length < 2) {
      setFieldBuilderError('Add at least 2 dropdown options.');
      return;
    }

    const field: CustomField = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFieldName.trim(),
      type: newFieldType,
      ...(newFieldType === 'Dropdown' ? { options: newDropdownOptions } : {})
    };
    setCustomFields([...customFields, field]);
    setNewFieldName('');
    setNewFieldType('Text');
    setNewDropdownOption('');
    setNewDropdownOptions([]);
    setFieldBuilderError('');
    setIsAddingField(false);
  };

  const addDropdownOption = () => {
    const option = newDropdownOption.trim();
    if (!option) return;
    if (newDropdownOptions.some((existing) => existing.toLowerCase() === option.toLowerCase())) return;
    setNewDropdownOptions((prev) => [...prev, option]);
    setNewDropdownOption('');
    setFieldBuilderError('');
  };

  const removeField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const renderStepIndicator = () => (
      <div className="flex items-center justify-center gap-8 mb-12">
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
          step === 1 ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
        )}>
          {step > 1 ? <Check className="h-4 w-4 stroke-[3px]" /> : "1"}
        </div>
        <span className={cn(
          "text-sm font-bold",
          step === 1 ? "text-slate-900" : "text-slate-400"
        )}>Product Setup</span>
      </div>

      {(type === 'Free' || step === 2) && (
        <>
          <ArrowRight className="h-4 w-4 text-slate-300" />
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
              step === 2 ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-400"
            )}>
              2
            </div>
            <span className={cn(
              "text-sm font-bold",
              step === 2 ? "text-slate-900" : "text-slate-400"
            )}>Configure Form</span>
          </div>
        </>
      )}
    </div>
  );

  const renderCustomFieldInput = (field: CustomField) => {
    if (field.type === 'Dropdown') {
      return (
        <select className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-white">
          <option value="">Select an option</option>
          {(field.options || []).map((option) => (
            <option key={`${field.id}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'Date') {
      return <Input type="date" className="h-11 border-slate-200 rounded-xl" />;
    }

    if (field.type === 'Yes/No') {
      return (
        <select className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 bg-white">
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }

    if (field.type === 'Number') {
      return <Input type="number" placeholder={`Enter ${field.name.toLowerCase()}`} className="h-11 border-slate-200 rounded-xl" />;
    }

    return <Input type="text" placeholder={`Enter ${field.name.toLowerCase()}`} className="h-11 border-slate-200 rounded-xl" />;
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-50/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="max-w-md w-full bg-white rounded-[32px] border border-slate-100 p-10 shadow-2xl text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="h-12 w-12 text-green-600 stroke-[3px]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Product created</h2>
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-6">
            {name}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-10 px-4">
            {type === 'Free' 
              ? "Your intake form is live. Share the form link with clients."
              : "Product linked to payment. Clients receive it automatically after payment."}
          </p>
          <div className="space-y-3">
            {type === 'Free' && (
              <Button 
                onClick={() => {
                  setShowFormPreview(true);
                }}
                className="h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-2xl text-white w-full shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
              >
                View form
              </Button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2"
            >
              Close
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFormPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Form Preview</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      This is how clients will fill the form before accessing {type === 'Paid' ? 'and paying for' : ''} your product.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    onClick={() => setShowFormPreview(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Full Name</Label>
                    <Input type="text" placeholder="Enter full name" className="h-11 border-slate-200 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Email Address</Label>
                    <Input type="email" placeholder="Enter email address" className="h-11 border-slate-200 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Mobile Number</Label>
                    <Input type="tel" placeholder="Enter mobile number" className="h-11 border-slate-200 rounded-xl" />
                  </div>

                  {(createdProduct?.fields?.custom || customFields).map((field: CustomField) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">{field.name}</Label>
                      {renderCustomFieldInput(field)}
                    </div>
                  ))}

                  <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white mt-2">
                    {type === 'Paid' ? 'Continue to payment' : 'Submit'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 text-center">Create Digital Product</h1>
        {renderStepIndicator()}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="space-y-10"
            >
              {/* Product Name */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Product Name</Label>
                <Input 
                  placeholder="e.g. Business Growth Toolkit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "h-12 text-base border-slate-200 rounded-xl px-4",
                    errors.name && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.name && <p className="text-xs font-bold text-red-500">{errors.name}</p>}
              </div>

              {/* Product Type */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-700">Product Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setType('Free');
                      setErrors(prev => ({ ...prev, type: '' }));
                    }}
                    className={cn(
                      "flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all group relative overflow-hidden",
                      type === 'Free' 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                        : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                      type === 'Free' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 text-slate-400"
                    )}>
                      <Gift className="h-7 w-7" />
                    </div>
                    <p className="text-base font-bold text-slate-900 mb-1">Free</p>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">Client fills a form to receive this product. No payment required.</p>
                  </button>

                  <button
                    onClick={() => {
                      setType('Paid');
                      setErrors(prev => ({ ...prev, type: '' }));
                    }}
                    className={cn(
                      "flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all group relative overflow-hidden",
                      type === 'Paid' 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                        : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                      type === 'Paid' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-50 text-slate-400"
                    )}>
                      <CreditCard className="h-7 w-7" />
                    </div>
                    <p className="text-base font-bold text-slate-900 mb-1">Paid</p>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">Client pays via a payment link before receiving this product.</p>
                  </button>
                </div>
                {errors.type && <p className="text-xs font-bold text-red-500">{errors.type}</p>}
              </div>

              {/* Conditional Payment Link */}
              {type === 'Paid' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-sm font-bold text-slate-700">Payment Link</Label>
                  <div className="relative">
                    <select 
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      className={cn(
                        "w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none",
                        errors.paymentLink && "border-red-500"
                      )}
                    >
                      <option value="">Select a payment link</option>
                      {PAYMENT_LINKS.map(link => (
                        <option key={link.id} value={link.id}>{link.name} ({link.price})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Client must complete payment before the product is delivered.</p>
                  {errors.paymentLink && <p className="text-xs font-bold text-red-500">{errors.paymentLink}</p>}
                </div>
              )}

              {/* Product Content */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-700">What are you delivering?</Label>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setContentMethod('pdf');
                      setErrors(prev => ({ ...prev, contentMethod: '' }));
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                      contentMethod === 'pdf' ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        contentMethod === 'pdf' ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">PDF / Document</span>
                    </div>
                    {contentMethod === 'pdf' && <Check className="h-5 w-5 text-blue-600 stroke-[3px]" />}
                  </button>

                  <button
                    onClick={() => {
                      setContentMethod('video');
                      setErrors(prev => ({ ...prev, contentMethod: '' }));
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                      contentMethod === 'video' ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        contentMethod === 'video' ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                      )}>
                        <Play className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">Video Link</span>
                    </div>
                    {contentMethod === 'video' && <Check className="h-5 w-5 text-blue-600 stroke-[3px]" />}
                  </button>
                </div>
                {errors.contentMethod && <p className="text-xs font-bold text-red-500">{errors.contentMethod}</p>}

                {contentMethod === 'pdf' && (
                  <label className="block mt-4 border-2 border-dashed border-slate-100 rounded-2xl p-8 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6 text-slate-300" />
                      </div>
                      {file ? (
                        <p className="text-sm font-bold text-blue-600">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-slate-700 mb-1">Click to upload PDF</p>
                          <p className="text-xs text-slate-400">PDF files only. Max 50MB.</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null);
                          setErrors(prev => ({ ...prev, file: '' }));
                        }}
                      />
                    </div>
                  </label>
                )}

                {contentMethod === 'video' && (
                  <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Input 
                      placeholder="Paste your video link here"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setErrors(prev => ({ ...prev, videoUrl: '' }));
                      }}
                      className="h-12 border-slate-200 rounded-xl px-4"
                    />
                    {errors.videoUrl && <p className="text-xs font-bold text-red-500">{errors.videoUrl}</p>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-8 flex items-center justify-between border-t border-slate-50">
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                  className="h-12 px-8 text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleNext}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  {type === 'Free' ? 'Next: Configure form' : 'Create product'}
                  {type === 'Free' && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Configure intake form</h2>
                <p className="text-sm text-slate-500">This form is what clients fill to access your free product.</p>
              </div>

              {/* Fixed Fields */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Always collected — cannot be removed</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Full Name', type: 'Text' },
                    { label: 'Email Address', type: 'Email' },
                    { label: 'Mobile Number', type: 'Phone' },
                  ].map(field => (
                    <div key={field.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Circle className="h-3 w-3 text-slate-300" />
                        <div>
                          <p className="font-bold text-slate-700 leading-none">{field.label}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold mt-1">{field.type}</p>
                        </div>
                      </div>
                      <Lock className="h-4 w-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Fields */}
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-bold text-slate-700">Add more fields (optional)</Label>
                  <p className="text-xs text-slate-400 tracking-tight">These appear below the fixed fields on the client form.</p>
                </div>

                <div className="space-y-3">
                  {customFields.map((field) => (
                    <motion.div 
                      key={field.id}
                      layout
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white group hover:border-slate-200 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <Layout className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{field.name}</p>
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0 h-4 border-0">
                            {field.type}
                          </Badge>
                          {field.type === 'Dropdown' && (
                            <p className="text-[10px] text-slate-400 mt-1">{field.options?.length || 0} options</p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeField(field.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}

                  {isAddingField ? (
                    <motion.div 
                      key="add-field-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border-2 border-blue-100 bg-blue-50/20 space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-1">Field Name</Label>
                          <Input 
                            autoFocus
                            placeholder="e.g. Company Name"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addField()}
                            className="h-10 text-sm border-blue-200 focus-visible:ring-blue-600 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-1">Field Type</Label>
                          <div className="relative">
                            <select 
                              value={newFieldType}
                              onChange={(e) => {
                                const value = e.target.value as CustomField['type'];
                                setNewFieldType(value);
                                setFieldBuilderError('');
                                if (value !== 'Dropdown') {
                                  setNewDropdownOption('');
                                  setNewDropdownOptions([]);
                                }
                              }}
                              className="w-full h-10 bg-white border border-blue-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
                            >
                              <option value="Text">Text</option>
                              <option value="Number">Number</option>
                              <option value="Dropdown">Dropdown</option>
                              <option value="Date">Date</option>
                              <option value="Yes/No">Yes/No</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {newFieldType === 'Dropdown' && (
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-1">
                            Dropdown options (min 2)
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="e.g. Owner, Manager, Freelancer"
                              value={newDropdownOption}
                              onChange={(e) => setNewDropdownOption(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addDropdownOption();
                                }
                              }}
                              className="h-10 text-sm border-blue-200 focus-visible:ring-blue-600 rounded-xl"
                            />
                            <Button
                              type="button"
                              onClick={addDropdownOption}
                              className="h-10 px-4 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl text-xs font-bold"
                            >
                              Add option
                            </Button>
                          </div>
                          {newDropdownOptions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {newDropdownOptions.map((option) => (
                                <span
                                  key={option}
                                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2.5 py-1 text-[11px] font-bold"
                                >
                                  {option}
                                  <button
                                    type="button"
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => setNewDropdownOptions((prev) => prev.filter((item) => item !== option))}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {fieldBuilderError && (
                        <p className="text-xs font-bold text-red-500">{fieldBuilderError}</p>
                      )}
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setIsAddingField(false)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                        <Button 
                          onClick={addField}
                          disabled={!newFieldName.trim()}
                          className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          Add
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingField(true)}
                      className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 group"
                    >
                      <Plus className="h-4 w-4" />
                      Add field
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 flex items-center justify-between border-t border-slate-50">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="h-12 px-8 text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white shadow-lg shadow-blue-600/20"
                >
                  Create product
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
