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
  public plus(other: Vec) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  public times(factor: number) {
    return new Vec(this.x * factor, this.y * factor);
  }
  public minus(other: number) {
    return new Vec(this.x - other, this.y - other);
  }
}
