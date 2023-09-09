import { Vector3 } from "three";
import { Transform } from "./Transform";

export type BoidType = {
  position: Vector3;
  forward: Vector3;
  velocity: Vector3;

  acceleration: Vector3;
  avgFlockHeading: Vector3;
  avgAvoidanceHeading: Vector3;
  centerOfFlockmates: Vector3;
  numPerceivedFlockmates: number;

  cachedTransform: Transform;
  target: Transform;
}