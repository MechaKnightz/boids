import { Vector3 } from "three";

export type BoidData = {
  position: Vector3;
  direction: Vector3
  flockHeading: Vector3;
  flockCenter: Vector3;
  avoidanceHeading: Vector3;
  numFlockmates: number;
}