
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface CreateReinviteBatchProps {
  onBack: () => void;
  webinarTitle?: string;
}

export const CreateReinviteBatch: React.FC<CreateReinviteBatchProps> = ({ 
  onBack, 
  webinarTitle = "BSW April Week 3 - Day 1" 
}) => {
  const [batchName, setBatchName] = useState("Re-invite — BSW April Week 3");
  const [selectedSources, setSelectedSources] = useState<string[]>(["BSW April Week 3 - Day 1"]);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const sourceOptions = [
    "BSW April Week 2",
    "BSW April Week 3 - Day 1",
    "BSW March Finale"
  ];

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source) 
        : [...prev, source]
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="p-0 h-auto text-slate-500 hover:text-slate-900 hover:bg-transparent mb-6 flex items-center gap-2 w-fit"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">{webinarTitle}</span>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Re-invite Batch</h1>
        <p className="text-slate-500 mt-1">Pull non-attendees from past batches into a new webinar.</p>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[640px] bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[400px] flex flex-col">
          {!isSuccess ? (
            <div className="space-y-6">
              {/* 1. Batch Name */}
              <div className="space-y-2">
                <Label htmlFor="batchName" className="text-sm font-bold text-slate-700">Batch Name</Label>
                <Input 
                  id="batchName"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="h-10 border-slate-200 focus-visible:ring-primary/20"
                />
                <p className="text-[12px] text-slate-400">You can edit this name.</p>
              </div>

              {/* 2. Source Batches */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Source Batches *</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-10 justify-between font-normal border-slate-200 hover:bg-white"
                    >
                      <span className={selectedSources.length === 0 ? "text-slate-400" : "text-slate-900"}>
                        {selectedSources.length === 0 
                          ? "Select past batches" 
                          : `${selectedSources.length} batches selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[576px]" align="start">
                    {sourceOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option}
                        checked={selectedSources.includes(option)}
                        onCheckedChange={() => toggleSource(option)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {option}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-[12px] text-slate-400">Select one or more past batches. Non-attendees will be pooled automatically.</p>
              </div>

              {/* 3. Leads preview */}
              {selectedSources.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm font-bold text-slate-900">42 non-attendees found across selected batches.</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Duplicates removed. Opted-out leads excluded.</p>
                </div>
              )}

              {/* 4. Assign to Webinar */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Assign to Upcoming Webinar *</Label>
                <Select>
                  <SelectTrigger className="h-10 border-slate-200">
                    <SelectValue placeholder="Select webinar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BSW April Week 3 - Day 1">BSW April Week 3 - Day 1</SelectItem>
                    <SelectItem value="BSW May Week 1 - Orientation">BSW May Week 1 - Orientation</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[12px] text-slate-400">These leads will be enrolled in the selected webinar.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Re-invite batch created</h2>
              <div className="space-y-1">
                <p className="text-sm text-slate-600 font-medium">42 leads have been enrolled in BSW May Week 1 - Orientation.</p>
                <p className="text-sm text-slate-500">A communication sequence will be triggered via HubSpot.</p>
              </div>
              
              <div className="mt-10 flex flex-col gap-3 w-full max-w-[280px]">
                <Button className="h-11 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl w-full">
                  View enrolled leads →
                </Button>
                <Button 
                  variant="outline" 
                  className="h-11 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl w-full"
                  onClick={onBack}
                >
                  Back to {webinarTitle}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      {!isSuccess && (
        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            className="h-11 px-8 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl min-w-[140px]"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button 
            className="h-11 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl min-w-[140px]"
            onClick={() => setIsSuccess(true)}
          >
            Create Re-invite Batch
          </Button>
        </div>
      )}
    </div>
  );
};
