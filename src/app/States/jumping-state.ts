import { Keyframe } from '../animation-creator/animation-creator.component';
import { StateMachine } from './state-machine';

export class JumpingState extends StateMachine {
  override keyframes: Keyframe[] = new Array();

  override enter(): void {
    throw new Error('Method not implemented.');
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
}