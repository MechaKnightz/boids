import { CameraControls, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';

// let counter = 0;

const CustomCamera: React.FC = () => {
	const perspectiveRef = useRef<THREE.PerspectiveCamera>(null!);
	const controlsRef = useRef<CameraControls>(null!);

	// useFrame((_, delta) => {
	// 	counter += delta;
	// 	if (counter < 1) return;
	// 	console.log(ref.current.position);
	// 	console.log(ref.current.rotation);
	// 	counter = 0;
	// })

	return (
		<>
			<CameraControls
				ref={controlsRef}
				makeDefault
			/>
			<PerspectiveCamera ref={perspectiveRef} makeDefault position={[13.986006030156833, -38.31797708790839, 145.93753221163803]} rotation={[0.14151709719037472, 0.06741610256702998, -0.009597166719625325]}
			/>
		</>
	)
}

export { CustomCamera };

