import { Canvas } from "@react-three/fiber"
import { BoidManager } from "./components/BoidManager"
import { BoundaryBox } from "./components/BoundaryBox"
import { CustomCamera } from "./components/CustomCamera"

const CustomCanvas = () => {
  const boundary: [x: number, y: number, z: number] = [100, 50, 100];

  return (
    <>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <BoundaryBox size={boundary} />

        <BoidManager />
        <CustomCamera />
      </Canvas>,
    </>
  )
}

export {
  CustomCanvas
}

