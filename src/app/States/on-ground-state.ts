import { Keyframe } from '../animation-creator/animation-creator.component';
import { JumpingState } from './jumping-state';
import { StateMachine } from './state-machine';

export class OnGroundState extends StateMachine {
  override enter(): void {
    this.keyframes;
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(input: string): void {
    throw new Error('Method not implemented.');
  }
  override update(): void {
    throw new Error('Method not implemented.');
  }
  override keyframes: Keyframe[] = new Array();
}
