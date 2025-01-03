export type Keyframe = {
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
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { Bone } from '../components/bone';
import { Vec } from '../vec';
import { ImportBonesDialogComponent } from '../import-bones-dialog/import-bones-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { BoneDialogComponent } from '../bone-dialog/bone-dialog.component';
import { ImportKeyframeDialogComponent } from '../import-keyframe-dialog/import-keyframe-dialog.component';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';

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
  filteredKeyframes: Keyframe[] = new Array();
  spriteSheet = new Image();
  isMouseDown: boolean = false;

  activeBone: Bone | null = null;
  activeKeyframe: Keyframe | null = null;

  lengthSliderValue: number = 0;
  rotationSliderValue: number = 0;
  keyframeSliderValue: number = 0;
  mouseUp: Vec = new Vec(0, 0);
  mouseDown: Vec = new Vec(0, 0);
  mousePos: Vec = new Vec(0, 0);

  showSpritesheet: boolean = false;
  showBones: boolean = false;
  showSprites: boolean = false;

  play: boolean = false;
  animationSpeed: number = 1;
  startTime = performance.now();

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
    this.spriteSheet.src = '../assets/sprites/88022.png';
    this.addEventHandlers();
    this.animationLoop();
  }

  ngOnInit() {
    if (localStorage.getItem('bones') !== null) {
      this.bones.push(...JSON.parse(localStorage.getItem('bones')!));
      this.addBonesFromJSON();
      this.createBoneHierarchy();
    }
    if (localStorage.getItem('frames') !== null) {
      // this.keyframes.push(...JSON.parse(localStorage.getItem('frames')!));
      // this.createBoneHierarchy();
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.id);
  }

  createBoneSprite() {}

  drawSpritesheet() {
    if (!this.showSpritesheet) return;
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
        const bones: Bone[] = JSON.parse(result);
        this.bones.push(...bones);
        this.addBonesFromJSON();
      } catch (e) {
        const errorDialog = this.dialog.open(ErrorDialogComponent, {
          height: '400px',
          width: '600px',
          data: 'Could not import bones!',
        });
      }
    });
  }

  addBonesFromJSON() {
    for (const bone of this.bones) {
      bone.offset = new Vec(bone.offset.X, bone.offset.Y);
      bone.position = new Vec(bone.position.X, bone.position.Y);
      bone.globalPivot = new Vec(bone.globalPivot.X, bone.globalPivot.Y);
      bone.globalPosition = new Vec(
        bone.globalPosition.X,
        bone.globalPosition.Y
      );
      bone.hierarchyDepth = 0;
    }
    this.createBoneHierarchy();
    this.sortBonesByHierarchy();
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
    localStorage.setItem('frames', JSON.stringify(this.keyframes));
  }

  exportBones() {
    localStorage.setItem('bones', JSON.stringify(this.bones));
  }

  animationLoop(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.updateBonePositions();
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
    if (!this.showBones) return;
    for (const bone of this.bones) {
      this.ctx.save();
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = 'blue';
      this.ctx.beginPath();
      this.ctx.moveTo(bone.offset.X, bone.offset.Y);
      this.ctx.lineTo(bone.globalPosition.X, bone.globalPosition.Y);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'green';
      this.ctx.arc(bone.offset.X, bone.offset.Y, 10, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    }
  }

  createKeyframesOfBones() {
    for (const bone of this.bones) {
      const keyframe1: Keyframe = {
        time: this.keyframeSliderValue,
        angle: bone.rotation,
        name: bone.id,
      };
      this.keyframes.push(keyframe1);
    }
    this.sortKeyframes();
    this.filteredKeyframes = this.keyframes;
  }

  sortKeyframes() {
    this.keyframes.sort((a, b) => {
      if (a.name < b.name) {
        return -1; // Namnet "a" kommer före "b"
      }
      if (a.name > b.name) {
        return 1; // Namnet "a" kommer efter "b"
      }
      // Om namnen är lika, jämför tid
      return a.time - b.time;
    });
  }

  openDialogfilterKeyframes() {
    const dialog = this.dialog.open(FilterDialogComponent, {
      height: '400px',
      width: '600px',
      data: this.keyframes,
    });
    dialog.afterClosed().subscribe((result) => {
      this.filteredKeyframes = result;
    });
  }

  resetKeyframes() {
    this.filteredKeyframes = this.keyframes;
  }

  drawSprite(): void {
    if (!this.showSprites) return;
    const bones = this.bones.sort((a, b) => a.order - b.order);
    for (const bone of bones) {
      this.ctx.save();
      //Draw sprites
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      this.ctx.translate(bone.offset.X, bone.offset.Y);
      this.ctx.rotate(this.degreesToRadians(bone.globalRotation) - Math.PI / 2);
      this.ctx.translate(-bone.offset.X, -bone.offset.Y);
      this.ctx.drawImage(
        this.spriteSheet,
        bone.startX,
        bone.startY,
        bone.endX,
        bone.endY,
        bone.offset.X - bone.pivot.X - bone.endX / 2,
        bone.offset.Y - bone.pivot.Y,
        bone.endX,
        bone.endY
      );
      this.ctx.restore();
    }
  }

  drawGui() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.rect(
      this.mouseDown.X,
      this.mouseDown.Y,
      this.mousePos.X - this.mouseDown.X,
      this.mousePos.Y - this.mouseDown.Y
    );
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.restore();
  }

  togglePlay() {
    this.startTime = performance.now();
    this.play = !this.play;
  }

  playAnimation() {
    if (this.play) {
      this.runAnimation();
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
    this.ctx.lineWidth = 3;

    this.ctx.strokeStyle = 'green';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 0 - 100);
    this.ctx.lineTo(0 - 10, 0 - 80);
    this.ctx.moveTo(0, 0 - 100);
    this.ctx.lineTo(0 + 10, 0 - 80);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'red';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0 + 100, 0);
    this.ctx.lineTo(0 + 80, 0 + 10);
    this.ctx.moveTo(0 + 100, 0);
    this.ctx.lineTo(0 + 80, 0 - 10);
    this.ctx.stroke();
    this.ctx.restore();
  }

  addEventHandlers() {
    const bound = this.canvas.nativeElement.getBoundingClientRect();
    this.canvas.nativeElement.addEventListener('click', (event) => {
      this.isMouseDown = true;
      if (!this.isMouseOverJoint()) {
        this.activeBone = null;
      }
      this.isMouseDown = false;
    });
    this.canvas.nativeElement.addEventListener('mousemove', (event) => {
      if (!this.isMouseDown) return;
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
      this.isMouseDown = true;
    });
    this.canvas.nativeElement.addEventListener('mouseup', (event) => {
      this.mouseUp.X =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mouseUp.Y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
      this.isMouseDown = false;
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

  createLoopFrame() {
    const tempKeyframe: Keyframe[] = new Array();
    for (const keyframe of this.keyframes) {
      if (keyframe.time === 0) {
        const newKeyframe: Keyframe = {
          time: this.keyframeSliderValue,
          angle: keyframe.angle,
          name: keyframe.name,
        };
        tempKeyframe.push(newKeyframe);
      }
    }
    this.keyframes.push(...tempKeyframe);
    this.sortKeyframes();
    this.filteredKeyframes = this.keyframes;
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

  calculateHierarchyDepth(bone: Bone, bones: Bone[]): number {
    if (!bone.parentId) return 0; // Roten har djup 0
    const parent = bones.find((b) => b.id === bone.parentId);
    if (!parent) throw new Error(`Parent not found for bone ${bone.id}`);
    return this.calculateHierarchyDepth(parent, bones) + 1;
  }

  sortBonesByHierarchy(): void {
    for (const bone of this.bones) {
      bone.hierarchyDepth = this.calculateHierarchyDepth(bone, this.bones);
    }
    this.bones.sort((a, b) => a.hierarchyDepth - b.hierarchyDepth);
  }

  updateBonePositions(): void {
    this.sortBonesByHierarchy();
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
          bone.offset = this.calculateParentPosition(
            parent.offset,
            parent.length * bone.attachAt,
            parentRotation
          );
        }
      }

      bone.globalRotation =
        bone.rotation + parentRotation + bone.globalSpriteRotation;

      bone.globalPosition = this.calculateParentPosition(
        bone.offset,
        bone.length,
        parentRotation + bone.rotation
      );
    }
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
    this.sortKeyframes();
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

  isMouseOverJoint(): boolean {
    const mousePosX = this.mouseDown.X - this.canvasWidth / 2;
    const mousePosY = this.mouseDown.Y - this.canvasHeight / 2;
    for (const bone of this.bones) {
      if (bone.offset instanceof Vec) {
        console.log(bone.offset);

        const distance = bone.offset.dist(new Vec(mousePosX, mousePosY));
        console.log(distance);
        if (distance <= 10) {
          this.activateBone(bone.id);
          return true;
        }
      } else {
        console.log(bone.id);
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

  runAnimation() {
    if (this.keyframes.length === 0) return;
    this.activeBone = null;
    this.activeKeyframe = null;
    const totalDuration = this.keyframes[this.keyframes.length - 1].time;
    const speed = 1000 / this.animationSpeed;
    const elapsedTime = (performance.now() - this.startTime) / speed;
    this.keyframeSliderValue = elapsedTime;
    const loopedTime = this.keyframeSliderValue % totalDuration;
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
