type Keyframe = {
  time: number; // Tidpunkten för keyframen
  name: string; // Namn på benet eller objektet som påverkas
  angle: number; // Rotationsvinkel i grader eller motsvarande enhet
};

type BoneHierarchy = {
  boneId: string;
  children: BoneHierarchy[];
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
  canvasHeight: number = 0;
  canvasWidth: number = 0;
  bones: Bone[] = new Array();
  keyframes: Keyframe[] = new Array();
  spriteSheet = new Image();

  activeBone: Bone | null = null;
  activeKeyframe: Keyframe | null = null;

  lengthSliderValue: number = 0;
  rotationSliderValue: number = 0;
  keyframeSliderValue: number = 0;
  mouseUp: Vec = new Vec(0, 0);
  mouseDown: Vec = new Vec(0, 0);
  mousePos: Vec = new Vec(0, 0);

  hideSpritesheet: boolean = true;
  hideBones: boolean = true;
  hideSprites: boolean = true;

  play: boolean = false;
  animationSpeed: number = 1;
  readonly dialog = inject(MatDialog);

  activeKeyframeIndex: number = -1;

  keyframeForm = new FormGroup({
    time: new FormControl(0),
    angle: new FormControl(0),
    name: new FormControl(''),
  });

  dataSource: BoneHierarchy[] = new Array();

  childrenAccessor = (bone: BoneHierarchy) => bone.children ?? [];

  hasChild = (_: number, bone: BoneHierarchy) =>
    !!bone.children && bone.children.length > 0;

  constructor() {}

  ngAfterViewInit(): void {
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 600;
    this.canvasWidth = this.canvas.nativeElement.width;
    this.canvasHeight = this.canvas.nativeElement.height;
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.spriteSheet.src = '../assets/sprites/Arden.png';
    this.addEventHandlers();
    this.animationLoop();
  }

  ngOnInit() {
    if (localStorage.getItem('bones') !== null) {
      this.bones.push(...JSON.parse(localStorage.getItem('bones')!));
      this.createBoneHierarchy();
      console.log(localStorage.getItem('bones'));
    }
    if (localStorage.getItem('frames') !== null) {
      this.bones.push(...JSON.parse(localStorage.getItem('frames')!));
      this.createBoneHierarchy();
      console.log(localStorage.getItem('frames'));
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.id);
  }

  toggleHideSpritesheet() {
    this.hideSpritesheet = !this.hideSpritesheet;
  }

  createBoneSprite() {}

  drawSpritesheet() {
    if (this.hideSpritesheet) return;
    this.ctx.save();
    this.ctx.drawImage(this.spriteSheet, 0, 0);
    this.ctx.restore();
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.spriteSheet.onload = () => {};
        this.spriteSheet.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  checkActiveBone(bone: Bone) {
    if (!bone) return;
    this.activateBone(bone.id);
  }

  importBones() {
    let dialogRef = this.dialog.open(ImportBonesDialogComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      try {
        const boneArray: Bone[] = JSON.parse(result);
        this.bones = boneArray;
        this.createBoneHierarchy();
      } catch (e) {
        const errorDialog = this.dialog.open(ErrorDialogComponent, {
          height: '400px',
          width: '600px',
          data: 'Could not import bones!',
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

  exportKeyframes() {
    localStorage.setItem('keyframes', JSON.stringify(this.keyframes));
  }

  exportBones() {
    localStorage.setItem('bones', JSON.stringify(this.bones));
  }

  animationLoop(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawSpritesheet();
    this.drawGui();
    this.drawSprite();
    this.drawbone();
    this.drawPivot();
    //this.drawDebug();
    this.playAnimation();
    this.updateLength();
    this.updateRotation();
    this.id = requestAnimationFrame(() => this.animationLoop());
  }

  calculateGlobalRotation(bone: Bone): number {
    if (bone.parentId !== null) {
      const parent = this.findBoneById(this.bones, bone.parentId);
      if (parent) {
        // Rekursivt addera förälderns globala rotation
        return this.calculateGlobalRotation(parent) + bone.rotation;
      }
    }
    // Om det inte finns någon förälder (root), returnera bara benets egen rotation
    return bone.rotation;
  }

  drawbone(): void {
    if (this.hideBones) return;
    for (const bone of this.bones) {
      let parentRotation = 0;
      if (
        bone.parentId !== null &&
        bone.parentId !== undefined &&
        bone.parentId !== ''
      ) {
        const parent = this.findBoneById(this.bones, bone.parentId);
        if (parent) {
          parentRotation = this.calculateGlobalRotation(parent);
          const x = parent.offset.X;
          const y = parent.offset.Y;
          bone.offset = this.calculateParentPosition(
            new Vec(x, y),
            parent.length * bone.attachAt,
            parentRotation
          );
        }
      }

      const x = bone.offset.X;
      const y = bone.offset.Y;
      const newPosition = this.calculateParentPosition(
        new Vec(x, y),
        bone.length,
        parentRotation + bone.rotation
      );

      this.ctx.save();
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = 'blue';
      this.ctx.beginPath();
      this.ctx.moveTo(
        bone.offset.X + bone.pivot.X,
        bone.offset.Y + bone.pivot.Y
      );
      this.ctx.lineTo(newPosition.X, newPosition.Y);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    }
  }

  drawSprite() {
    if (this.hideSprites) return;
    this.bones.sort((a, b) => a.order - b.order);
    for (const bone of this.bones) {
      let parentRotation = 0;
      if (bone.parentId !== null) {
        const parent = this.findBoneById(this.bones, bone.parentId);
        if (parent) {
          parentRotation = this.calculateGlobalRotation(parent);
        }
      }
      parentRotation += bone.rotation;

      this.ctx.save();
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      this.ctx.translate(bone.offset.X, bone.offset.Y);
      this.ctx.translate(bone.pivot.X, bone.pivot.Y);
      this.ctx.rotate(this.degreesToRadians(parentRotation) - Math.PI / 2);
      this.ctx.translate(-bone.pivot.X, -bone.pivot.Y);
      this.ctx.translate(-bone.offset.X, -bone.offset.Y);
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'red';
      this.ctx.strokeRect(
        bone.offset.X - bone.endX / 2,
        bone.offset.Y,
        bone.endX,
        bone.endY
      );
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.drawImage(
        this.spriteSheet,
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
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'white';
    this.ctx.fillRect(this.mousePos.X, this.mousePos.Y, 10, 10);

    this.ctx.fillStyle = 'grey';
    this.ctx.font = '50px Arial';
    this.ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    this.ctx.fillText('Timeline', 0, this.canvasHeight - 100);
    this.ctx.beginPath();
    this.ctx.rect(
      this.mouseDown.X,
      this.mouseDown.Y,
      this.mouseUp.X - this.mouseDown.X,
      this.mouseUp.Y - this.mouseDown.Y
    );
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(this.keyframeSliderValue, this.canvasHeight - 100);
    this.ctx.lineTo(this.keyframeSliderValue, this.canvasHeight);
    this.ctx.stroke();
    this.ctx.restore();
  }

  togglePlay() {
    this.play = !this.play;
  }

  toggleShowBones() {
    this.hideBones = !this.hideBones;
  }

  toggleShowSprites() {
    this.hideSprites = !this.hideSprites;
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
    this.ctx.translate(
      this.canvasWidth / 2 + this.activeBone.offset.X,
      this.canvasHeight / 2 + this.activeBone.offset.Y
    );
    this.ctx.lineWidth = 2;

    this.ctx.strokeStyle = 'green';
    this.ctx.beginPath();
    this.ctx.moveTo(this.activeBone.pivot.X, this.activeBone.pivot.Y);
    this.ctx.lineTo(this.activeBone.pivot.X, this.activeBone.pivot.Y - 100);
    this.ctx.lineTo(this.activeBone.pivot.X - 10, this.activeBone.pivot.Y - 80);
    this.ctx.moveTo(this.activeBone.pivot.X, this.activeBone.pivot.Y - 100);
    this.ctx.lineTo(this.activeBone.pivot.X + 10, this.activeBone.pivot.Y - 80);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'red';
    this.ctx.beginPath();
    this.ctx.moveTo(this.activeBone.pivot.X, this.activeBone.pivot.Y);
    this.ctx.lineTo(this.activeBone.pivot.X + 100, this.activeBone.pivot.Y);
    this.ctx.lineTo(this.activeBone.pivot.X + 80, this.activeBone.pivot.Y + 10);
    this.ctx.moveTo(this.activeBone.pivot.X + 100, this.activeBone.pivot.Y);
    this.ctx.lineTo(this.activeBone.pivot.X + 80, this.activeBone.pivot.Y - 10);
    this.ctx.stroke();
    this.ctx.restore();
  }

  addEventHandlers() {
    const bound = this.canvas.nativeElement.getBoundingClientRect();
    this.canvas.nativeElement.addEventListener('click', (event) => {
      if (!this.clickOnBone()) this.mouseClick();
      this.clickOnSprite();
    });
    this.canvas.nativeElement.addEventListener('mousemove', (event) => {
      this.mousePos.X =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mousePos.Y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
    });
    this.canvas.nativeElement.addEventListener('mousedown', (event) => {
      this.mouseDown.X =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mouseDown.Y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
      console.log(this.mouseDown);
    });
    this.canvas.nativeElement.addEventListener('mouseup', (event) => {
      this.mouseUp.X =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mouseUp.Y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
      console.log(this.mouseUp);
    });

    addEventListener('keydown', (event) => {
      console.log(event.key);
      if (event.key == 'ArrowDown') {
        if (this.activeBone) {
          this.activeBone.offset.Y += 1;
          return;
        }
        this.mouseDown.Y += 1;
        this.mouseUp.Y += 1;
      }
      if (event.key == 'ArrowUp') {
        if (this.activeBone) {
          this.activeBone.offset.Y -= 1;
          return;
        }
        this.mouseDown.Y -= 1;
        this.mouseUp.Y -= 1;
      }
      if (event.key == 'ArrowRight') {
        if (this.activeBone) {
          this.activeBone.offset.X += 1;
          return;
        }
        this.mouseDown.X += 1;
        this.mouseUp.X += 1;
      }
      if (event.key == 'ArrowLeft') {
        if (this.activeBone) {
          this.activeBone.offset.X -= 1;
          return;
        }
        this.mouseDown.X -= 1;
        this.mouseUp.X -= 1;
      }
    });
  }

  createBoneHierarchy() {
    const boneMap = new Map<string, BoneHierarchy>();
    const boneHierarchy: BoneHierarchy[] = [];

    // Skapa en uppslagslista för alla ben
    for (const bone of this.bones) {
      boneMap.set(bone.id, { boneId: bone.id, children: [] });
    }

    // Bygg hierarkin
    for (const bone of this.bones) {
      const currentBone = boneMap.get(bone.id);
      if (bone.parentId === null) {
        // Lägg till roten i hierarkin
        boneHierarchy.push(currentBone!);
      } else {
        // Hitta föräldern och lägg till detta ben som ett barn
        const parentBone = boneMap.get(bone.parentId);
        if (parentBone) {
          parentBone.children.push(currentBone!);
        }
      }
    }
    this.dataSource = boneHierarchy;
  }

  mouseClick() {
    if (this.activeBone) {
      this.activeBone.offset.X = this.mousePos.X - this.canvasWidth / 2;
      this.activeBone.offset.Y = this.mousePos.Y - this.canvasHeight / 2;
    }
  }

  uploadImage() {}

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
    const bone = new Bone(
      '',
      null,
      new Vec(0, 0),
      0,
      this.mouseDown.X,
      this.mouseDown.Y,
      this.mouseUp.X - this.mouseDown.X,
      this.mouseUp.Y - this.mouseDown.Y,
      0,
      new Vec(0, 0)
    );
    let dialogRef = this.dialog.open(BoneDialogComponent, {
      width: '600px',
      height: '400px',
      data: bone,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result !== undefined) {
        this.bones.push(result);
        this.createBoneHierarchy();
      }
    });
  }

  activateBone(boneId: string) {
    const bone = this.findBoneById(this.bones, boneId);
    if (!bone) return;
    this.activeBone = bone;
    this.rotationSliderValue = bone.rotation;
    this.lengthSliderValue = bone.length;
    console.log(this.activeBone);
  }

  inactivateBone() {
    this.activeBone = null;
  }

  mouseCollision() {
    if (!this.activeBone) return;
    if (!this.activeBone.offset) return;
    this.activeBone.offset.X = this.mousePos.X - this.canvasWidth / 2;
    this.activeBone.offset.Y = this.mousePos.Y - this.canvasHeight / 2;
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

  removeBone(id: string) {
    const index = this.bones.findIndex((e) => e.id === id);
    this.bones.splice(index, 1);
    this.activeBone = null;
    this.createBoneHierarchy();
  }

  clickOnBone(): boolean {
    for (const bone of this.bones) {
      if (this.isMouseOverBone(bone)) {
        //this.activateBone(bone.id);
        return true;
      }
    }
    this.activeBone = null;
    return false;
  }

  clickOnSprite(): boolean {
    for (const bone of this.bones) {
      if (this.isMouseOverSprite(bone)) {
        this.activateBone(bone.id);
        console.log('Hitted sprite ' + bone.id);
        return true;
      }
    }
    return false;
  }

  isMouseOverSprite(bone: Bone): boolean {
    const mouseX = this.mousePos.X - this.canvasWidth / 2;
    const mouseY = this.mousePos.Y - this.canvasHeight / 2;
    return (
      mouseX > bone.offset.X - bone.endX / 2 &&
      mouseX < bone.endX &&
      mouseY > bone.offset.Y &&
      mouseY < bone.endY
    );
  }

  isMouseOverBone(bone: Bone): boolean {
    const newPosition = this.calculateParentPosition(
      bone.offset,
      bone.length,
      bone.rotation
    );
    return (
      this.mousePos.X - this.canvasWidth / 2 >
        Math.min(bone.offset.X, newPosition.X) &&
      this.mousePos.X - this.canvasWidth / 2 <
        Math.max(bone.offset.X, newPosition.X) &&
      this.mousePos.Y - this.canvasHeight / 2 >
        Math.min(bone.offset.Y, newPosition.Y) &&
      this.mousePos.Y - this.canvasHeight / 2 <
        Math.max(bone.offset.Y, newPosition.Y)
    );
  }

  runAnimation() {
    if (this.keyframes.length === 0) return;
    this.activeBone = null;
    this.activeKeyframe = null;
    const totalDuration = this.keyframes[this.keyframes.length - 1].time;
    const speed = 1000; // ms
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
