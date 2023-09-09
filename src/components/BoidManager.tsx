import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { Euler, Object3D, Raycaster, Vector3 } from "three";
import { useAppContext } from "../hooks/useAppContext";
import { BoidType } from "../types/BoidType";
import { Transform } from "../types/Transform";
import { Boid } from "./Boid";

const clamp = (num: number, min: number, max: number) => {
  return num <= min
    ? min
    : num >= max
      ? max
      : num
}

// const isHeadingForCollision: boolean = (position: Vector3, settings: Settings, forward: Vector3) => {
//   return Physics.SphereCast(position, settings.boundsRadius, forward, settings.collisionAvoidDst, settings.obstacleMask);
// }

const numViewDirections = 300;
const directions: Vector3[] = [];

const init = () => {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = Math.PI * 2 * goldenRatio;

  for (let i = 0; i < numViewDirections; i++) {
    const t = i / numViewDirections;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = angleIncrement * i;

    const x = Math.sin(inclination) * Math.cos(azimuth);
    const y = Math.sin(inclination) * Math.sin(azimuth);
    const z = Math.cos(inclination);
    directions[i] = new Vector3(x, y, z);
  }
}
init();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const computeBoids = (boids: BoidType[]) => {

  // if (boids === null || boids.length < 1) return

  // const numBoids = boids.length;
  // var boidData = new BoidData[numBoids];

  // for (int i = 0; i < boids.Length; i++) {
  //   boidData[i].position = boids[i].position;
  //   boidData[i].direction = boids[i].forward;
  // }

  // var boidBuffer = new ComputeBuffer(numBoids, BoidData.Size);
  // boidBuffer.SetData(boidData);

  // compute.SetBuffer(0, "boids", boidBuffer);
  // compute.SetInt("numBoids", boids.Length);
  // compute.SetFloat("viewRadius", settings.perceptionRadius);
  // compute.SetFloat("avoidRadius", settings.avoidanceRadius);

  //   int threadGroups = Mathf.CeilToInt(numBoids / (float) threadGroupSize);
  // compute.Dispatch(0, threadGroups, 1, 1);

  // boidBuffer.GetData(boidData);

  // for (int i = 0; i < boids.Length; i++) {
  //   boids[i].avgFlockHeading = boidData[i].flockHeading;
  //   boids[i].centreOfFlockmates = boidData[i].flockCentre;
  //   boids[i].avgAvoidanceHeading = boidData[i].avoidanceHeading;
  //   boids[i].numPerceivedFlockmates = boidData[i].numFlockmates;

  //   boids[i].UpdateBoid();
  // }

  // boidBuffer.Release();
}

