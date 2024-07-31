import { Component } from './components/component';
import { Entity } from './entity';

export class Ecs {
  private entities: Set<Entity> = new Set();
  private components: Map<Entity, Component[]> = new Map();
  constructor() {}

  getEntities(): Entity[] {
    return Array.from(this.components.keys());
  }

  createEntity(): Entity {
    const entity = Entity.createEntity();
    this.entities.add(entity);
    console.log('Added entity: ' + entity);
    return entity;
  }

  addComponent<T extends Component>(entity: Entity, component: T): void {
    if (!this.components.has(entity)) {
      this.components.set(entity, []);
    }
    this.components.get(entity)?.push(component);
    console.log(`Added component to entity ${entity}`);
    console.log(entity);
  }

  getComponent<T extends Component>(entity: Entity, name: string): T {
    const components = this.components.get(entity) || [];
    return components.find((e) => e.type == name) as T;
  }
}
