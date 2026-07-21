import { vec3 } from 'gl-matrix';
import { Entity } from 'src/app/entity';
import { Component } from 'src/components/component';
import { MathUtils } from 'src/Utils/MathUtils';

type TimeBox = {
  width: number;
  value: number;
  position: number;
};

export class AnimationPlayer {
  name: string;
  tracks: Track<any>[] = [];
  loopedTime: number = 0;
  lifetime: number = 0;
  playing: boolean = false;
  zoom: number = 100;
  timelines: TimeBox[] = new Array();

  constructor(name: string) {
    this.name = name;
  }
}

export class Track<T> {
  componentID: string;
  property: string;
  entity: Entity;
  target: any;
  keyframes: Keyframe<T>[] = new Array();

  constructor(
    componentID: string,
    property: string,
    entity: Entity,
    component: Component,
  ) {
    this.componentID = componentID;
    this.property = property;
    this.entity = entity;
    this.target = component;
  }

  evaluate(time: number) {
    const keyframe = this.keyframes;
    if (keyframe.length === 0) return null;

    for (let i = 0; i < keyframe.length - 1; i++) {
      const a = keyframe[i];
      const b = keyframe[i + 1];

      if (time >= a.time && time <= b.time) {
        const t = (time - a.time) / (b.time - a.time);

        const va = a.value;
        const vb = b.value;

        if (typeof va === 'number') {
          return MathUtils.interpolateKeyframe(va as number, vb as number, t);
        }

        if (typeof va === 'boolean') {
          return time >= b.time ? vb : va;
        }

        if (
          this.property === 'position' ||
          this.property === 'rotation' ||
          this.property === 'scale'
        ) {
          // vec3
          const v1 = va as vec3;
          const v2 = vb as vec3;
          return vec3.fromValues(
            MathUtils.interpolateKeyframe(v1[0], v2[0], t),
            MathUtils.interpolateKeyframe(v1[1], v2[1], t),
            MathUtils.interpolateKeyframe(v1[2], v2[2], t),
          );
        }
        throw new Error('Could not evaulate any keyframe of ' + this.property);
      }
      return keyframe[keyframe.length - 1].value;
    }
    return null;
  }
}

export type Keyframe<T> = {
  value: T;
  time: number;
};
