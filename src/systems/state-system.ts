import { Attack } from 'src/components/attack';
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
      if (transform && skeleton && state) {
        if (idle) {
          if (state.state !== States.Idle) {
            state.state = States.Idle;
            skeleton.keyframes = ResourceManager.getAnimation(state);
            console.log('idle');
            ecs.removeComponent<Idle>(entity, 'Run');
            ecs.removeComponent<Attack>(entity, 'Attack');
            ecs.removeComponent<Jump>(entity, 'Jump');
          }
          idle.timer++;
        }
        if (attack) {
          if (state.state !== States.Attacking) {
            state.state = States.Attacking;
            skeleton.keyframes = ResourceManager.getAnimation(state);
            console.log('Attacking');
            ecs.removeComponent<Idle>(entity, 'Idle');
          }
          if (attack.timer > 20) {
            ecs.removeComponent<Attack>(entity, 'Attack');
            ecs.addComponent<Idle>(entity, new Idle());
          }
          console.log(attack.timer);
          attack.timer++;
        }
        if (run) {
          if (state.state !== States.Running) {
            state.state = States.Running;
            skeleton.keyframes = ResourceManager.getAnimation(state);
            console.log('Running');
            ecs.removeComponent<Idle>(entity, 'Idle');
          }
          if (transform.velocity.X === 0) {
            ecs.addComponent<Idle>(entity, new Idle());
          }
        }
        if (jump) {
          if (state.state !== States.Jump) {
            state.state = States.Jump;
            skeleton.keyframes = ResourceManager.getAnimation(state);
            console.log('Jumping');
            ecs.removeComponent<Idle>(entity, 'Idle');
            ecs.removeComponent<Run>(entity, 'Run');
          }
          if (transform.velocity.Y === 0) {
            ecs.addComponent<Idle>(entity, new Idle());
            ecs.removeComponent<Run>(entity, 'Jump');
          }
        }
      }
    }
  }
}
