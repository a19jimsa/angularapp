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
        const dx = (this.position.X - other.position.X) / d;
        const dy = (this.position.Y - other.position.Y) / d;
        //Move them apart in different directions
        this.position.X += (dx * overlap) / 2;
        this.position.Y += (dy * overlap) / 2;
        other.position.X -= (dx * overlap) / 2;
        other.position.Y -= (dy * overlap) / 2;
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

      this.velocity.X = this.velocity.X - scalar1 * position1.X;
      this.velocity.Y = this.velocity.Y - scalar1 * position1.Y;

      other.velocity.X = other.velocity.X - scalar2 * position2.X;
      other.velocity.Y = other.velocity.Y - scalar2 * position2.Y;

      let speedA = this.velocity.mag();
      let speedB = other.velocity.mag();
      let kinA = 0.5 * this.mass * speedA * speedA;
      let kinB = 0.5 * other.mass * speedB * speedB;
      console.log(kinA + kinB);
    }
  }

  update(): void {
    this.position.X += this.velocity.X;
    this.position.Y += this.velocity.Y;

    if (this.position.X > 500 - this.radius) {
      this.position.X = 500 - this.radius;
      this.velocity.X *= -1;
    } else if (this.position.X < 0 + this.radius) {
      this.position.X = this.radius;
      this.velocity.X *= -1;
    }
    if (this.position.Y > 500 - this.radius) {
      this.position.Y = 500 - this.radius;
      this.velocity.Y *= -1;
    } else if (this.position.Y < 0 + this.radius) {
      this.position.Y = this.radius;
      this.velocity.Y *= -1;
    }
  }

  show(ctx: CanvasRenderingContext2D): void {
    // Beräkna slutpunkt för riktlinjen
    const lineLength = 50; // Längden på linjen som visar riktningen
    const endX = this.position.X + this.velocity.X * lineLength;
    const endY = this.position.Y + this.velocity.Y * lineLength;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.position.X, this.position.Y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    // ctx.beginPath();
    // ctx.moveTo(this.position.X, this.position.Y);
    // ctx.lineTo(endX, endY);
    // ctx.stroke();
  }
}
