import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Clock, 
  ArrowRight,
  Filter,
  Calendar,
  Zap,
  MoreVertical,
  Info,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { useAuth } from '../lib/auth';

interface PACESalesDashboardProps {
  onViewOverflow?: () => void;
}

export const PACESalesDashboard: React.FC<PACESalesDashboardProps> = ({ onViewOverflow }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');

  const openDrillDown = (title: string) => {
    setDrillDownTitle(title);
    setIsDrillDownOpen(true);
  };

  const historyEntries = [
    {
      date: "Today, 28 Apr 2026",
      time: "6:00 PM",
      summary: "23 total sales · ₹3,45,000 · Top source: BSW (12) · Top batch: PACE Batch 7 (15 sales)",
      status: "Sent"
    },
    {
      date: "Yesterday, 27 Apr 2026",
      time: "6:00 PM",
      summary: "19 total sales · ₹2,85,000 · Top source: BBS (8) · Top batch: PACE Batch 7 (11 sales)",
      status: "Sent"
    },
    {
      date: "26 Apr 2026",
      time: "6:00 PM",
      summary: "21 total sales · ₹3,15,000 · Top source: BSW (10) · Top batch: PACE Batch 8 (9 sales)",
      status: "Sent"
    }
  ];

  return (
    <div className="p-8 pt-0 max-w-7xl mx-auto min-h-screen space-y-8 bg-[#F9FAFB]">
      {/* Header */}
      <div className="sticky top-[52px] z-10 bg-[#F9FAFB] py-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">PACE Sales Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time PACE sales performance across all batches and sources.</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <Select defaultValue="all-time">
            <SelectTrigger className="h-9 w-[160px] border-slate-200 text-xs font-bold">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select>
          <SelectTrigger className="h-9 w-[150px] border-slate-200 text-xs font-bold">
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="b7">PACE Batch 7</SelectItem>
            <SelectItem value="b8">PACE Batch 8</SelectItem>
            <SelectItem value="b6">PACE Batch 6</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="h-9 w-[150px] border-slate-200 text-xs font-bold">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="h-9 w-[150px] border-slate-200 text-xs font-bold">
            <SelectValue placeholder="All Batch Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" className="h-9 text-xs font-bold text-slate-500">Reset</Button>
          <Button className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6">Apply filters</Button>
        </div>
      </div>

      {/* Metrics Grid Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card onClick={() => openDrillDown('Total PACE Sales')} className="cursor-pointer group hover:border-blue-200 transition-all shadow-sm border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total PACE Sales</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900">142</h2>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-lg font-bold text-slate-600">21,30,000</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-6 font-medium">Computed from lead ticket value auto-captured from payment link amount.</p>
        </Card>

        <Card onClick={() => openDrillDown('Sales This Month')} className="cursor-pointer group hover:border-emerald-200 transition-all shadow-sm border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sales this month</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold tracking-tighter">
                +12%
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900">23</h2>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-700">3,45,000</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-6 font-medium">April 2026</p>
        </Card>

        <Card onClick={() => openDrillDown('Revenue')} className="cursor-pointer group hover:border-amber-200 transition-all shadow-sm border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Revenue</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-black text-[10px]">
                ₹
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900">₹21.3L</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-6 font-medium">Total recognized PACE revenue.</p>
        </Card>

        <Card onClick={() => openDrillDown('Overflow')} className="cursor-pointer group hover:border-slate-300 transition-all shadow-sm border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Overflow — Pending Seat</span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900">8</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-slate-500">Leads waiting for a seat</span>
              </div>
            </div>
          </div>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onViewOverflow?.();
            }}
            className="mt-6 flex items-center gap-1 text-[11px] font-black text-blue-600 group-hover:gap-2 transition-all capitalize"
          >
            View overflow leads <ArrowRight className="h-3 w-3" />
          </div>
        </Card>
      </div>

      {/* Metrics Grid Row 2 - Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sales by Payment Source */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider">Sales by Payment Source</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-8 space-y-6">
            {[
              { label: 'Razorpay', count: 89, revenue: '13,35,000', color: 'bg-blue-600', width: '89%' },
              { label: 'Card (Pine Labs)', count: 28, revenue: '4,20,000', color: 'bg-indigo-500', width: '28%' },
              { label: 'UPI', count: 15, revenue: '2,25,000', color: 'bg-purple-500', width: '15%' },
              { label: 'Manual', count: 10, revenue: '1,50,000', color: 'bg-slate-500', width: '10%' },
            ].map((source, i) => (
              <div key={i} className="space-y-2 cursor-pointer group" onClick={() => openDrillDown(`Sales by ${source.label}`)}>
                <div className="flex justify-between items-center text-[11px] font-black">
                  <span className="text-slate-500 group-hover:text-slate-900">{source.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900">{source.count} sales</span>
                    <span className="text-slate-400">₹{source.revenue}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full group-hover:opacity-80 transition-all", source.color)} style={{ width: source.width }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sales by Batch Type */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider">Sales by Batch Type</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
              <Zap className="h-4 w-4 text-emerald-500" />
            </Button>
          </div>
          <div className="p-8 space-y-6">
            {[
              { label: 'Offline', count: 98, color: 'bg-emerald-500', width: '69%' },
              { label: 'Online', count: 44, color: 'bg-blue-500', width: '31%' },
            ].map((source, i) => (
              <div key={i} className="space-y-2 cursor-pointer group" onClick={() => openDrillDown(`Sales by ${source.label}`)}>
                <div className="flex justify-between items-center text-[11px] font-black">
                  <span className="text-slate-500 group-hover:text-slate-900">{source.label}</span>
                  <span className="text-slate-900">{source.count} sales</span>
                </div>
                <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all group-hover:ring-2 ring-emerald-100", source.color)} style={{ width: source.width }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Metrics Grid Row 3 - Batch & Lead Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sales by Batch */}
        <Card className="shadow-sm border-slate-200 bg-white flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider">Sales by Batch</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-50/30">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 h-10 px-6 tracking-widest">Batch</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 h-10 px-6 tracking-widest">Sales</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 h-10 px-6 tracking-widest">Revenue</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 h-10 px-6 tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'PACE Batch 7', sales: 60, revenue: '9,00,000', status: 'Full', color: 'text-red-600 bg-red-50 border-red-100' },
                  { name: 'PACE Batch 8', sales: 42, revenue: '7,56,000', status: 'Upcoming', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                  { name: 'PACE Batch 6', sales: 40, revenue: '6,00,000', status: 'Completed', color: 'text-slate-500 bg-slate-50 border-slate-100' },
                ].map((batch, i) => (
                  <TableRow key={i} className="group hover:bg-slate-50 cursor-pointer h-[52px]" onClick={() => openDrillDown(batch.name)}>
                    <TableCell className="px-6 font-bold text-[13px] text-slate-900 group-hover:text-blue-600">{batch.name}</TableCell>
                    <TableCell className="px-6 font-bold text-[13px] text-slate-600">{batch.sales}</TableCell>
                    <TableCell className="px-6 font-bold text-[13px] text-slate-900">₹{batch.revenue}</TableCell>
                    <TableCell className="px-6">
                      <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border shadow-none", batch.color)}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Lead/Closing Source Tabs */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <Tabs defaultValue="lead-source" className="w-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider">Sales Breakdown</h3>
              <TabsList className="bg-slate-200 h-8 rounded-lg p-1">
                <TabsTrigger value="lead-source" className="text-[10px] font-black uppercase h-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Lead Source</TabsTrigger>
                <TabsTrigger value="closing-source" className="text-[10px] font-black uppercase h-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Closing Source</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="lead-source" className="p-8 m-0 outline-none">
              <div className="space-y-4">
                {[
                  { label: 'BSW (Webinars)', count: 72, pct: '50%' },
                  { label: 'BBS (Events)', count: 38, pct: '26%' },
                  { label: 'Direct Ad Traffic', count: 18, pct: '13%' },
                  { label: 'Re-invite Database', count: 14, pct: '11%' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group cursor-pointer" onClick={() => openDrillDown(`Lead Source: ${item.label}`)}>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-black text-slate-900">{item.count}</span>
                      <span className="text-[11px] font-bold text-slate-400 w-10 text-right">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="closing-source" className="p-8 m-0 outline-none">
              <div className="space-y-4">
                {[
                  { label: 'Payment Link (Self)', count: 98, pct: '69%' },
                  { label: 'Manual Entry (Team)', count: 24, pct: '17%' },
                  { label: 'Corporate Bulk', count: 20, pct: '14%' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group cursor-pointer" onClick={() => openDrillDown(`Closing Source: ${item.label}`)}>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-black text-slate-900">{item.count}</span>
                      <span className="text-[11px] font-bold text-slate-400 w-10 text-right">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Refund & Reschedule Impact */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider">Refund & Reschedule Impact</h3>
        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                 <RotateCcw className="h-3.5 w-3.5 text-red-600" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-red-700">Refunded (Excluded)</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-900 underline decoration-red-200 underline-offset-4">4 refunds</span>
                <span className="text-lg font-bold text-slate-400">|</span>
                <span className="text-lg font-bold text-slate-500 italic">₹60,000</span>
              </div>
              <p className="text-[12px] text-slate-500 font-medium">Excluded from all metrics above in real time.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center">
                 <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-blue-700">Rescheduled (Batch Transfers)</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-900">7 transfers</span>
              </div>
              <p className="text-[12px] text-slate-500 font-medium">Net total unchanged — batch counts adjusted accordingly.</p>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 border-t border-slate-200">
             <div className="flex flex-col gap-1.5">
               <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-slate-400" />
                 Partial refunds are not supported. All refunds are full payment refunds.
               </div>
               <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-slate-400" />
                 Refunded and rescheduled transactions remain visible in Transactions for audit history.
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Daily Report Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5 text-slate-400" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-700 leading-tight">
            A daily PACE sales summary is automatically sent to the <span className="text-blue-600">Marketing Head</span> at end of day.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-400 font-medium">Last sent: Today, 6:00 PM</span>
            <div className="h-1 w-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="ml-auto text-blue-600 font-black text-xs gap-2"
          onClick={() => setIsHistoryOpen(true)}
        >
          View summary history
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Daily Summary History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="gap-0 p-0 flex flex-col h-full bg-white">
          <SheetHeader className="relative flex-shrink-0">
            <SheetTitle>Daily Summary History</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {historyEntries.map((entry, index) => (
              <div 
                key={index} 
                className="p-5 border border-slate-200 rounded-xl space-y-3 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{entry.date}</h4>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3 w-3" />
                      Sent at: {entry.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                    {entry.status} ✓
                  </div>
                </div>
                
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                  {entry.summary}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Drill Down Dialog */}
      <Dialog open={isDrillDownOpen} onOpenChange={setIsDrillDownOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <BarChart3 className="h-5 w-5" />
               </div>
               <div>
                  <DialogTitle className="text-xl font-black text-slate-900">{drillDownTitle}</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">Detailed breakdown of records contributing to this metric.</DialogDescription>
               </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-0">
             <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="px-6 font-bold text-[10px] uppercase text-slate-500">Client</TableHead>
                    <TableHead className="px-6 font-bold text-[10px] uppercase text-slate-500">Batch</TableHead>
                    <TableHead className="px-6 font-bold text-[10px] uppercase text-slate-500">Amount</TableHead>
                    <TableHead className="px-6 font-bold text-[10px] uppercase text-slate-500">Date</TableHead>
                    <TableHead className="px-6 font-bold text-[10px] uppercase text-slate-500">Source</TableHead>
                    <TableHead className="px-6 font-bold text-[10px] uppercase text-slate-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'John Doe', batch: 'Batch 7', amount: '₹15,000', date: 'Apr 25', source: 'BSW', status: 'Captured' },
                    { name: 'Sarah Smith', batch: 'Batch 7', amount: '₹15,000', date: 'Apr 24', source: 'Direct', status: 'Captured' },
                    { name: 'Mike Ross', batch: 'Batch 8', amount: '₹18,000', date: 'Apr 23', source: 'BBS', status: 'Captured' },
                    { name: 'Harvey Specter', batch: 'Batch 7', amount: '₹15,000', date: 'Apr 22', source: 'Re-invite', status: 'Captured' },
                    { name: 'Donna Paulsen', batch: 'Batch 8', amount: '₹18,000', date: 'Apr 21', source: 'BSW', status: 'Captured' },
                    { name: 'Rachel Zane', batch: 'Batch 7', amount: '₹15,000', date: 'Apr 20', source: 'Organic', status: 'Captured' },
                  ].map((row, i) => (
                    <TableRow
                      key={i}
                      className="h-14 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toast.info(`View payment: ${row.name} · ${row.amount}`)}
                    >
                      <TableCell className="px-6 font-bold text-[13px] text-slate-900">{row.name}</TableCell>
                      <TableCell className="px-6 text-[13px] text-slate-600">{row.batch}</TableCell>
                      <TableCell className="px-6 font-black text-[13px] text-slate-900">{row.amount}</TableCell>
                      <TableCell className="px-6 text-[13px] text-slate-500">{row.date}</TableCell>
                      <TableCell className="px-6">
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-500 border-slate-200">{row.source}</Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge className="bg-green-100 text-green-700 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 shadow-none border-green-200">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </div>

          <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing 6 of 142 records</span>
             {isAdmin && (
               <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-8">Export selection</Button>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
