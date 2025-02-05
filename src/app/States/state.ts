import { Keyframe } from '../animation-creator/animation-creator.component';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../Systems/controller-system';

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
  abstract enter(entity: Entity, ecs: Ecs): void;
  abstract exit(entity: Entity, ecs: Ecs): void;
  abstract handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null;
  abstract update(entity: Entity, ecs: Ecs): void;
}
