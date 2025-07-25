import { Entity } from '../app/entity';
import { Component } from '../components/component';

export class Ecs {
  private entities: Set<Entity> = new Set();
  private components: Map<Entity, Component[]> = new Map();
  constructor() {}

  getEntities(): Entity[] {
    return Array.from(this.components.keys());
  }

  getPool<T extends Component[]>(
    ...types: string[]
  ): { entity: Entity; components: T }[] {
    const pool: { entity: Entity; components: T }[] = [];

    this.components.forEach((components, entity) => {
      const foundComponents = types.map((type) =>
        components.find((comp) => comp.type === type)
      ) as T;

      // Kontrollera att alla komponenter finns
      if (foundComponents.every((comp) => comp !== undefined)) {
        pool.push({ entity, components: foundComponents });
      }
    });

    return pool;
  }

  createEntity(): Entity {
    const entity = Entity.createEntity();
    this.entities.add(entity);
    console.log('Added entity: ' + entity);
    return entity;
  }

  addComponent<T extends Component>(entity: Entity, component: T): T | null {
    if (!this.components.has(entity)) {
      this.components.set(entity, []);
    }
    const type = this.components
      .get(entity)
      ?.find((e) => e.type === component.type);
    if (type) return null;
    this.components.get(entity)?.push(component);
    return component;
  }

  removeComponent<T extends Component>(entity: Entity, componentType: string) {
    // Hämta komponentlistan för entiteten
    const components = this.components.get(entity) as T[];

    if (!components) return; // Om det inte finns några komponenter, gör ingenting

    // Filtrera bort den komponent du vill ta bort (baserat på typen)
    const updatedComponents = components.filter(
      (comp) => !(comp.type === componentType)
    );

    // Uppdatera komponentlistan i mappen
    if (updatedComponents.length > 0) {
      this.components.set(entity, updatedComponents); // Spara de uppdaterade komponenterna
    } else {
      this.components.delete(entity); // Om inga komponenter finns kvar, ta bort entiteten från mappen
    }
  }

  getComponent<T extends Component>(entity: Entity, name: string) {
    const components = this.components.get(entity);
    const component = components?.find((e) => e.type === name) as T;
    return component;
  }

  getComponents(entity: Entity) {
    const components = this.components.get(entity);
    if (!components) return [];
    return components;
  }

  removeEntity(entity: Entity) {
    // Ta bort entiteten och dess komponenter från komponentkartan
    if (this.components.has(entity)) {
      this.components.delete(entity);
    }
    // Om du har andra strukturer där entiteten hanteras, kan du behöva ta bort den därifrån också
    this.entities.delete(entity);
    console.log('Removed enity: ' + entity);
  }

  moveEntityToECS(entity: Entity, components: Component[]) {
    this.components.set(entity, components);
    return entity;
  }

  getEcs() {
    const json = JSON.stringify(Array.from(this.components.entries()));
    return json;
  }
}
