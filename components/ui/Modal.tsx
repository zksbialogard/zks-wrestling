"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

type ModalProps = {
  children: React.ReactNode;
  open?: boolean;
};

export function ModalHeader({ children, className = "" }: SectionProps) {
  return <div className={`zks-modal-header ${className}`.trim()}>{children}</div>;
}

export function ModalBody({ children, className = "" }: SectionProps) {
  return <div className={`zks-modal-body ${className}`.trim()}>{children}</div>;
}

export function ModalFooter({ children, className = "" }: SectionProps) {
  return <div className={`zks-modal-footer ${className}`.trim()}>{children}</div>;
}

export default function Modal({ children, open = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="zks-modal-overlay" role="dialog" aria-modal="true">
      <div className="zks-modal-panel zks-card">{children}</div>
    </div>,
    document.body
  );
}
