import { BoidType } from "../types/BoidType";

type BoidProps = {
	boidData: BoidType;
}

const Boid: React.FC<BoidProps> = ({ boidData }) => {
	// const settings = useAppContext((s) => s.settings);

	// useFrame((state, delta) => {

	// })

	return <mesh position={[boidData.position.x, boidData.position.y, boidData.position.z]}>
		<sphereGeometry args={[5, 5, 5]} />
	</mesh>;
}

export { Boid };

