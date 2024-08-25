import { Component, ElementRef, ViewChild } from '@angular/core';
import { AnimationScene } from '../animation-scene';

@Component({
  selector: 'app-bone-animation',
  templateUrl: './bone-animation.component.html',
  styleUrls: ['./bone-animation.component.css'],
})
export class BoneAnimationComponent {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  private gameLoopId = 0;
  private scene!: AnimationScene;

  constructor() {}
  //Cancel animation thread.
  ngOnDestroy(): void {
    cancelAnimationFrame(this.gameLoopId);
  }

  ngAfterViewInit(): void {
    this.scene = new AnimationScene(this.canvas, 1024, 450, 2048, 900);
    this.scene.init();
    this.scene.start();
  }
}
