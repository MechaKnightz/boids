import { useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useState } from "react";
import { Euler, Object3D, Raycaster, Vector3 } from "three";
import boidShader from '../assets/boid-shader.wgsl?raw';
import { useAppContext } from "../hooks/useAppContext";
import { useDevice } from "../hooks/useDevice";
import { Settings } from "../store";
import { BoidType } from "../types/BoidType";
import { Boid } from "./Boid";

let time = 0;

const boidsOutBufferStride = (Float32Array.BYTES_PER_ELEMENT * 3 * 3 + Int32Array.BYTES_PER_ELEMENT);

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
const computeBoids = (boids: BoidType[], boidsBuffer: GPUBuffer, device: GPUDevice, bindGroupLayout: GPUBindGroupLayout, pipeline: GPUComputePipeline, settings: Settings, simParamsBuffer: GPUBuffer, boidsOutBuffer: GPUBuffer, boidsOutReadBuffer: GPUBuffer) => {

  const stride = 2 * 3; //boiddata size in number of floats
  const boidsData = new Float32Array(boids.length * stride)
  let j = 0;

  for (let i = 0; i < boids.length; i++) {

    //position
    boidsData[j] = boids[i].position.x;
    boidsData[j + 1] = boids[i].position.y;
    boidsData[j + 2] = boids[i].position.z;

    //direction
    boidsData[j + 1] = boids[i].forward.x;
    boidsData[j + 3] = boids[i].forward.y;
    boidsData[j + 4] = boids[i].forward.z;

    j = i * stride;
  }

  const simParamsData = new Float32Array([settings.perceptionRadius, settings.avoidanceRadius]);

  // Populate the boidsData array with your Boid data here
  device.queue.writeBuffer(boidsBuffer, 0, boidsData);
  device.queue.writeBuffer(simParamsBuffer, 0, simParamsData);

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: boidsBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: simParamsBuffer,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: boidsOutBuffer,
        },
      },
    ],
  });

  // Dispatch the shader
  const encoder = device.createCommandEncoder();
  const computePass = encoder.beginComputePass();
  computePass.setPipeline(pipeline);
  computePass.setBindGroup(0, bindGroup);
  computePass.dispatchWorkgroups(Math.ceil(boids.length / 256), 1, 1); // Adjust workgroup size as needed
  computePass.end();

  encoder.copyBufferToBuffer(boidsOutBuffer, 0, boidsOutReadBuffer, 0, boidsOutBufferStride);

  device.queue.submit([encoder.finish()]);

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

const secondPos = new Object3D()
secondPos.position.x = 10;

const BoidManager: React.FC = () => {

  const settings = useAppContext((s) => s.settings);
  const device = useDevice()

  const startSpeed = (settings.minSpeed + settings.maxSpeed) / 2;
  const [boids, setBoids] = useState<BoidType[]>([
    { acceleration: new Vector3(1, 1, 1), avgAvoidanceHeading: new Vector3(0, 0, 0), avgFlockHeading: new Vector3(0, 0, 0), cachedTransform: new Object3D, centerOfFlockmates: new Vector3(0, 0, 0), forward: new Vector3(0, 0, 1), numPerceivedFlockmates: 0, position: new Vector3(0, 0, 0), target: new Object3D, velocity: new Vector3(0, 0, 1).multiplyScalar(startSpeed) },
    { acceleration: new Vector3(1, 1, 1), avgAvoidanceHeading: new Vector3(0, 0, 0), avgFlockHeading: new Vector3(0, 0, 0), cachedTransform: secondPos, centerOfFlockmates: new Vector3(0, 0, 0), forward: new Vector3(0, 0, 1), numPerceivedFlockmates: 0, position: new Vector3(50, 50, 0), target: new Object3D, velocity: new Vector3(0, 0, 1).multiplyScalar(startSpeed) }
  ]);

  const isHeadingForCollision = useCallback((position: Vector3, forward: Vector3, raycaster: Raycaster, obstacles: Object3D[]) => {
    raycaster.set(position, forward);
    raycaster.far = settings.collisionAvoidDst;

    return raycaster.intersectObjects(obstacles).length > 0
  }, [settings]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { shaderModule, bindGroupLayout, pipelineLayout, pipeline, boidsBuffer, boidsBufferSize, boidsOutReadBuffer, simParamsBuffer, boidsOutBuffer } = useMemo(() => {

    const shaderModule = device.createShaderModule({
      code: boidShader
    });

    // Create a bind group layout and pipeline layout
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "read-only-storage",
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "uniform",
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
          },
        },
      ],
    });

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    const pipeline = device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "main",
      },
    });

    const boidsBufferSize = boids.length * (Float32Array.BYTES_PER_ELEMENT * 3 * 2);
    const boidsBuffer = device.createBuffer({
      size: boidsBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const simParamsBufferSize = Float32Array.BYTES_PER_ELEMENT * 2;
    const simParamsBuffer = device.createBuffer({
      size: simParamsBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const boidsOutBufferSize = boids.length * boidsOutBufferStride;
    const boidsOutBuffer = device.createBuffer({
      size: boidsOutBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const boidsOutReadBuffer = device.createBuffer({ size: boidsOutBufferSize, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });

    return { shaderModule, bindGroupLayout, pipelineLayout, pipeline, boidsBuffer, boidsBufferSize, simParamsBuffer, simParamsBufferSize, boidsOutBuffer, boidsOutBufferSize, boidsOutReadBuffer }
  }, [boids.length, device])

  const steerTowards = useCallback(
    (vector: Vector3, velocity: Vector3): Vector3 => {
      const v = vector.normalize().multiplyScalar(settings.maxSpeed).sub(velocity);
      return v.clampScalar(0, settings.maxSteerForce)
    }
    , [settings.maxSpeed, settings.maxSteerForce])

  const obstacleRays = useCallback((position: Vector3, forward: Vector3, cachedTransform: Object3D, raycaster: Raycaster, obstacles: Object3D[]) => {
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

    let acceleration = new Vector3(0, 0, 0);

    if (boid.target != null) {

      const offsetToTarget = (boid.target.position.sub(boid.position).addScalar(1));
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
    boid.cachedTransform.setRotationFromEuler(new Euler(dir.x, dir.y, dir.z, "XYZ"));
    boid.position = boid.cachedTransform.position;
    boid.forward = dir;
  }, [isHeadingForCollision, obstacleRays, settings.alignWeight, settings.avoidCollisionWeight, settings.cohesionWeight, settings.maxSpeed, settings.minSpeed, settings.seperateWeight, settings.targetWeight, steerTowards])


  useFrame((state, delta) => {
    computeBoids(boids, boidsBuffer, device, bindGroupLayout, pipeline, settings, simParamsBuffer, boidsOutBuffer, boidsOutReadBuffer);

    for (const boid of boids) {
      updateBoid(boid, state.raycaster, delta, []);
    }
    setBoids([...boids.map((b) => ({ ...b }))])

    time += delta;
    if (time > 1) {
      console.log(boids)
      time = 0;
    }
  })

  return <>
    {boids.map((b, i) => <Boid key={i} boidData={b} />)}
  </>;
}

export { BoidManager };

