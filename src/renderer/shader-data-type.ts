import { Renderer } from './renderer';

export enum ShaderType {
  Float,
  Float2,
  Float3,
  Float4,
  Mat3,
  Mat4,
  Int,
  Int1,
  Int2,
  Int3,
  Int4,
  bool,
}

export class ShaderDataType {
  static GetType(type: ShaderType) {
    const gl = Renderer.getGL;
    switch (type) {
      case ShaderType.Float:
        return gl.FLOAT;
      case ShaderType.Int:
        return gl.INT;
    }
    throw new Error('Type is not supported ' + type);
  }
}
