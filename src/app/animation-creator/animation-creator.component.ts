type Keyframe = {
  time: number; // Tidpunkten för keyframen
  name: string; // Namn på benet eller objektet som påverkas
  angle: number; // Rotationsvinkel i grader eller motsvarande enhet
};

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Bone } from '../components/bone';
import { Vec } from '../vec';

@Component({
  selector: 'app-animation-creator',
  templateUrl: './animation-creator.component.html',
  styleUrls: ['./animation-creator.component.css'],
  standalone: false,
})
export class AnimationCreatorComponent
  implements OnInit, OnDestroy, AfterViewInit
{
importBones() {
throw new Error('Method not implemented.');
}
importKeyframes() {
throw new Error('Method not implemented.');
}
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  id: number = 0;
  mousePosX: number = 0;
  mousePosY: number = 0;
  canvasHeight: number = 0;
  canvasWidth: number = 0;
  bones: Bone[] = new Array();
  keyframes: Keyframe[] = new Array();
  activeBone: Bone | null = null;
  pivotPosition: Vec = new Vec(0, 0);
  lengthSliderValue: number = 0;
  rotationSliderValue: number = 0;
  keyframeSliderValue: number = 0;
  timeline: number = 0;
  play: boolean = false;
  parentId: string | null = null;
  boneId: string = 'root';

  constructor() {}

  ngAfterViewInit(): void {
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 600;
    this.canvasWidth = this.canvas.nativeElement.width;
    this.canvasHeight = this.canvas.nativeElement.height;
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.addEventHandlers();
    this.animationLoop();
  }

  ngOnInit() {}

  ngOnDestroy() {
    cancelAnimationFrame(this.id);
  }

  animationLoop() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawbone();
    this.drawPivot();
    this.drawGui();
    this.playAnimation();
    this.updateLength();
    this.updateRotation();
    this.id = requestAnimationFrame(() => this.animationLoop());
  }

  drawbone() {
    this.ctx.save();
    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.fillStyle = 'red';
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 5;
    for (const bone of this.bones) {
      this.ctx.beginPath();
      if (bone.parentId !== null) {
        const parentBone = this.findBoneById(this.bones, bone.parentId);
        if (!parentBone) return;
        const childPosition = this.calculateParentPosition(
          parentBone.position,
          parentBone.length,
          parentBone.rotation
        );
        bone.position = childPosition;
      }
      this.ctx.arc(bone.position.X, bone.position.Y, 10, 0, Math.PI * 2, false);
      const newPos = this.calculateParentPosition(
        bone.position,
        bone.length,
        bone.rotation
      );
      this.ctx.lineTo(newPos.X, newPos.Y);
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawGui() {
    this.ctx.save();
    this.ctx.fillStyle = 'grey';
    this.ctx.font = '50px Arial';
    this.ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    this.ctx.fillText('Timeline', 0, this.canvasHeight - 100);
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(this.keyframeSliderValue, this.canvasHeight - 100);
    this.ctx.lineTo(this.keyframeSliderValue, this.canvasHeight);
    this.ctx.stroke();
    this.ctx.restore();
  }

  togglePlay() {
    this.play = !this.play;
  }

  playAnimation() {
    if (this.play) {
      this.runAnimation();
      this.keyframeSliderValue++;
      if (this.keyframeSliderValue > this.canvasWidth)
        this.keyframeSliderValue = 0;
    }
  }

  drawButton(
    text: string,
    color: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.ctx.save();
    this.ctx.font = 'Arial 50px';
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(text, x + 25, y + 40);
    this.ctx.lineWidth = 10;
    this.ctx.strokeStyle = 'blue';
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.restore();
  }

  drawPivot() {
    if (!this.activeBone) return;
    this.ctx.save();
    this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.ctx.lineWidth = 2;

    this.ctx.strokeStyle = 'green';
    this.ctx.beginPath();
    this.ctx.moveTo(this.activeBone.position.X, this.activeBone.position.Y);
    this.ctx.lineTo(
      this.activeBone.position.X,
      this.activeBone.position.Y - 100
    );
    this.ctx.lineTo(
      this.activeBone.position.X - 10,
      this.activeBone.position.Y - 80
    );
    this.ctx.moveTo(
      this.activeBone.position.X,
      this.activeBone.position.Y - 100
    );
    this.ctx.lineTo(
      this.activeBone.position.X + 10,
      this.activeBone.position.Y - 80
    );
    this.ctx.stroke();

    this.ctx.strokeStyle = 'red';
    this.ctx.beginPath();
    this.ctx.moveTo(this.activeBone.position.X, this.activeBone.position.Y);
    this.ctx.lineTo(
      this.activeBone.position.X + 100,
      this.activeBone.position.Y
    );
    this.ctx.lineTo(
      this.activeBone.position.X + 80,
      this.activeBone.position.Y + 10
    );
    this.ctx.moveTo(
      this.activeBone.position.X + 100,
      this.activeBone.position.Y
    );
    this.ctx.lineTo(
      this.activeBone.position.X + 80,
      this.activeBone.position.Y - 10
    );
    this.ctx.stroke();
    this.ctx.restore();
  }

  addEventHandlers() {
    this.canvas.nativeElement.addEventListener('click', (event) => {
      const bound = this.canvas.nativeElement.getBoundingClientRect();
      this.mousePosX =
        event.clientX -
        bound.left -
        this.canvas.nativeElement.clientLeft -
        this.canvasWidth / 2;
      this.mousePosY =
        event.clientY -
        bound.top -
        this.canvas.nativeElement.clientTop -
        this.canvasHeight / 2;
      this.mouseCollision();
    });
  }

  drawDebug() {
    this.ctx.save();
    this.ctx.font = 'Arial 100px';
    if (this.activeBone) {
      this.ctx.fillText(
        'Pos X: ' +
          this.activeBone.position.X.toString() +
          ' Pos Y: ' +
          this.activeBone.position.Y.toString(),
        this.activeBone.position.X,
        this.activeBone.position.Y
      );
    }
    this.ctx.restore();
  }

  addBone() {
    if (this.findBoneById(this.bones, this.boneId)) return;
    if (this.parentId == '') this.parentId = null;
    const bone = new Bone(
      this.boneId,
      this.parentId,
      new Vec(0, 0),
      100,
      0,
      0,
      0,
      0,
      0,
      0
    );
    this.bones.push(bone);
  }

  activateBone(bone: Bone) {
    this.activeBone = bone;
    this.rotationSliderValue = bone.rotation;
    this.lengthSliderValue = bone.length;
  }

  mouseCollision() {
    if (!this.activeBone) return;
    this.activeBone.position.X = this.mousePosX;
    this.activeBone.position.Y = this.mousePosY;
    console.log('test');
  }

  interpolateKeyframe(startValue: number, endValue: number, progress: number) {
    return startValue + (endValue - startValue) * progress;
  }

  degreesToRadians(degrees: number) {
    const rotationRadians = (degrees * Math.PI) / 180;
    return rotationRadians;
  }

  findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
  }

  calculateParentPosition(position: Vec, length: number, rotation: number) {
    const xEnd =
      position.X + length * Math.cos(this.degreesToRadians(rotation));
    const yEnd =
      position.Y + length * Math.sin(this.degreesToRadians(rotation));
    return new Vec(xEnd, yEnd);
  }

  updateLength() {
    if (!this.activeBone) return;
    this.activeBone.length = this.lengthSliderValue;
  }

  updateRotation() {
    if (!this.activeBone) return;
    this.activeBone.rotation = this.rotationSliderValue;
  }

  addKeyframe() {
    if (!this.activeBone) return;
    this.keyframes.push({
      angle: this.activeBone.rotation,
      time: this.keyframeSliderValue,
      name: this.activeBone.id,
    });
    this.keyframes.sort((a, b) => {
      const idA = a.name;
      const idB = b.name;
      if (idA < idB) {
        return -1;
      }
      if (idA > idB) {
        return 1;
      }
      return 0;
    });
  }

  removeKeyframe(id: number) {
    this.keyframes.splice(id, 1);
  }

  runAnimation() {
    if (this.keyframes.length === 0) return;
    this.activeBone = null;
    const totalDuration = this.keyframes[this.keyframes.length - 1].time;
    // Använd startTime för att räkna ut hur långt in i animationen vi är
    const elapsedTime = this.keyframeSliderValue;
    const loopedTime = elapsedTime % totalDuration;
    for (const bone of this.bones) {
      for (let i = 0; i < this.keyframes.length - 1; i++) {
        const keyFrame = this.keyframes[i];
        if (
          loopedTime >= keyFrame.time &&
          loopedTime < this.keyframes[i + 1].time
        ) {
          const progress =
            (loopedTime - keyFrame.time) /
            (this.keyframes[i + 1].time - keyFrame.time);

          if (bone.id === keyFrame.name) {
            bone.rotation = this.interpolateKeyframe(
              keyFrame.angle,
              this.keyframes[i + 1].angle,
              progress
            );
          }
        }
      }
    }
  }
}
