export type Keyframe = {
  position: Vec;
  scale: Vec;
  time: number;
  name: string;
  angle: number;
  clip: ClipAnimation;
};

type BoneHierarchy = {
  boneId: string;
  children: BoneHierarchy[];
};

export type ClipAnimation = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type Effect = {
  position: Vec;
  scale: Vec;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
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
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Bone } from '../../components/bone';
import { Vec } from '../vec';
import { ImportBonesDialogComponent } from '../import-bones-dialog/import-bones-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { BoneDialogComponent } from '../bone-dialog/bone-dialog.component';
import { ImportKeyframeDialogComponent } from '../import-keyframe-dialog/import-keyframe-dialog.component';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import { PromtDialogComponent } from '../promt-dialog/promt-dialog.component';
import { OnGroundState } from '../../states/on-ground-state';
import { JumpingState } from '../../states/jumping-state';
import { RunningState } from '../../states/running-state';
import { StateMachine } from '../../states/state-machine';
import { FilterBonesDialogComponent } from '../filter-bones-dialog/filter-bones-dialog.component';
import { MathUtils } from '../../Utils/MathUtils';
import { ChangeBoneCommand } from 'src/commands/change-bone-command';

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
  filteredBones: Bone[] = new Array();
  spriteSheet = new Image();
  isMouseDown: boolean = false;

  activeBone: Bone | null = null;
  activeKeyframe: Keyframe | null = null;

  loopedTime: number = 0;
  totalDuration: number = 0;

  camera: Vec = new Vec(0, 0);

  lengthSliderValue: number = 0;
  rotationSliderValue: number = 0;
  keyframeSliderValue: number = 0;
  scaleSliderValue: number = 0;
  mouseUp: Vec = new Vec(0, 0);
  mouseDown: Vec = new Vec(0, 0);
  mousePos: Vec = new Vec(0, 0);
  animation: ClipAnimation = { startX: 0, startY: 0, endX: 0, endY: 0 };

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

  private readonly _formBuilder = inject(FormBuilder);
  boneForm = this._formBuilder.group(this.dataSource);

  changeBoneCommand!: ChangeBoneCommand;

  constructor() {}

  ngAfterViewInit(): void {
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 480;
    this.canvasWidth = this.canvas.nativeElement.width;
    this.canvasHeight = this.canvas.nativeElement.height;
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.spriteSheet.src = '../assets/sprites/88022.png';
    this.animationLoop();
    setTimeout(() => this.addEventHandlers(), 3000);
  }

  ngOnInit() {
    if (localStorage.getItem('bones') !== null) {
      this.bones.push(...JSON.parse(localStorage.getItem('bones')!));
      this.addBonesFromJSON();
      this.createBoneHierarchy();
    }
    if (localStorage.getItem('frames') !== null) {
      this.keyframes.push(...JSON.parse(localStorage.getItem('frames')!));
      for (const keyframe of this.keyframes) {
        if (!keyframe.position) {
          keyframe.position = new Vec(0, 0);
        }
      }
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.id);
  }

  animationLoop(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawBackground();
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

  drawBackground() {
    const gridSize = 50;
    for (let y = 0; y < this.canvasHeight; y += gridSize) {
      for (let x = 0; x < this.canvasWidth; x += gridSize) {
        // Växla mellan två färger beroende på position
        this.ctx.fillStyle =
          (x / gridSize + y / gridSize) % 2 === 0 ? '#6c757d' : '#343a40';
        this.ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }

  changeState(name: string) {}

  setTime() {
    this.loopedTime = this.keyframeSliderValue;
    this.runAnimation();
  }

  drawSpritesheet() {
    if (!this.showSpritesheet) return;
    this.ctx.drawImage(this.spriteSheet, this.camera.X, this.camera.Y);
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

  clearBones() {
    const dialogRef = this.dialog.open(PromtDialogComponent, {
      height: '200px',
      width: '200px',
    });
    dialogRef.afterClosed().subscribe((e: string) => {
      if (e === 'yes') {
        this.bones = [];
        this.sortBonesByHierarchy();
        this.createBoneHierarchy();
      }
    });
  }

  clearKeyframes() {
    const dialogRef = this.dialog.open(PromtDialogComponent, {
      height: '200px',
      width: '200px',
    });
    dialogRef.afterClosed().subscribe((e: string) => {
      if (e === 'yes') {
        this.keyframes = [];
        this.filteredKeyframes = [];
      }
    });
  }

  addBonesFromJSON() {
    for (const bone of this.bones) {
      bone.position = new Vec(bone.position.X, bone.position.Y);
      bone.hierarchyDepth = 0;
      if (bone.scale) {
        bone.scale = new Vec(bone.scale.X, bone.scale.Y);
      } else {
        bone.scale = new Vec(1, 1);
      }
      if (!bone.minAngle) {
        bone.minAngle = 0;
      }
      if (!bone.maxAngle) {
        bone.maxAngle = 0;
      }
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
        const keyframeArray: Keyframe[] = JSON.parse(result);
        this.keyframes = [];
        for (const keyframe of keyframeArray) {
          if (!keyframe.position) {
            keyframe.position = new Vec(0, 0);
          }
        }
        this.keyframes.push(...keyframeArray);
        this.sortKeyframes();
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
      this.ctx.moveTo(bone.position.X, bone.position.Y);
      const newPos = MathUtils.calculateParentPosition(
        bone.position,
        bone.length,
        bone.globalRotation - bone.globalSpriteRotation // I dunno why but it works
      );
      this.ctx.lineTo(newPos.X, newPos.Y);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'red';
      this.ctx.arc(bone.position.X, bone.position.Y, 5, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    }
  }

  createKeyframesOfBones() {
    for (const bone of this.filteredBones) {
      const keyframe: Keyframe = {
        position: new Vec(bone.position.X, bone.position.Y),
        time: this.keyframeSliderValue,
        angle: bone.rotation,
        name: bone.id,
        scale: new Vec(bone.scale.X, bone.scale.Y),
        clip: {
          startX: bone.startX,
          startY: bone.startY,
          endX: bone.endX,
          endY: bone.endY,
        },
      };
      this.keyframes.push(keyframe);
    }
    this.sortKeyframes();
    this.filteredKeyframes = this.keyframes;
  }

  sortKeyframes() {
    return this.keyframes.sort((a, b) => {
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

  sortKeyframesForLoop(keyframes: Keyframe[]): Keyframe[] {
    keyframes.sort((a, b) => {
      if (a.name < b.name) {
        return 1; // Namnet "a" kommer före "b"
      }
      if (a.name > b.name) {
        return -1; // Namnet "a" kommer efter "b"
      }
      // Om namnen är lika, jämför tid
      return b.time - a.time;
    });
    return keyframes;
  }

  openDialogfilterKeyframes() {
    const dialog = this.dialog.open(FilterDialogComponent, {
      height: '400px',
      width: '600px',
      data: this.keyframes,
    });
    dialog.afterClosed().subscribe((result: Keyframe[]) => {
      this.filteredKeyframes = result;
    });
  }

  openDialogfilterBones() {
    const dialog = this.dialog.open(FilterBonesDialogComponent, {
      height: '400px',
      width: '600px',
      data: this.bones,
    });
    dialog.afterClosed().subscribe((result: Bone[]) => {
      this.filteredBones = result;
      console.log(this.filteredBones);
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
      this.ctx.translate(bone.position.X, bone.position.Y);
      this.ctx.rotate(
        MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2
      );
      this.ctx.scale(bone.scale.X, bone.scale.Y);
      this.ctx.translate(-bone.position.X, -bone.position.Y);
      this.ctx.drawImage(
        this.spriteSheet,
        bone.startX,
        bone.startY,
        bone.endX,
        bone.endY,
        bone.position.X - bone.pivot.X - bone.endX / 2,
        bone.position.Y - bone.pivot.Y,
        bone.endX,
        bone.endY
      );
      this.ctx.restore();
    }
  }

  drawGui() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;
    this.ctx.rect(
      this.mouseDown.X,
      this.mouseDown.Y,
      this.mousePos.X - this.mouseDown.X,
      this.mousePos.Y - this.mouseDown.Y
    );
    this.ctx.stroke();
  }

  togglePlay() {
    this.play = !this.play;
  }

  playAnimation() {
    if (this.play) {
      this.keyframeSliderValue += 0.016;
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
      this.canvasWidth / 2 + this.activeBone.position.X,
      this.canvasHeight / 2 + this.activeBone.position.Y
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
      this.animation.startX = this.mouseDown.X - this.camera.X;
      this.animation.startY = this.mouseDown.Y - this.camera.Y;
      this.animation.endX = this.mouseUp.X - this.mouseDown.X;
      this.animation.endY = this.mouseUp.Y - this.mouseDown.Y;
    });

    this.canvas.nativeElement.addEventListener('wheel', (event) => {
      this.camera.Y += event.deltaY / 10;
    });

    addEventListener('keydown', (event) => {
      console.log(event.key);
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
    let boneNames: Set<string> = new Set<string>();
    for (const keyframe of this.keyframes) {
      boneNames.add(keyframe.name);
    }
    for (const boneName of boneNames) {
      //Create a copy of keyframes
      let tempKeyframes: Keyframe[] = JSON.parse(
        JSON.stringify(this.keyframes)
      );
      tempKeyframes = tempKeyframes.filter((e) => e.name === boneName);
      const maxTime = tempKeyframes[tempKeyframes.length - 1].time;
      //Sort array after got maxtime of last frame, basically startvalue of next frame + diff
      tempKeyframes.reverse();
      let currentTime = maxTime;
      let numbers: number[] = [];
      for (let i = 1; i < tempKeyframes.length; i++) {
        const firstValue = tempKeyframes[i - 1].time;
        const secondValue = tempKeyframes[i].time;
        const diff = firstValue - secondValue;
        console.log(diff);
        currentTime += diff;
        numbers.push(currentTime);
      }
      console.log(numbers);
      for (let i = 0; i < numbers.length; i++) {
        let keyframe: Keyframe = tempKeyframes[i + 1];
        keyframe.time = numbers[i];
        this.keyframes.push(keyframe);
      }
      console.log(this.keyframes);
    }

    this.sortKeyframes();
    this.filteredKeyframes = this.keyframes;
  }

  mouseClick() {
    if (this.activeBone) {
      this.activeBone.position.X = this.mousePos.X - this.canvasWidth / 2;
      this.activeBone.position.Y = this.mousePos.Y - this.canvasHeight / 2;
    }
  }

  drawDebug() {
    this.ctx.save();
    this.ctx.font = 'Arial';
    this.ctx.fillStyle = 'green';
    this.ctx.translate(20, 50);
    this.ctx.scale(5, 5);
    this.ctx.beginPath();
    this.ctx.fillText(
      'Pos X: ' +
        this.mouseUp.X.toString() +
        ' Pos Y: ' +
        this.mouseUp.Y.toString(),
      0,
      0
    );
    this.ctx.restore();
  }

  addBone() {
    const bone = new Bone(
      '',
      null,
      new Vec(0, 0),
      0,
      this.mouseDown.X - this.camera.X,
      this.mouseDown.Y - this.camera.Y,
      this.mouseUp.X - this.mouseDown.X,
      this.mouseUp.Y - this.mouseDown.Y,
      0,
      0,
      180
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
    this.scaleSliderValue = bone.scale.Y;
  }

  inactivateBone() {
    this.activeBone = null;
  }

  mouseCollision() {
    if (!this.activeBone) return;
    if (!this.activeBone.position) return;
    this.activeBone.position.X = this.mousePos.X - this.canvasWidth / 2;
    this.activeBone.position.Y = this.mousePos.Y - this.canvasHeight / 2;
  }

  interpolateKeyframe(startValue: number, endValue: number, progress: number) {
    return startValue + (endValue - startValue) * progress;
  }

  findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
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
      if (bone.parentId) {
        const parent = this.findBoneById(this.bones, bone.parentId);
        if (parent) {
          parentRotation = this.calculateGlobalRotation(parent);
          bone.position = MathUtils.calculateParentPosition(
            parent.position,
            parent.length * bone.attachAt * parent.scale.Y,
            parentRotation
          );
        }
      }
      bone.globalRotation =
        bone.rotation + parentRotation + bone.globalSpriteRotation;
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
      const distance = bone.position.dist(new Vec(mousePosX, mousePosY));
      if (distance <= 5) {
        this.activateBone(bone.id);
        return true;
      }
    }
    return false;
  }

  isMouseOverSprite(bone: Bone): boolean {
    const mouseX = this.mousePos.X - this.canvasWidth / 2;
    const mouseY = this.mousePos.Y - this.canvasHeight / 2;
    return (
      mouseX > bone.position.X - bone.endX / 2 &&
      mouseX < bone.endX &&
      mouseY > bone.position.Y &&
      mouseY < bone.endY
    );
  }

  runAnimation() {
    if (this.keyframes.length === 0) return;
    this.activeBone = null;
    this.activeKeyframe = null;
    this.totalDuration = this.keyframes[this.keyframes.length - 1].time;
    const elapsedTime = this.keyframeSliderValue;
    this.loopedTime = elapsedTime % this.totalDuration;
    for (const bone of this.bones) {
      for (let i = 0; i < this.keyframes.length - 1; i++) {
        const keyFrame = this.keyframes[i];
        if (
          this.loopedTime >= keyFrame.time &&
          this.loopedTime < this.keyframes[i + 1].time
        ) {
          const progress =
            (this.loopedTime - keyFrame.time) /
            (this.keyframes[i + 1].time - keyFrame.time);

          if (bone.id === keyFrame.name) {
            bone.position.X = this.interpolateKeyframe(
              keyFrame.position.X,
              this.keyframes[i + 1].position.X,
              progress
            );
            bone.position.Y = this.interpolateKeyframe(
              keyFrame.position.Y,
              this.keyframes[i + 1].position.Y,
              progress
            );
            bone.rotation = this.interpolateKeyframe(
              keyFrame.angle,
              this.keyframes[i + 1].angle,
              progress
            );
            bone.scale.X = this.interpolateKeyframe(
              keyFrame.scale.X,
              this.keyframes[i + 1].scale.X,
              progress
            );
            bone.scale.Y = this.interpolateKeyframe(
              keyFrame.scale.Y,
              this.keyframes[i + 1].scale.Y,
              progress
            );
            bone.startX = keyFrame.clip.startX;
            bone.startY = keyFrame.clip.startY;
            bone.endX = keyFrame.clip.endX;
            bone.endY = keyFrame.clip.endY;
          }
        }
      }
    }
  }
}
