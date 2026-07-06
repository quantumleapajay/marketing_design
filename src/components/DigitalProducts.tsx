import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Package, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  X,
  FileText,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import StatusBadge from "./ui/StatusBadge";
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

import { DigitalProduct } from '../types';
import { CreateDigitalProduct } from './CreateDigitalProduct';

const DUMMY_DATA: DigitalProduct[] = [
  { id: '0001', name: 'PACE Workbook 2026', type: 'Free', status: 'Active', createdDate: '1 Apr 2026', sent: 142, failed: 0 },
  { id: '0002', name: 'BSW Sketch Notes PDF', type: 'Free', status: 'Active', createdDate: '15 Mar 2026', sent: 89, failed: 2 },
  { id: '0003', name: 'BBS Playbook', type: 'Paid', status: 'Active', createdDate: '10 Mar 2026', sent: 34, failed: 0 },
  { id: '0004', name: 'Sales Masterclass', type: 'Paid', status: 'Active', createdDate: '1 Mar 2026', sent: 67, failed: 1 },
  { id: '0005', name: 'PACE Guide V1', type: 'Free', status: 'Inactive', createdDate: '1 Feb 2026', sent: 210, failed: 0 },
  { id: '0006', name: 'BBS Pre-read Doc', type: 'Paid', status: 'Inactive', createdDate: '15 Jan 2026', sent: 45, failed: 3 },
];

