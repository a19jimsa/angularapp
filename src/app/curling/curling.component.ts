import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Scene } from '../scene';

@Component({
  selector: 'app-curling',
  templateUrl: './curling.component.html',
  styleUrls: ['./curling.component.css'],
  standalone: false,
})
export class CurlingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  private gameLoopId = 0;
  private scene!: Scene;

  constructor() {}
  //Cancel animation thread.
  ngOnDestroy(): void {
    cancelAnimationFrame(this.gameLoopId);
  }

  ngAfterViewInit(): void {
    this.scene = new Scene(this.canvas, 500, 500, 500, 2000);
    this.scene.init();
    this.scene.start();
  }
}
