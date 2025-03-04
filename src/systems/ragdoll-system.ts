import { Ragdoll } from 'src/components/ragdoll';
import { Skeleton } from 'src/components/skeleton';
import { Ecs } from 'src/core/ecs';

export class RagdollSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Skeleton, Ragdoll]>("Skeleton", "Ragdoll");
    pool.forEach(({entity, components}) =>{
      const [skeleton, ragdoll] = components;
      for(const bone of skeleton.bones){
        
      }
    });
  }
}
