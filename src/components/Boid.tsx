import { BoidType } from "../types/BoidType";

type BoidProps = {
	boidData: BoidType;
}

const Boid: React.FC<BoidProps> = () => {
	// const settings = useAppContext((s) => s.settings);

	// useFrame((state, delta) => {

	// })

	return <mesh>
		<sphereGeometry args={[5, 5, 5]} />
	</mesh>;
}

export { Boid };

