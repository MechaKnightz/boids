import { useEffect, useState } from "react";
import { CustomCanvas } from "../CustomCanvas";
import { useAppContext } from "../hooks/useAppContext";

const WGPUInitializer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const device = useAppContext((s) => s.device);
  const setDevice = useAppContext((s) => s.setDevice)

  useEffect(() => {
    const start = async () => {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) { return; }
        const device = await adapter.requestDevice();
        setDevice(device);
        setLoading(false);
      }
      catch (e) {
        setLoading(false)
      }
    }
    start();
  }, [setDevice]);

  if (loading)
    return <div>loading...</div>

  console.log(device)
  return device ? <CustomCanvas /> : <div>Error loading WGPU adapter/device, make sure you have WGPU enabled</div>
}

export { WGPUInitializer };

