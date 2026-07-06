
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { ShieldAlert, LogIn, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface SessionExpiredModalProps {
  open: boolean;
  onReLogin: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ open, onReLogin }) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-red-50 p-8 flex flex-col items-center justify-center border-b border-red-100">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4"
          >
            <Clock className="w-8 h-8 text-red-500 animate-pulse" />
          </motion.div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Session Expired</h2>
        </div>

        <div className="p-8 space-y-6 text-center">
          <p className="text-slate-500 font-medium leading-relaxed">
            For your security, your session has timed out due to <span className="text-slate-900 font-bold">24 hours</span> of inactivity.
            Any unsaved changes may be lost.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 font-medium leading-normal">
              Your account remains secure. Please log in again to resume your work where you left off.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 gap-3 sm:justify-center border-t border-slate-100">
          <Button 
            onClick={onReLogin} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-12 shadow-lg shadow-slate-200 gap-2"
          >
            <LogIn className="w-4 h-4" />
            Re-authenticate Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
