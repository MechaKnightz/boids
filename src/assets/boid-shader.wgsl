

struct Boid {
    position: vec3<f32>,
    direction: vec3<f32>,
};

struct Boids {
  boids: array<Boid>,
}

struct BoidOutData {
    flockHeading: vec3<f32>,
    flockCenter: vec3<f32>,
    separationHeading: vec3<f32>,
    numFlockmates: i32,
}

struct BoidsOutData {
  boids: array<BoidOutData>,
}

struct SimParams {
  viewRadius: f32,
  avoidRadius: f32,
}

@binding(0) @group(0) var<storage, read> bData : Boids;
@binding(1) @group(0) var<uniform> simParams : SimParams;
@binding(2) @group(0) var<storage, read_write> bOutData : BoidsOutData;

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>, @builtin(workgroup_id) workgroup_id: vec3<u32>, @builtin(local_invocation_id) local_invocation_id: vec3<u32>, @builtin(local_invocation_index) local_invocation_index: u32, @builtin(num_workgroups) num_workgroups: vec3<u32>) {
    let indexB: u32 = 0u;
    let numBoids = arrayLength(&bData.boids);

    let workgroup_index = workgroup_id.x + workgroup_id.y * num_workgroups.x + workgroup_id.z * num_workgroups.x * num_workgroups.y;

    let global_invocation_index = workgroup_index + local_invocation_index;

    for (var i = 0u; i < numBoids; i++) {
        if global_invocation_index != indexB {
            var boidB: Boid = bData.boids[indexB];
            let offset: vec3<f32> = boidB.position - bData.boids[global_invocation_index].position;
            let sqrDst: f32 = offset.x * offset.x + offset.y * offset.y + offset.z * offset.z;

            if sqrDst < simParams.viewRadius * simParams.viewRadius {
                bOutData.boids[global_invocation_index].numFlockmates = bOutData.boids[global_invocation_index].numFlockmates + 1;
                bOutData.boids[global_invocation_index].flockHeading = bOutData.boids[global_invocation_index].flockHeading + boidB.direction;
                bOutData.boids[global_invocation_index].flockCenter = bOutData.boids[global_invocation_index].flockCenter + boidB.position;

                if sqrDst < simParams.avoidRadius * simParams.avoidRadius {
                    bOutData.boids[global_invocation_index].separationHeading = bOutData.boids[global_invocation_index].separationHeading - offset / sqrDst;
                }
            }
        }
    }
}