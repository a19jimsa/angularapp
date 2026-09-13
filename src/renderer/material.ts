import { Shader } from './shader';
import { Texture } from './texture';

export enum CullMode {
  NONE = 0,
  CULL_FACE = 2884,
}

export enum BlendFactor {
  ONE = 1,
  SRC_ALPHA = 770,
  ONE_MINUS_SRC_ALPHA = 771,
}

export class Material {
  shader: Shader;
  depthWrite = false;

  blendSrc = BlendFactor.SRC_ALPHA;
  blendDst = BlendFactor.ONE_MINUS_SRC_ALPHA;

  blend: boolean = false;

  textures = new Set<Texture>();

  constructor(shader: Shader) {
    this.shader = shader;
  }
}