export const DigitalProducts: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [products, setProducts] = useState<DigitalProduct[]>(DUMMY_DATA);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Free' | 'Paid'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [demoEmpty, setDemoEmpty] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ product: DigitalProduct, type: 'deactivate' | 'reactivate' } | null>(null);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [editingName, setEditingName] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || p.type === filterType;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const hasActiveFilters = filterType !== 'All' || filterStatus !== 'All';

  const resetFilters = () => {
    setFilterType('All');
    setFilterStatus('All');
  };

  const toggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return p;
    }));
  };

  const handleConfirmAction = () => {
    if (confirmModal) {
      toggleStatus(confirmModal.product.id);
      setConfirmModal(null);
    }
  };

  const saveProductName = () => {
    if (!editingProduct || !editingName.trim()) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? { ...p, name: editingName.trim() } : p))
    );
    if (selectedProduct?.id === editingProduct.id) {
      setSelectedProduct({ ...selectedProduct, name: editingName.trim() });
    }
    setEditingProduct(null);
    setEditingName('');
  };

  if (view === 'create') {
    return (
      <CreateDigitalProduct 
        onBack={() => setView('list')} 
        onComplete={(newProduct) => {
          setProducts(prev => [newProduct, ...prev]);
        }}
        onViewProduct={(product) => {
          setSelectedProduct(product);
          setView('list');
        }}
      />
    );
  }

  const displayProducts = demoEmpty ? [] : products;

  if (displayProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 relative">
        <div className="text-center py-12">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30 stroke-[1.5px]" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No digital products yet</h3>
          <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto leading-relaxed">
            Create your first product to start delivering content to clients automatically.
          </p>
          <Button
            onClick={() => setView('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="sticky top-0 z-20 bg-white py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Digital Products</h1>
            <p className="text-slate-500 text-sm">
              Manage and deliver digital products to clients automatically.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl px-4 relative">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                Filter
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white ring-1 ring-blue-600/20 shadow-sm" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-5 rounded-2xl shadow-xl border-slate-100 z-30">
              <div className="space-y-6">
                {/* Product Type Filter */}
                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Product Type</p>
                  <div className="space-y-2">
                    {['All', 'Free', 'Paid'].map((type) => (
                      <label key={type} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="productType"
                            checked={filterType === type}
                            onChange={() => setFilterType(type as any)}
                            className="peer appearance-none w-4 h-4 rounded-full border-2 border-slate-200 checked:border-blue-600 transition-all cursor-pointer"
                          />
                          <div className="absolute w-2 h-2 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className={cn(
                          "text-sm font-bold transition-colors",
                          filterType === type ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                        )}>
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</p>
                  <div className="space-y-2">
                    {['All', 'Active', 'Inactive'].map((status) => (
                      <label key={status} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="status"
                            checked={filterStatus === status}
                            onChange={() => setFilterStatus(status as any)}
                            className="peer appearance-none w-4 h-4 rounded-full border-2 border-slate-200 checked:border-blue-600 transition-all cursor-pointer"
                          />
                          <div className="absolute w-2 h-2 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className={cn(
                          "text-sm font-bold transition-colors",
                          filterStatus === status ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                        )}>
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                  <button 
                    onClick={resetFilters}
                    className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Reset
                  </button>
                  <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest rounded-lg flex-1">
                    Apply filters
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={() => setView('create')}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl px-6 shadow-lg shadow-blue-600/10 transition-all active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit max-w-full overflow-x-auto mb-6">
        {(['All', 'Active', 'Inactive'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterStatus(tab)}
            className={cn(
              'h-9 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0',
              filterStatus === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by product name..." 
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="h-14 px-6 text-left text-[13px] font-bold text-[#6B7280] uppercase tracking-[0.5px]">Product Name</th>
                <th className="h-14 px-6 text-left text-[13px] font-bold text-[#6B7280] uppercase tracking-[0.5px]">Type</th>
                <th className="h-14 px-6 text-left text-[13px] font-bold text-[#6B7280] uppercase tracking-[0.5px]">Status</th>
                <th className="h-14 px-6 text-left text-[13px] font-bold text-[#6B7280] uppercase tracking-[0.5px]">Created Date</th>
                <th className="h-14 px-6 text-left text-[13px] font-bold text-[#6B7280] uppercase tracking-[0.5px]">Deliveries</th>
                <th className="h-14 px-6 text-right text-[13px] font-bold text-[#6B7280] uppercase tracking-[0.5px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => (
                <tr 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className={cn(
                    "h-14 border-b border-[#F3F4F6] transition-colors cursor-pointer hover:bg-slate-50",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]",
                    product.status === 'Inactive' ? "text-[#9CA3AF]" : "text-slate-900"
                  )}
                >
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold",
                        product.status === 'Inactive' ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"
                      )}>
                        {product.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("text-sm font-bold", product.status === 'Inactive' && "text-[#9CA3AF]")}>
                          {product.name}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">ID: #{product.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6">
                    <span className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      product.status === 'Inactive' ? "text-slate-400" : "text-slate-600"
                    )}>
                      {product.type}
                    </span>
                  </td>
                  <td className="px-6">
                    <StatusBadge status={product.status} className="text-xs px-2.5 py-1" />
                  </td>
                  <td className="px-6 text-sm">
                    {product.createdDate}
                  </td>
                  <td className="px-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] text-[#6B7280]">{product.sent} sent</span>
                      <span className={cn(
                        "text-[13px]",
                        product.failed > 0 ? (product.status === 'Inactive' ? "text-slate-400" : "text-red-600") : "text-[#6B7280]"
                      )}>
                        {product.failed} failed
                      </span>
                    </div>
                  </td>
                  <td className="px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0 text-[#6B7280] hover:bg-slate-50 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-slate-100 shadow-xl">
                          <DropdownMenuItem 
                            className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4 text-slate-400" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50"
                            onClick={() => {
                              setEditingProduct(product);
                              setEditingName(product.name);
                            }}
                          >
                            <FileText className="h-4 w-4 text-slate-400" />
                            Edit product name
                          </DropdownMenuItem>
                          
                          {product.status === 'Active' ? (
                            <DropdownMenuItem 
                              className="flex items-center gap-2 font-bold text-red-600 cursor-pointer rounded-lg px-3 py-2 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                              onClick={() => setConfirmModal({ product, type: 'deactivate' })}
                            >
                              <XCircle className="h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="flex items-center gap-2 font-bold text-blue-600 cursor-pointer rounded-lg px-3 py-2 hover:bg-blue-50 focus:text-blue-700 focus:bg-blue-50"
                              onClick={() => setConfirmModal({ product, type: 'reactivate' })}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr className="h-[400px]">
                  <td colSpan={6} className="text-center">
                    <div className="text-center py-12">
                      <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">No products found</h3>
                      <p className="text-xs text-gray-400 mb-4 max-w-[250px] mx-auto">
                        We couldn't find any products matching "{search}"
                      </p>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSearch('')}
                        className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50"
                      >
                        Clear search
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="relative px-5 py-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 pr-10">
                  <h2 className="text-base font-semibold text-gray-900">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <Badge className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      selectedProduct.type === 'Free' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {selectedProduct.type}
                    </Badge>
                    <Badge className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      selectedProduct.status === 'Active' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {selectedProduct.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* PRODUCT DETAILS */}
                <section>
                  <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">Product Details</p>
                  <div className="rounded-xl border border-slate-100 overflow-hidden text-sm">
                    {[
                      { label: 'Type', value: selectedProduct.type },
                      { 
                        label: 'Status', 
                        value: (
                          <Badge className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                            selectedProduct.status === 'Active' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {selectedProduct.status}
                          </Badge>
                        ) 
                      },
                      { label: 'Created Date', value: selectedProduct.createdDate },
                      { label: 'File Type', value: 'PDF' },
                      { 
                        label: 'Form Link', 
                        value: (
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate mr-2">form.qloneapp.com/{selectedProduct.id}</span>
                            <button className="text-blue-600 hover:text-blue-700 p-1">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) 
                      },
                    ].map((row, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "h-10 px-4 flex items-center justify-between border-b last:border-0 border-slate-100",
                          idx % 2 === 1 && "bg-[#F9FAFB]"
                        )}
                      >
                        <span className="text-[#6B7280]">{row.label}</span>
                        <span className="font-bold text-slate-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Edit rules: only Product Name can be edited post-creation. Product Type and all other fields are locked.
                  </p>
                </section>

                {/* FORM FIELDS */}
                {selectedProduct.type === 'Free' && (
                  <section>
                    <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">Form Fields</p>
                    <div className="flex flex-wrap gap-2">
                      {['Name', 'Email', 'Mobile', 'City', 'Designation'].map((field) => (
                        <span 
                          key={field} 
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[13px] font-bold rounded-[8px]"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* DELIVERY STATS */}
                <section>
                  <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">Delivery Stats</p>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
                        <span className="text-[#6B7280]">Sent</span>
                        <span className="font-bold text-green-600">{selectedProduct.sent}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
                        <span className="text-[#6B7280]">Failed</span>
                        <span className={cn("font-bold", selectedProduct.failed > 0 ? "text-red-500" : "text-[#6B7280]")}>
                          {selectedProduct.failed}
                        </span>
                      </div>
                    </div>

                  </div>
                </section>
              </div>

              {/* Footer removed per request */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
            <p className="text-xs text-slate-500">Only Product Name is editable. Product Type and other fields remain locked.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            <Button onClick={saveProductName}>Save name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {confirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {confirmModal.type === 'deactivate' ? "Deactivate product?" : "Reactivate product?"}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {confirmModal.type === 'deactivate' ? (
                      <>
                        Clients will no longer be able to buy <span className="font-bold text-slate-700">{confirmModal.product.name}</span>.
                        <br />This action can be reversed by reactivating the product.
                      </>
                    ) : (
                      <>
                        Clients will be able to access and receive <span className="font-bold text-slate-700">{confirmModal.product.name}</span> again.
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 flex items-center justify-end gap-3">
                  <Button 
                    variant="ghost" 
                    className="font-bold text-slate-500" 
                    onClick={() => setConfirmModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className={cn(
                      "font-bold px-6 rounded-xl",
                      confirmModal.type === 'deactivate' 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    onClick={handleConfirmAction}
                  >
                    {confirmModal.type === 'deactivate' ? "Deactivate" : "Reactivate"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
