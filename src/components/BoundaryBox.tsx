import { MeshProps } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh, } from 'three'

const BoundaryBox: React.FC<MeshProps> = (props) => {
    const ref = useRef<Mesh>(null!)
    return (
        <mesh
            {...props}
            ref={ref}>
            <boxGeometry args={[100, 50, 100]} />

            <meshStandardMaterial color={'blue'} transparent opacity={0.5} />
        </mesh>
    )
}

export { BoundaryBox }

