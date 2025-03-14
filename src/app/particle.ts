import { Vec } from './vec';

export class Particle {
  private position: Vec;
  private velocity: Vec;
  private radius: number;
  private mass: number;

  constructor(x: number, y: number) {
    this.position = new Vec(x, y);
    this.velocity = new Vec(2, 2);
    this.radius = 10;
    this.mass = 1;
  }

  get Position(): Vec {
    return this.position;
  }

  collide(other: Particle): void {
    //Get distance of two particles
    let d = this.position.dist(other.position);
    //Get if they overlap
    const overlap = this.radius + other.radius - d;
    //If they overlap
    if (d < this.radius + other.radius) {
      if (overlap > 0) {
        const dx = (this.position.x - other.position.x) / d;
        const dy = (this.position.y - other.position.y) / d;
        //Move them apart in different directions
        this.position.x += (dx * overlap) / 2;
        this.position.y += (dy * overlap) / 2;
        other.position.x -= (dx * overlap) / 2;
        other.position.y -= (dy * overlap) / 2;
      }
      // Now calculate new velocity after collision
      const position1 = this.position.minus(other.position);
      const position2 = other.position.minus(this.position);
      const velocity1 = this.velocity.minus(other.velocity);
      const velocity2 = other.velocity.minus(this.velocity);

      const length = position1.dotProduct(position2);

      const v1Dot = velocity1.dotProduct(position2);
      const v2Dot = velocity2.dotProduct(position1);

      let scalar1 =
        ((2 * other.mass) / this.mass / (this.mass + other.mass)) *
        (v1Dot / length);
      let scalar2 =
        ((2 * this.mass) / this.mass / (this.mass + other.mass)) *
        (v2Dot / length);

      this.velocity.x = this.velocity.x - scalar1 * position1.x;
      this.velocity.y = this.velocity.y - scalar1 * position1.y;

      other.velocity.x = other.velocity.x - scalar2 * position2.x;
      other.velocity.y = other.velocity.y - scalar2 * position2.y;

      let speedA = this.velocity.mag();
      let speedB = other.velocity.mag();
      let kinA = 0.5 * this.mass * speedA * speedA;
      let kinB = 0.5 * other.mass * speedB * speedB;
      console.log(kinA + kinB);
    }
  }

  update(): void {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x > 500 - this.radius) {
      this.position.x = 500 - this.radius;
      this.velocity.x *= -1;
    } else if (this.position.x < 0 + this.radius) {
      this.position.x = this.radius;
      this.velocity.x *= -1;
    }
    if (this.position.y > 500 - this.radius) {
      this.position.y = 500 - this.radius;
      this.velocity.y *= -1;
    } else if (this.position.y < 0 + this.radius) {
      this.position.y = this.radius;
      this.velocity.y *= -1;
    }
  }

  show(ctx: CanvasRenderingContext2D): void {
    // Beräkna slutpunkt för riktlinjen
    const lineLength = 50; // Längden på linjen som visar riktningen
    const endX = this.position.x + this.velocity.x * lineLength;
    const endY = this.position.y + this.velocity.y * lineLength;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    // ctx.beginPath();
    // ctx.moveTo(this.position.x, this.position.y);
    // ctx.lineTo(endX, endY);
    // ctx.stroke();
  }
}
