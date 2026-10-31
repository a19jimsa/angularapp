interface ArrayData {
  id: string;
  data: ArrayBufferView;
  format: 'binary' | 'image';
}

export class ArrayManager {
  private static arrays: Map<string, Float32Array | Uint8ClampedArray | []> =
    new Map();

  public static createCoords(key: string, size: number) {
    const coords = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < coords.length; i += 4) {
      coords[i + 0] = 255;
    }
    this.arrays.set(key, coords);
    return coords;
  }

  public static createPositions(key: string, amount: number) {
    const positions = new Float32Array(amount * 3);
    this.arrays.set(key, positions);
    return positions;
  }

  public static getCoords(key: string): Uint8ClampedArray {
    const array = this.arrays.get(key);
    if (!array) throw new Error('Could not get array with key ' + key);
    return array as Uint8ClampedArray;
  }

  public static getPositions(key: string): Float32Array {
    const array = this.arrays.get(key);
    if (!array) throw new Error('Could not get array with key ' + key);
    return array as Float32Array;
  }
}
