import { useOpenClawContext } from '../config/OpenClawProvider';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function OpenClawStatus() {
  const { connected, connecting, error } = useOpenClawContext();
  
  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-500" title="Connecting to OpenClaw...">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-xs">Connecting...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500" title={error}>
        <WifiOff size={14} />
        <span className="text-xs">Disconnected</span>
      </div>
    );
  }
  
  if (connected) {
    return (
      <div className="flex items-center gap-2 text-green-500" title="Connected to OpenClaw Gateway">
        <Wifi size={14} />
        <span className="text-xs">Connected</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-gray-400" title="Not connected">
      <WifiOff size={14} />
      <span className="text-xs">Offline</span>
    </div>
  );
}

export default OpenClawStatus;
