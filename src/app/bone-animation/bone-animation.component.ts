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
  private scene!: AnimationScene;

  constructor() {}

  //Cancel animation thread.
  ngOnDestroy(): void {
    cancelAnimationFrame(this.scene.loopId);
    console.log('Destroyed game engine with loopID' + this.scene.loopId);
  }

  ngAfterViewInit(): void {
    this.scene = new AnimationScene(this.canvas, 1024, 450, 4096, 1800);
    this.scene.init();
    this.scene.start();
  }
}
