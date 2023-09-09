import { Canvas, } from '@react-three/fiber'
import './App.css'
import { Box } from './components/Box'

const App = () => {

  return (
    <>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <perspectiveCamera />
      </Canvas>,
    </>
  )
}

export default App
