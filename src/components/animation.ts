import { MathUtils } from 'src/Utils/MathUtils';
import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Track<T> {
  keyframes: Keyframe<T>[] = [];

  constructor(public type: string) {}

  sample(time: number): T {
    const kf = this.keyframes;

    if (kf.length === 0) return null as T;

    for (let i = 0; i < kf.length - 1; i++) {
      const a = kf[i];
      const b = kf[i + 1];

      if (time >= a.time && time <= b.time) {
        const t = (time - a.time) / (b.time - a.time);

        return this.lerp(a.value, b.value, t);
      }
    }

    return kf[kf.length - 1].value;
  }

  private lerp(a: any, b: any, t: number): T {
    return MathUtils.interpolateKeyframe(a, b, t);
  }
}

export interface Keyframe<T> {
  value: T;
  time: number;
}

export class Animation extends Component {
  override type: string = 'Animation';
  animationName: string;
  tracks: Track<number | vec3 | boolean>[] = [];
  loop: boolean = false;
  speed: number = 0;
  time: number = 0;
  constructor(name: string) {
    super();
    this.animationName = name;
  }
}
