import { Material } from 'src/renderer/material';

export class MaterialManager {
  private static materials = new Map<string, Material>();

  public static add(id: string, material: Material) {
    this.materials.set(id, material);
  }

  public static get(id: string) {
    return this.materials.get(id);
  }
}
