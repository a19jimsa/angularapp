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

export const BlendModeLabels: Record<BlendMode, string> = {
  [BlendMode.Opaque]: 'Opaque',
  [BlendMode.Additive]: 'Additive',
  [BlendMode.Multiply]: 'Multiply',
  [BlendMode.Screen]: 'Screen',
  [BlendMode.Premultiplied]: 'Premultiplied Alpha',
  [BlendMode.AlphaMask]: 'Alpha Mask',
  [BlendMode.AlphaBlend]: 'Alpha Blend',
};

export class Material {
  shader: Shader;
  depthWrite = true;
  blendMode: BlendMode = BlendMode.Opaque;
  textures = new Set<Texture>();

  constructor(shader: Shader) {
    this.shader = shader;
  }
}
