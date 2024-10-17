import { Attack } from "../components/attack";
import { AttackDuration } from "../components/attack-duration";
import { Ecs } from "../ecs";

export class AttackDurationSystem {
    update(ecs: Ecs){
        for(const entity of ecs.getEntities()){
            const attack = ecs.getComponent<Attack>(entity, "Attack");
            const attackDuration = ecs.getComponent<AttackDuration>(entity, "AttackDuration");
            if(attack && attackDuration){
                attackDuration.duration -= 0.16;
                if(attackDuration.duration <= 0){
                    ecs.removeComponent<Attack>(entity, "Attack");
                    ecs.removeComponent<AttackDuration>(entity, "AttackDuration");
                    console.log("Tog bort attack");
                }
            }
        }
    }
}
