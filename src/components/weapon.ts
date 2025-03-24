import { Vec } from '../app/vec';
import { Component } from './component';

export enum WeaponType {
  Sword,
  Schyte,
  Axe,
  Spell,
  Healing,
  Bow,
  Projectile,
  Dagger,
}

export class Weapon extends Component {
  override type = 'Weapon';
  parentId: string | null;
  scale: Vec;
  pivot: Vec;
  rotation: number;
  order: number;
  weaponType: WeaponType;
  flip: boolean;

  constructor(parentId: string | null, offset: Vec, weaponType: WeaponType) {
    super();
    this.parentId = parentId;
    this.scale = new Vec(0, 0);
    this.pivot = new Vec(offset.x, offset.y);
    this.rotation = 0;
    this.order = 0;
    this.flip = false;
    this.weaponType = weaponType;
  }
}
