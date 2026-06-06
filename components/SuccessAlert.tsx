"use client";

import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAlertProps {
  message: string;
  submessage?: string;
  visible: boolean;
  onClose?: () => void;
  autoHide?: number;
}

export default function SuccessAlert({
  message,
  submessage,
  visible,
  onClose,
  autoHide = 4000,
}: SuccessAlertProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      if (autoHide > 0) {
        const timer = setTimeout(() => {
          setShow(false);
          onClose?.();
        }, autoHide);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [visible, autoHide, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#0d2a24] border border-[#00d4aa]/30 rounded-2xl p-4 pr-12 shadow-2xl max-w-sm relative">
        <button
          onClick={() => {
            setShow(false);
            onClose?.();
          }}
          className="absolute top-3 right-3 text-[#5c5c5c] hover:text-[#a3a3a3] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-tb-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#f5f5f5]">{message}</p>
            {submessage && (
              <p className="text-xs text-[#a3a3a3] mt-0.5">{submessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
