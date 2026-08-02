import { vec3 } from 'gl-matrix';
import { Target, Texture } from 'src/renderer/texture';

export class Particle {
  position: vec3 = vec3.fromValues(0, 0, 0);
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  sizeBegin: number = 1;
  sizeEnd: number = 1;
  rotation: number = 0;
  lifetime: number = 10;
  age: number = 0;
  active: boolean = false;
}

export class ParticleProp {
  position: vec3 = vec3.fromValues(250, 3, 250);
  angleMin: number = 0;
  angleMax: number = 0;
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  direction: vec3 = vec3.fromValues(0, 0, 0);
  angularVelocity: vec3 = vec3.fromValues(0, 0, 0);
  spread: number = 45;
  initialVelocityMin: number = 0;
  initialVelocityMax: number = 0;
  gravity: vec3 = vec3.fromValues(0, 0, 0);
  color: vec3 = vec3.fromValues(0, 0, 0);
  rotation: vec3 = vec3.fromValues(0, 0, 0);
  scaleCurveX: Texture = new Texture(
    new Uint8ClampedArray(256 * 4).fill(255),
    Target.TEXTURE_2D,
    256,
    1,
    'u_scaleX',
    false,
  );
  scaleCurveY: Texture = new Texture(
    new Uint8ClampedArray(256 * 4).fill(255),
    Target.TEXTURE_2D,
    256,
    1,
    'u_scaleY',
    false,
  );
  scaleCurveZ: Texture = new Texture(
    new Uint8ClampedArray(256 * 4).fill(255),
    Target.TEXTURE_2D,
    256,
    1,
    'u_scaleZ',
    false,
  );
  opacityCurve: Texture = new Texture(
    new Uint8ClampedArray(256 * 4).fill(255),
    Target.TEXTURE_2D,
    256,
    1,
    'u_opacityCurve',
    false,
  );
  colorCurve: Texture = new Texture(
    new Uint8ClampedArray(256 * 4).fill(255),
    Target.TEXTURE_2D,
    256,
    1,
    'u_colorCurve',
    false,
  );

  minRotationX: number = 0;
  maxRotationX: number = 0;
  minRotationY: number = 0;
  maxRotationY: number = 0;
  minRotationZ: number = 0;
  maxRotationZ: number = 0;
  minRotationSpeed: number = 0;
  maxRotationSpeed: number = 0;

  scale: vec3 = vec3.fromValues(1, 1, 1);
  velocityMin: number = 0;
  velocityMax: number = 0;
  lifetime: number = 1;
  lifetimeRandomness: number = 0;
  emissionOffset: vec3 = vec3.fromValues(1, 1, 1);
  emissionScale: vec3 = vec3.fromValues(0, 0, 0);
}
