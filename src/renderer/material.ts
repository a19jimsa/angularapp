import { Shader } from './shader';
import { Texture } from './texture';

export enum BlendMode {
  Opaque = 'Opaque',
  AlphaBlend = 'Alpha Blend',
  Additive = 'Additive',
  Multiply = 'Multiply',
  Screen = 'Screen',
  AlphaMask = 'Alpha Mask',
  Premultiplied = 'Premultiplied',
}

export class Material {
  shader: Shader;
  depthWrite = false;

  blendMode: BlendMode = BlendMode.Additive;

  textures = new Set<Texture>();

  constructor(shader: Shader) {
    this.shader = shader;
  }
}
