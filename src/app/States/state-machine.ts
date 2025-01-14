import { Keyframe } from '../animation-creator/animation-creator.component';

export abstract class StateMachine {
  keyframes: Keyframe[] = [];
  async loadAnimation(directory: string): Promise<Keyframe[]> {
    const response = await fetch(directory);
    return await response.json();
  }
  abstract enter(): void;
  abstract execute(): void;
  abstract exit(): void;
  abstract handleInput(input: string): void;
  abstract update(): void;
}
