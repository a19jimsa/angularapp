export class Entity {
  static id: number = 0;

  static createEntity(): number {
    return Entity.id++;
  }
}
