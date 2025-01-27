import { Keyframe } from '../animation-creator/animation-creator.component';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';

export abstract class State {
  keyframes: Keyframe[] = [];
  constructor(private path: string) {
    this.loadAnimation();
  }
  private async loadAnimation(): Promise<void> {
    try {
      const response = await fetch(this.path);
      this.keyframes = await response.json();
    } catch (error) {
      console.log(error);
    }
  }
  abstract enter(skeleton: Skeleton): void;
  abstract exit(skeleton: Skeleton): void;
  abstract handleInput(transform: Transform, input: KeysPressed): State | null;
  abstract update(skeleton: Skeleton): void;
}
