import { Wifi, BatteryFull } from 'lucide-react';
export default function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <strong>9:41</strong>
      <span className="island" />
      <span className="status-icons">
        <Wifi />
        <BatteryFull />
      </span>
    </div>
  );
}
