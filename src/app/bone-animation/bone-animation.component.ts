import { Component, ElementRef, ViewChild } from '@angular/core';
import { AnimationScene } from '../animation-scene';

@Component({
  selector: 'app-bone-animation',
  templateUrl: './bone-animation.component.html',
  styleUrls: ['./bone-animation.component.css'],
  standalone: false,
})
export class BoneAnimationComponent {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  private scene!: AnimationScene;
  isLoading = true;

  constructor() {}

  //Cancel animation thread.
  ngOnDestroy(): void {
    cancelAnimationFrame(this.scene.loopId);
    console.log('Destroyed game engine with loopID' + this.scene.loopId);
  }

  async ngAfterViewInit(): Promise<void> {
    this.scene = new AnimationScene(this.canvas, 1280, 720, 2048 * 4, 720);
    try {
      await this.scene.init();
      this.scene.gameLoop();
      this.isLoading = false;
    } catch (error) {
      console.error('kunde inte ladda assets', error);
    }
  }
}
