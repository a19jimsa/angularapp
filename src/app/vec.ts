export class Vec {
  private x: number;
  private y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  get X(): number {
    return this.x;
  }
  get Y(): number {
    return this.y;
  }

  set X(x: number) {
    this.x = x;
  }

  set Y(y: number) {
    this.y = y;
  }

  toJSON() {
    return {
      X: this.x,
      Y: this.y,
    };
  }

  fromJSON(data: { X: number; Y: number }) {
    return new Vec(data.X, data.Y);
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
    const x = this.x - other.X;
    const y = this.y - other.Y;
    return new Vec(x, y);
  }

  public dotProduct(a: Vec): number {
    //Scalar
    return this.x * a.X + this.y * a.Y;
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
