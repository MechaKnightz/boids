import { createStore } from "zustand";

interface AppProps {
  settings: {
    minSpeed: number,
    maxSpeed: number;
    perceptionRadius: number ;
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
  },
}
interface AppState extends AppProps {
  addBear: () => void
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
    }
  }
  return createStore<AppState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    addBear: () => set((state) => ({ ...state })),
  }))
}

export { createAppStore };
export type { AppStore, AppState };

