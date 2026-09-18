'use client';
import { ChevronLeft } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
export default function InformationDialog({ title, content, onClose }) {
  const ref = useFocusTrap(onClose);
  return (
    <div className="sheet-overlay">
      <article
        ref={ref}
        className="reader-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button className="back" onClick={onClose}>
          <ChevronLeft size={17} /> Back
        </button>
        <h1 id="dialog-title">{title}</h1>
        {content.split('\n\n').map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </article>
    </div>
  );
}
