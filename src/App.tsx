import { Canvas, } from '@react-three/fiber'
import './App.css'
import { BoundaryBox } from './components/BoundaryBox'
import { Box } from './components/Box'
import { CustomCamera } from './components/Camera'

const App: React.FC = () => {

  return (
    <>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        <BoundaryBox rotation={[0.6, -0.8, 0]} />

        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <CustomCamera />
      </Canvas>,
    </>
  )
}

export default App
