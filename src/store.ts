import { createStore } from "zustand";

export type Settings = {
  minSpeed: number,
  maxSpeed: number;
  perceptionRadius: number;
  avoidanceRadius: number;
  maxSteerForce: number;

  alignWeight: number;
  cohesionWeight: number;
  seperateWeight: number;

  targetWeight: number;

  obstacleMask: number; // todo
  boundsRadius: number;
  avoidCollisionWeight: number;
  collisionAvoidDst: number;
}

interface AppProps {
  settings: Settings,
  device: undefined | GPUDevice
}
interface AppState extends AppProps {
  setDevice: (device: GPUDevice) => void
}

type AppStore = ReturnType<typeof createAppStore>

const createAppStore = (initProps?: Partial<AppProps>) => {
  const DEFAULT_PROPS: AppProps = {
    settings: {
      minSpeed: 2,
      maxSpeed: 5,
      perceptionRadius: 2.5,
      avoidanceRadius: 1,
      maxSteerForce: 3,

      alignWeight: 1,
      cohesionWeight: 1,
      seperateWeight: 1,

      targetWeight: 1,

      obstacleMask: 0, // todo
      boundsRadius: .27,
      avoidCollisionWeight: 10,
      collisionAvoidDst: 5,
    },
    device: undefined
  }
  return createStore<AppState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setDevice: (device) => set((state) => ({ ...state, device })),
  }))
}

export { createAppStore };
export type { AppStore, AppState };

