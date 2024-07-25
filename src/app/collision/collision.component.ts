import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Particle } from '../particle';

@Component({
  selector: 'app-collision',
  templateUrl: './collision.component.html',
  styleUrls: ['./collision.component.css'],
})
export class CollisionComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null | undefined;
  private particles: Particle[];

  constructor() {
    this.particles = new Array(300);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i] = new Particle(
        Math.random() * (200 + 100) + 100,
        Math.random() * (200 + 100) + 100
      );
    }
  }
  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.height = 500;
    this.canvas.nativeElement.width = 500;
    this.draw();
  }

  draw() {
    if (this.ctx == null) return;
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.height,
      this.canvas.nativeElement.width
    );
    //Draw everythiung here
    for (let i = 0; i < this.particles.length; i++) {
      let particleA = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        let particleB = this.particles[j];
        particleA.collide(particleB);
      }
    }

    for (let particle of this.particles) {
      particle.update();
      particle.show(this.ctx);
    }
    window.requestAnimationFrame(() => this.draw());
  }
}
