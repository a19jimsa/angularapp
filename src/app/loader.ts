import { Keyframe } from './animation-creator/animation-creator.component';
import { Bone } from '../components/bone';

export class Loader {
  static async loadFromJSON(path: string): Promise<Bone[]> {
    const response = await fetch(path);
    return await response.json();
  }
  static async loadKeyframesFromJSON(path: string): Promise<Keyframe[]> {
    const response = await fetch(path);
    return await response.json();
  }
}
