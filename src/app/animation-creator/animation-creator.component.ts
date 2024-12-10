type Keyframe = {
  time: number; // Tidpunkten för keyframen
  name: string; // Namn på benet eller objektet som påverkas
  angle: number; // Rotationsvinkel i grader eller motsvarande enhet
};

import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Bone } from '../components/bone';
import { Vec } from '../vec';
import { ImportBonesDialogComponent } from '../import-bones-dialog/import-bones-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { BoneDialogComponent } from '../bone-dialog/bone-dialog.component';
import { ImportKeyframeDialogComponent } from '../import-keyframe-dialog/import-keyframe-dialog.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-animation-creator',
  templateUrl: './animation-creator.component.html',
  styleUrls: ['./animation-creator.component.css'],
  standalone: false,
})
export class AnimationCreatorComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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
  activeKeyframe: Keyframe | null = null;
  lengthSliderValue: number = 0;
  rotationSliderValue: number = 0;
  keyframeSliderValue: number = 0;
  play: boolean = false;
  animationSpeed: number = 1;
  readonly dialog = inject(MatDialog);
  image = new Image();

  activeKeyframeIndex: number = -1;
  keyframeForm = new FormGroup({
    time: new FormControl(0),
    angle: new FormControl(0),
    name: new FormControl(''),
  });

  constructor() {}

  ngAfterViewInit(): void {
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 600;
    this.canvasWidth = this.canvas.nativeElement.width;
    this.canvasHeight = this.canvas.nativeElement.height;
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.image.src = '../assets/sprites/Arden.png';
    this.addEventHandlers();
    this.animationLoop();
  }

  ngOnInit() {}

  ngOnDestroy() {
    cancelAnimationFrame(this.id);
  }

  checkActiveBone(bone: Bone) {
    if (!bone) return;
    this.activateBone(bone);
  }

  importBones() {
    let dialogRef = this.dialog.open(ImportBonesDialogComponent, {
      height: '400px',
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`); // Pizza!
      try {
        const boneArray = JSON.parse(result);
        this.bones.push(...boneArray);
      } catch (e) {
        const errorDialog = this.dialog.open(ErrorDialogComponent, {
          height: '400px',
          width: '600px',
        });
      }
    });
  }

  importKeyframes() {
    let dialogRef = this.dialog.open(ImportKeyframeDialogComponent, {
      height: '400px',
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      try {
        const keyframeArray = JSON.parse(result);
        this.keyframes.push(...keyframeArray);
      } catch (e) {
        const errorDialog = this.dialog.open(ErrorDialogComponent, {
          height: '400px',
          width: '600px',
        });
      }
    });
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
    this.bones.sort((a, b) => a.order - b.order);

    for (const bone of this.bones) {
      if (bone.parentId !== null) {
        const parent = this.findBoneById(this.bones, bone.parentId);
        if (parent) {
          bone.offset = this.calculateParentPosition(
            parent.offset,
            parent.length,
            parent.rotation
          );
        }
      }

      const newPosition = this.calculateParentPosition(
        bone.offset,
        bone.length,
        bone.rotation
      );

      this.ctx.save();
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      if (bone.id === this.activeBone?.id) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'grey';
        this.ctx.strokeRect(
          bone.offset.X,
          bone.offset.Y,
          newPosition.X - bone.offset.X,
          newPosition.Y - bone.offset.Y
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }
      this.ctx.beginPath();
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = bone.color;
      this.ctx.moveTo(bone.offset.X, bone.offset.Y);
      this.ctx.lineTo(newPosition.X, newPosition.Y);
      this.ctx.stroke();
      this.ctx.translate(bone.offset.X, bone.offset.Y);
      this.ctx.rotate(this.degreesToRadians(bone.rotation) - Math.PI / 2);
      this.ctx.translate(-bone.offset.X, -bone.offset.Y);
      this.ctx.drawImage(
        this.image,
        bone.startX,
        bone.startY,
        bone.endX,
        bone.endY,
        bone.offset.X - bone.endX / 2,
        bone.offset.Y,
        bone.endX,
        bone.endY
      );
      this.ctx.restore();
    }
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
    this.ctx.moveTo(this.activeBone.offset.X, this.activeBone.offset.Y);
    this.ctx.lineTo(this.activeBone.offset.X, this.activeBone.offset.Y - 100);
    this.ctx.lineTo(
      this.activeBone.offset.X - 10,
      this.activeBone.offset.Y - 80
    );
    this.ctx.moveTo(this.activeBone.offset.X, this.activeBone.offset.Y - 100);
    this.ctx.lineTo(
      this.activeBone.offset.X + 10,
      this.activeBone.offset.Y - 80
    );
    this.ctx.stroke();

    this.ctx.strokeStyle = 'red';
    this.ctx.beginPath();
    this.ctx.moveTo(this.activeBone.offset.X, this.activeBone.offset.Y);
    this.ctx.lineTo(this.activeBone.offset.X + 100, this.activeBone.offset.Y);
    this.ctx.lineTo(
      this.activeBone.offset.X + 80,
      this.activeBone.offset.Y + 10
    );
    this.ctx.moveTo(this.activeBone.offset.X + 100, this.activeBone.offset.Y);
    this.ctx.lineTo(
      this.activeBone.offset.X + 80,
      this.activeBone.offset.Y - 10
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
      if (!this.clickOnBone()) this.move();
    });
  }

  move() {
    if (this.activeBone) {
      this.activeBone.offset.X = this.mousePosX;
      this.activeBone.offset.Y = this.mousePosY;
    }
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
    let dialogRef = this.dialog.open(BoneDialogComponent, {
      width: '600px',
      height: '400px',
    });
    dialogRef.afterClosed().subscribe((result: Bone) => {
      if (this.findBoneById(this.bones, result.id)) return;
      this.bones.push(result);
    });
  }

  activateBone(bone: Bone) {
    this.activeBone = bone;
    this.rotationSliderValue = bone.rotation;
    this.lengthSliderValue = bone.length;
  }

  mouseCollision() {
    if (!this.activeBone) return;
    if (!this.activeBone.offset) return;
    this.activeBone.offset.X = this.mousePosX;
    this.activeBone.offset.Y = this.mousePosY;
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
      time: this.keyframeSliderValue,
      angle: this.activeBone.rotation,
      name: this.activeBone.id,
    });
    // this.keyframes.sort((a, b) => {
    //   const idA = a.name;
    //   const idB = b.name;
    //   if (idA < idB) {
    //     return -1;
    //   }
    //   if (idA > idB) {
    //     return 1;
    //   }
    //   return 0;
    // });
  }

  changeKeyframe(keyframe: Keyframe) {
    this.activeKeyframe = keyframe;
  }

  updateKeyframe() {}

  changeBone(index: number) {
    let dialogRef = this.dialog.open(BoneDialogComponent, {
      width: '600px',
      height: '400px',
      data: this.bones[index],
    });
  }

  removeKeyframe(id: number) {
    this.keyframes.splice(id, 1);
    this.activeKeyframe = null;
  }

  removeBone(id: number) {
    this.bones.splice(id, 1);
    this.activeBone = null;
  }

  clickOnBone(): boolean {
    for (const bone of this.bones) {
      if (this.isMouseOverBone(bone)) {
        console.log('Hitted bone', bone.id);
        this.activateBone(bone);
        return true;
      }
    }
    return false;
  }

  isMouseOverBone(bone: Bone): boolean {
    const newPosition = this.calculateParentPosition(
      bone.offset,
      bone.length,
      bone.rotation
    );
    return (
      this.mousePosX > Math.min(bone.offset.X, newPosition.X) &&
      this.mousePosX < Math.max(bone.offset.X, newPosition.X) &&
      this.mousePosY > Math.min(bone.offset.Y, newPosition.Y) &&
      this.mousePosY < Math.max(bone.offset.Y, newPosition.Y)
    );
  }

  runAnimation() {
    if (this.keyframes.length === 0) return;
    this.activeBone = null;
    this.activeKeyframe = null;
    const totalDuration = this.keyframes[this.keyframes.length - 1].time;
    const speed = 2000; // ms
    const elapsedTime = performance.now() / speed;
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
