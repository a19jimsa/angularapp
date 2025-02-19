import { Attack } from 'src/components/attack';
import { Damage } from 'src/components/damage';
import { Idle } from 'src/components/idle';
import { Jump } from 'src/components/jump';
import { Run } from 'src/components/run';
import { Skeleton } from 'src/components/skeleton';
import { State, States } from 'src/components/state';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';

export class StateSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const state = ecs.getComponent<State>(entity, 'State');
      const idle = ecs.getComponent<Idle>(entity, 'Idle');
      const attack = ecs.getComponent<Attack>(entity, 'Attack');
      const run = ecs.getComponent<Run>(entity, 'Run');
      const jump = ecs.getComponent<Jump>(entity, 'Jump');
      const damage = ecs.getComponent<Damage>(entity, 'Damage');
      if (transform && skeleton && state) {
        if (idle) {
          if (state.state !== States.Idle) {
            state.state = States.Idle;
            this.changeAnimation(skeleton, state);
          }
        }
        if (run) {
          if (state.state !== States.Running) {
            state.state = States.Running;
            this.changeAnimation(skeleton, state);
          }
        }
        if (jump) {
          if (state.state !== States.Jump) {
            state.state = States.Jump;
            this.changeAnimation(skeleton, state);
          }
        }
        if (attack) {
          if (state.state !== States.Attacking) {
            state.state = States.Attacking;
            this.changeAnimation(skeleton, state);
          }
        }
        if (attack && jump) {
          if (state.state !== States.JumpAttack) {
            state.state = States.JumpAttack;
            this.changeAnimation(skeleton, state);
          }
        }
        if (damage) {
          if (state.state !== States.Damage) {
            state.state = States.Damage;
            this.changeAnimation(skeleton, state);
          }
        }
      }
    }
  }
  changeAnimation(skeleton: Skeleton, state: State) {
    skeleton.keyframes = ResourceManager.getAnimation(state);
  }
}
