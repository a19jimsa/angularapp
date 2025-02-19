import { Component } from '../components/component';
import { Entity } from '../app/entity';

export class Ecs {
  private entities: Set<Entity> = new Set();
  private components: Map<Entity, Component[]> = new Map();
  constructor() {}

  getEntities(): Entity[] {
    return Array.from(this.components.keys());
  }

  getPool<T extends Component[]>(...types: string[]): Array<T> {
    const pooledComponents: Array<T> = [];

    this.components.forEach((components) => {
      const foundComponents = types.map((type) =>
        components.find((comp) => comp.type === type)
      ) as T;

      // Kontrollera att alla komponenter finns
      if (foundComponents.every((comp) => comp !== undefined)) {
        pooledComponents.push(foundComponents);
      }
    });

    return pooledComponents;
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
    const type = this.components
      .get(entity)
      ?.find((e) => e.type === component.type);
    if (type) return;
    this.components.get(entity)?.push(component);
    console.log('Added', component);
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

  getComponent<T extends Component>(entity: Entity, name: string): T {
    const components = this.components.get(entity);
    const component = components?.find((e) => e.type === name) as T;
    return component;
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
}
