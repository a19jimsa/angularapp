import { Boss } from './boss.model';
import { GameObject } from './gameobject.model';
import { Player } from './player.model';
import { Shot } from './shot.model';
import { Vec } from './vec.model';

export class State {
  level: any;
  actors: GameObject[];
  status: any;
  constructor(level: { startActors: any }, actors: any, status: string) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  static start(level: { startActors: any }) {
    console.log('Hej detta är start');
    console.log(level);
    return new State(level, level.startActors, 'playing');
  }

  get shot(): Shot | undefined {
    return this.actors.find((a): a is Shot => !!a);
  }

  get player(): Player | undefined {
    return this.actors.find((a): a is Player => !!a);
  }

  get boss(): Boss | undefined {
    return this.actors.find((a): a is Boss => !!a);
  }

  scale = 20;
  isReleased = false;

  update(time: number, keys: any): State {
    var shotSpeed = 10;
    if (this.player == undefined) {
      console.log('Failed to find player!');
      return this;
    }
    if (keys.Enter && !this.isReleased) {
      console.log('pressed');

      if (this.player.dir) {
        this.actors.push(
          new Shot(
            new Vec(this.player.pos.X, this.player.pos.Y),
            new Vec(shotSpeed, 0),
            false
          )
        );
      } else {
        this.actors.push(
          new Shot(
            new Vec(this.player.pos.X, this.player.pos.Y),
            new Vec(-shotSpeed, 0),
            false
          )
        );
      }
    } else if (!keys.Enter) {
      this.isReleased = false;
    }

    let actors = this.actors.map((actor: GameObject) =>
      actor.update(time, this, keys)
    );

    let newState = new State(this.level, actors, this.status);
    if (newState.status !== 'playing') return newState;

    let player = newState.player;
    let boss = newState.boss;

    if (player == undefined) {
      console.log('nO player exist!!! ');
      return this;
    }

    if (this.level.touches(player.pos, player.size, 'lava')) {
      return new State(this.level, actors, 'lost');
    }

    let shots = this.actors.filter((a: { type: string }) => a.type === 'shot');
    for (let shot of shots) {
      newState = shot.collide(newState);
    }

    for (let actor of actors) {
      if (
        actor !== player &&
        actor !== boss &&
        actor.type !== 'shot' &&
        this.overlap(player, actor)
      ) {
        newState = actor.collide(newState);
      } else if (
        actor !== player &&
        actor.type !== 'enemy' &&
        boss != null &&
        this.overlap(player, actor)
      ) {
        newState = actor.collide(newState);
      }
    }

    if (boss != null) {
      if (boss.life <= 0) {
        newState = boss.explode(newState);
      }
    }
    return newState;
  }
  overlap(actor1: Player, actor2: GameObject): boolean {
    console.log(actor1, actor2);
    return (
      actor1.pos.X + actor1.size.X > actor2.pos.X &&
      actor1.pos.X < actor2.pos.X + actor2.size.X &&
      actor1.pos.Y + actor1.size.Y > actor2.pos.Y &&
      actor1.pos.Y < actor2.pos.Y + actor2.size.Y
    );
  }
}
