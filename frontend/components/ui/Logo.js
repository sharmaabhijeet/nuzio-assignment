import { AudioLines } from 'lucide-react';
export default function Logo({ large = false }) {
  return (
    <div className={`logo ${large ? 'large' : ''}`}>
      <AudioLines aria-hidden="true" />
      <strong>
        Nuzio<span>AI</span>
      </strong>
    </div>
  );
}
