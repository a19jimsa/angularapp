import { Keyframe } from './animation-creator/animation-creator.component';
import { Bone } from '../components/bone';
import { Vec } from './vec';

export class Loader {
  static async loadFromJSON(path: string): Promise<Bone[]> {
    const response = await fetch(path);
    const bones: Bone[] = await response.json();
    for (const bone of bones) {
      bone.position = new Vec(bone.position.X, bone.position.Y);
      bone.pivot = new Vec(bone.pivot.X, bone.pivot.Y);
    }
    return bones;
  }
  static async loadKeyframesFromJSON(path: string): Promise<Keyframe[]> {
    const response = await fetch(path);
    return await response.json();
  }
}
