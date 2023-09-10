import { useAppContext } from "./useAppContext";

export const useDevice = () => {
  const device = useAppContext((s) => s.device);

  if (!device) throw new Error("Graphics device should have been loaded by here")

  return device;
}