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

  public plus(other: Vec): void {
    this.x += other.x;
    this.y += other.y;
  }
  public times(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }
  public minus(other: Vec): Vec {
    const newValueX = this.x - other.X;
    const newValueY = this.y - other.Y;
    return new Vec(newValueX, newValueY);
  }

  public dotProduct(a: Vec): number {
    return this.x * a.X + this.y * a.Y;
  }

  public dist(other: Vec) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
