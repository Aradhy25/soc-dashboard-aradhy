import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
};

export function Modal({ isOpen, onClose, title, children, size = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#000509]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative ${sizeClasses[size]} w-full max-h-[90vh] bg-gradient-to-br from-[#0a1628] to-[#000913] rounded-lg border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.3)] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#00f0ff]/20">
          <h2 className="text-xl text-[#00f0ff]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/50 hover:bg-[#0a1628] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <X className="w-5 h-5 text-[#00f0ff]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
