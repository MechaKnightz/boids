import { Object3D, Vector3 } from "three";

export type BoidType = {
  position: Vector3;
  forward: Vector3;
  velocity: Vector3;

  acceleration: Vector3;
  avgFlockHeading: Vector3;
  avgAvoidanceHeading: Vector3;
  centerOfFlockmates: Vector3;
  numPerceivedFlockmates: number;

  cachedTransform: Object3D;
  target: Object3D;
}