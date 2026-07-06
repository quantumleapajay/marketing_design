
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from './ui/button';

export const BSWStartNew: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">BSW — Webinars</h1>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-6 font-bold rounded-xl">
          <Plus className="mr-2 h-5 w-5" />
          Add Webinar
        </Button>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center pb-20">
        <div className="bg-slate-50 p-12 rounded-3xl border border-dashed border-slate-200 max-w-md w-full">
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
            <h3 className="text-sm font-semibold text-gray-700 mb-1">No webinars yet</h3>
            <p className="text-xs text-gray-400 mb-4">
              Add your first BSW webinar to get started.
            </p>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-8 font-bold rounded-xl">
              <Plus className="mr-2 h-5 w-5" />
              Add Webinar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