const BoidManager: React.FC = () => {
  const [boids] = useState<BoidType[]>([{ acceleration: new Vector3(1, 1, 1), avgAvoidanceHeading: new Vector3(0, 0, 0), avgFlockHeading: new Vector3(0, 0, 0), cachedTransform: { position: new Vector3(0, 0, 0), rotation: new Euler(0, 0, 0, "XYZ") }, centerOfFlockmates: new Vector3(0, 0, 0), forward: new Vector3(0, 0, 0), numPerceivedFlockmates: 0, position: new Vector3(0, 0, 0), target: { position: new Vector3(0, 0, 0), rotation: new Euler(0, 0, 0, "XYZ") }, velocity: new Vector3(0, 0, 0) }]);
  const settings = useAppContext((s) => s.settings);

  const isHeadingForCollision = useCallback((position: Vector3, forward: Vector3, raycaster: Raycaster, obstacles: Object3D[]) => {
    raycaster.set(position, forward);
    raycaster.far = settings.collisionAvoidDst;

    return raycaster.intersectObjects(obstacles).length > 0
  }, [settings])

  const steerTowards = useCallback(
    (vector: Vector3, velocity: Vector3): Vector3 => {
      const v = vector.normalize().multiplyScalar(settings.maxSpeed).sub(velocity);
      return v.clampScalar(0, settings.maxSteerForce)
    }
    , [settings.maxSpeed, settings.maxSteerForce])

  const obstacleRays = useCallback((position: Vector3, forward: Vector3, cachedTransform: Transform, raycaster: Raycaster, obstacles: Object3D[]) => {
    for (let i = 0; i < directions.length; i++) {
      // const dir = cachedTransform.getWorldDirection(directions[i]);
      const dir = cachedTransform.position.applyEuler(cachedTransform.rotation).add(directions[i]);
      // const dir2 = directions[i].add(cachedTransform.position).applyAxisAngle(cachedTransform.rotation);
      raycaster.set(position, dir);
      raycaster.far = settings.collisionAvoidDst;
      raycaster.intersectObjects(obstacles)
      //todo spherecast
      // if (!Physics.SphereCast(ray, settings.boundsRadius, settings.collisionAvoidDst, settings.obstacleMask)) {
      //   return dir;
      // }
    }

    return forward;
  }, [settings.collisionAvoidDst])

  const updateBoid = useCallback((boid: BoidType, raycaster: Raycaster, delta: number, obstacles: Object3D[]) => {
    // eslint-disable-next-line no-debugger
    debugger;
    let acceleration = new Vector3(0, 0, 0);

    if (boid.target != null) {
      const offsetToTarget = (boid.target.position.sub(boid.position));
      acceleration = steerTowards(offsetToTarget, boid.velocity).multiplyScalar(settings.targetWeight);
    }

    if (boid.numPerceivedFlockmates != 0) {
      boid.centerOfFlockmates = boid.centerOfFlockmates.divideScalar(boid.numPerceivedFlockmates);

      const offsetToFlockmatesCenter = (boid.centerOfFlockmates.sub(boid.position));

      const alignmentForce = steerTowards(boid.avgFlockHeading, boid.velocity).multiplyScalar(settings.alignWeight);
      const cohesionForce = steerTowards(offsetToFlockmatesCenter, boid.velocity).multiplyScalar(settings.cohesionWeight);
      const seperationForce = steerTowards(boid.avgAvoidanceHeading, boid.velocity).multiplyScalar(settings.seperateWeight);

      acceleration = acceleration.add(alignmentForce);
      acceleration = acceleration.add(cohesionForce);
      acceleration = acceleration.add(seperationForce);
    }

    //todo pass array of obstacles
    if (isHeadingForCollision(boid.position, boid.forward, raycaster, obstacles)) {
      const collisionAvoidDir = obstacleRays(boid.position, boid.forward, boid.cachedTransform, raycaster, obstacles);
      const collisionAvoidForce = steerTowards(collisionAvoidDir, boid.velocity).multiplyScalar(settings.avoidCollisionWeight);
      acceleration = acceleration.add(collisionAvoidForce);
    }

    boid.velocity = boid.velocity.add(acceleration.multiplyScalar(delta));
    let speed = boid.velocity.length();
    const dir = boid.velocity.divideScalar(speed);
    speed = clamp(speed, settings.minSpeed, settings.maxSpeed);
    const velocity = dir.multiplyScalar(speed);

    const calcTrans = boid.cachedTransform.position.add(velocity.multiplyScalar(delta))
    boid.cachedTransform.position.x = calcTrans.x;
    boid.cachedTransform.position.y = calcTrans.y;
    boid.cachedTransform.position.z = calcTrans.z;

    //you are supposed to set forward

    const temp = new Object3D();
    temp.setRotationFromEuler(boid.cachedTransform.rotation);
    temp.position.x = boid.cachedTransform.position.x;
    temp.position.y = boid.cachedTransform.position.y;
    temp.position.z = boid.cachedTransform.position.z;
    temp.lookAt(dir.x, dir.y, dir.z);
    boid.cachedTransform.rotation = temp.rotation;
    boid.cachedTransform.position = temp.position;


    boid.position = boid.cachedTransform.position;
    boid.forward = dir;
  }, [isHeadingForCollision, obstacleRays, settings.alignWeight, settings.avoidCollisionWeight, settings.cohesionWeight, settings.maxSpeed, settings.minSpeed, settings.seperateWeight, settings.targetWeight, steerTowards])

  const scene = useThree(state => state.scene)

  useFrame((state, delta) => {
    computeBoids(boids);
    console.log(boids[0])
    for (const boid of boids) {
      updateBoid(boid, state.raycaster, delta, []);
    }
    console.log(boids[0])
    console.log(scene.children)
    scene.children[0].lookAt

  })

  return <>
    {boids.map((b) => <Boid boidData={b} />)}
  </>;
}

export { BoidManager };

