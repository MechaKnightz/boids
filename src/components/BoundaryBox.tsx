import { useRef } from 'react';
import { Mesh } from 'three';

type BoundaryBoxProps = {
	size: [x: number, y: number, z: number]
}

const BoundaryBox: React.FC<BoundaryBoxProps> = ({ size }) => {
	const ref = useRef<Mesh>(null!)

	const rotation: [x: number, y: number, z: number] = [0.6, -0.8, 0];

	return (
		<group
			rotation={rotation}
		>
			<mesh
				renderOrder={1}
				ref={ref}>
				<boxGeometry args={size} />
				<meshStandardMaterial color={'grey'} transparent opacity={0.5} />
				{/* <planeBufferGeometry /> */}
			</mesh>
			<mesh
				position={[0, -25.5, 0]}
				ref={ref}>
				<boxGeometry args={[size[0], 1, size[2]]} />
				<meshStandardMaterial color={'black'} transparent opacity={0.5} />
			</mesh>
		</group>


	)
}

export { BoundaryBox };

