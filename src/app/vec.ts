export class Vec {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public plus(other: Vec): Vec {
    const x = this.x + other.x;
    const y = this.y + other.y;
    return new Vec(x, y);
  }
  public times(factor: number): Vec {
    const x = this.x * factor;
    const y = this.y * factor;
    return new Vec(x, y);
  }
  public minus(other: Vec): Vec {
    const x = this.x - other.x;
    const y = this.y - other.y;
    return new Vec(x, y);
  }

  public dotProduct(a: Vec): number {
    //Scalar
    return this.x * a.x + this.y * a.y;
  }

  public dist(other: Vec): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vec {
    const magnitude = this.mag();
    const x = this.x / magnitude;
    const y = this.y / magnitude;
    return new Vec(x, y);
  }
}
