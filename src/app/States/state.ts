import { Keyframe } from '../animation-creator/animation-creator.component';
import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';

export abstract class State {
  keyframes: Keyframe[] = [];
  constructor(private path: string) {
    this.loadAnimation();
  }
  async loadAnimation(): Promise<void> {
    try {
      const response = await fetch(this.path);
      this.keyframes = await response.json();
      console.log(this.keyframes);
    } catch (error) {
      console.log(error);
    }
  }
  abstract enter(skeleton: Skeleton): void;
  abstract execute(): void;
  abstract exit(skeleton: Skeleton): void;
  abstract handleInput(skeleton: Skeleton, input: KeysPressed): State | null;
  abstract update(skeleton: Skeleton): void;
}
