import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

type BoidProps = {
	flockHeading: Vector3;
	flockCenter: Vector3;
	avoidanceHeading: Vector3;
	numFlockmates: number;
}

const Boid: React.FC<BoidProps> = ({ flockHeading }) => {
	// const settings = useAppContext((s) => s.settings);

	useFrame((state, delta) => {

	})

	return null;
}

export { Boid };

