export type ClipAnimation = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

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
import { FilterBonesDialogComponent } from '../filter-bones-dialog/filter-bones-dialog.component';
import { MathUtils } from '../../Utils/MathUtils';
import { ChangeBoneCommand } from 'src/commands/change-bone-command';
import { Animation, ResourceManager } from 'src/core/resource-manager';
import { InputDialogComponent } from '../input-dialog/input-dialog.component';
import { Loader } from '../loader';

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
  elapsedTime: number = 0;

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

  activeState: string = '';

  keyframeForm = new FormGroup({
    time: new FormControl(0),
    angle: new FormControl(0),
    name: new FormControl(''),
  });

  dataSource: BoneHierarchy[] = new Array();

  //Looks very c#iie
  childrenAccessor = (bone: BoneHierarchy) => bone.children ?? [];
  hasChild = (_: number, bone: BoneHierarchy) =>
    !!bone.children && bone.children.length > 0;

  private readonly _formBuilder = inject(FormBuilder);
  boneForm = this._formBuilder.group(this.dataSource);

  changeBoneCommand!: ChangeBoneCommand;

  //For creating files and get all animation keys
  activeFilename: string = '';
  animationStates: string[] = new Array();
  animationFiles: string[] = new Array();
  activeAnimations: Animation | undefined;

  skeletonBones: string[] = new Array();
  skeletonFiles: string[] = new Array();

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
      const bones = JSON.parse(localStorage.getItem('bones')!);
      this.adjustBoneFromJSONImport(bones);
      this.bones.push(...bones);
      if (this.bones.length > 0) {
        this.createBoneHierarchy();
        this.sortBonesByHierarchy();
      }
    }

    if (localStorage.getItem('frames') !== null) {
      this.keyframes.push(...JSON.parse(localStorage.getItem('frames')!));
      for (const keyframe of this.keyframes) {
        if (!keyframe.position) {
          keyframe.position = new Vec(0, 0);
        }
      }
      this.filteredKeyframes = this.keyframes;
    }

    (async () => {
      await ResourceManager.loadAllAnimations();
    })().then(() => {
      const animation = ResourceManager.getAnimations();
      this.animationStates.push(...Object.keys(animation));

      for (const key of ResourceManager.getAnimations().keys()) {
        this.animationFiles.push(key);
      }
    });

    (async () => {
      await Loader.loadAllBones();
    })().then(() => {
      const skeleton = Loader.getBonesFiles();
      for (const key of skeleton.keys()) {
        this.skeletonFiles.push(key);
      }
    });
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

  setKeyframesFromResource(name: string) {
    this.activeState = name;
    this.keyframes = ResourceManager.getAnimation(this.activeFilename, name);
    this.filteredKeyframes = this.keyframes;
    console.log(this.keyframes);
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

  changeAnimationFile(filename: string) {
    this.activeFilename = filename;
    this.activeAnimations = ResourceManager.getAllAnimationsFromFile(filename);
    if (this.activeAnimations) {
      this.animationStates = Object.keys(this.activeAnimations);
    }
  }

  changeSkeleton(filename: string) {
    this.bones = Loader.getBones(filename);
    this.filteredBones = this.bones;
    this.createBoneHierarchy();
    this.sortBonesByHierarchy();
  }

  createNewState() {
    let stateName = '';
    const dialogRef = this.dialog.open(InputDialogComponent, {
      height: '400px',
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== '') {
        stateName = result;
        const animations = ResourceManager.getAllAnimationsFromFile(
          this.activeFilename
        );
        if (!animations) return;
        animations[stateName] = new Array();
        this.animationStates = Object.keys(animations);
        console.log(this.animationStates);
      }
    });
  }

  saveNewFile() {
    if (!this.activeAnimations) return;
    console.log(this.activeAnimations);
    ResourceManager.saveJSONFile(this.activeAnimations, this.activeFilename);
    console.log('Saved new JSON');
  }

  setTime() {
    this.elapsedTime = this.loopedTime;
    this.runAnimation();
  }

  drawSpritesheet() {
    if (!this.showSpritesheet) return;
    this.ctx.drawImage(this.spriteSheet, this.camera.x, this.camera.y);
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
    const dialogRef = this.dialog.open(ImportBonesDialogComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      try {
        this.bones = [];
        const bones = JSON.parse(result);
        this.adjustBoneFromJSONImport(bones);
        this.bones.push(...bones);
        if (this.bones.length > 0) {
          this.createBoneHierarchy();
          this.sortBonesByHierarchy();
        }
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
        if (this.activeAnimations) {
          this.activeAnimations[this.activeState] = [];
        }
        this.keyframes = [];
        this.filteredKeyframes = [];
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
    console.log('exportet bones');
    console.log(localStorage.getItem('bones'));
  }

  calculateGlobalRotation(bone: Bone): number {
    if (bone.parentId !== null) {
      const parent = MathUtils.findBoneById(this.bones, bone.parentId);
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
      this.ctx.moveTo(bone.position.x, bone.position.y);
      const newPos = MathUtils.calculateParentPosition(
        bone.position,
        bone.length,
        bone.globalRotation - bone.globalSpriteRotation // I dunno why but it works
      );
      this.ctx.lineTo(newPos.x, newPos.y);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'red';
      this.ctx.arc(bone.position.x, bone.position.y, 10, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    }
  }

  createKeyframesOfBones() {
    for (const bone of this.filteredBones) {
      const keyframe: Keyframe = {
        position: new Vec(bone.position.x, bone.position.y),
        time: this.keyframeSliderValue,
        angle: bone.rotation,
        name: bone.id,
        scale: new Vec(bone.scale.x, bone.scale.y),
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
      this.ctx.translate(bone.position.x, bone.position.y);
      this.ctx.rotate(
        MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2
      );
      this.ctx.scale(bone.scale.x, bone.scale.y);
      this.ctx.translate(-bone.position.x, -bone.position.y);
      this.ctx.drawImage(
        this.spriteSheet,
        bone.startX,
        bone.startY,
        bone.endX,
        bone.endY,
        bone.position.x - bone.pivot.x - bone.endX / 2,
        bone.position.y - bone.pivot.y,
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
      this.mouseDown.x,
      this.mouseDown.y,
      this.mousePos.x - this.mouseDown.x,
      this.mousePos.y - this.mouseDown.y
    );
    this.ctx.stroke();
  }

  togglePlay() {
    this.play = !this.play;
  }

  playAnimation() {
    if (this.play) {
      this.elapsedTime += 0.016 * this.animationSpeed;
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
      this.canvasWidth / 2 + this.activeBone.position.x,
      this.canvasHeight / 2 + this.activeBone.position.y
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
      this.mousePos.x =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mousePos.y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
    });
    this.canvas.nativeElement.addEventListener('mousedown', (event) => {
      this.mouseDown.x =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mouseDown.y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
      this.isMouseDown = true;
    });
    this.canvas.nativeElement.addEventListener('mouseup', (event) => {
      this.mouseUp.x =
        event.clientX - bound.left - this.canvas.nativeElement.clientLeft;
      this.mouseUp.y =
        event.clientY - bound.top - this.canvas.nativeElement.clientTop;
      this.isMouseDown = false;
      this.animation.startX = this.mouseDown.x - this.camera.x;
      this.animation.startY = this.mouseDown.y - this.camera.y;
      this.animation.endX = this.mouseUp.x - this.mouseDown.x;
      this.animation.endY = this.mouseUp.y - this.mouseDown.y;
    });

    this.canvas.nativeElement.addEventListener('wheel', (event) => {
      this.camera.y += event.deltaY / 10;
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
      this.activeBone.position.x = this.mousePos.x - this.canvasWidth / 2;
      this.activeBone.position.y = this.mousePos.y - this.canvasHeight / 2;
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
      'Pos x: ' +
        this.mouseUp.x.toString() +
        ' Pos y: ' +
        this.mouseUp.y.toString(),
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
      this.mouseDown.x - this.camera.x,
      this.mouseDown.y - this.camera.y,
      this.mouseUp.x - this.mouseDown.x,
      this.mouseUp.y - this.mouseDown.y,
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
    const bone = MathUtils.findBoneById(this.bones, boneId);
    if (!bone) return;
    this.activeBone = bone;
    this.rotationSliderValue = bone.rotation;
    this.lengthSliderValue = bone.length;
    this.scaleSliderValue = bone.scale.y;
  }

  inactivateBone() {
    this.activeBone = null;
  }

  mouseCollision() {
    if (!this.activeBone) return;
    if (!this.activeBone.position) return;
    this.activeBone.position.x = this.mousePos.x - this.canvasWidth / 2;
    this.activeBone.position.y = this.mousePos.y - this.canvasHeight / 2;
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
        const parent = MathUtils.findBoneById(this.bones, bone.parentId);
        if (parent) {
          parentRotation = this.calculateGlobalRotation(parent);
          bone.position = MathUtils.calculateParentPosition(
            parent.position,
            parent.length * bone.attachAt * parent.scale.y,
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
    if (!keyframe.position) {
      this.activeKeyframe.position = new Vec(0, 0);
    }
  }

  updateKeyframe() {}

  changeBone(index: number) {
    let dialogRef = this.dialog.open(BoneDialogComponent, {
      width: '600px',
      height: '400px',
      data: this.bones[index],
    });
  }

  adjustBoneFromJSONImport(bones: Bone[]) {
    for (const bone of bones) {
      bone.position = new Vec(bone.position.x, bone.position.y);
      bone.pivot = new Vec(bone.pivot.x, bone.pivot.y);
    }
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
    const mousePosx = this.mouseDown.x - this.canvasWidth / 2;
    const mousePosy = this.mouseDown.y - this.canvasHeight / 2;
    for (const bone of this.bones) {
      console.log(bone);
      const distance = bone.position.dist(new Vec(mousePosx, mousePosy));
      if (distance <= 10) {
        this.activateBone(bone.id);
        return true;
      }
    }
    return false;
  }

  isMouseOverSprite(bone: Bone): boolean {
    const mousex = this.mousePos.x - this.canvasWidth / 2;
    const mousey = this.mousePos.y - this.canvasHeight / 2;
    return (
      mousex > bone.position.x - bone.endX / 2 &&
      mousex < bone.endX &&
      mousey > bone.position.y &&
      mousey < bone.endY
    );
  }

  runAnimation() {
    if (this.keyframes.length === 0) return;
    this.activeBone = null;
    this.activeKeyframe = null;
    this.totalDuration = this.keyframes[this.keyframes.length - 1].time;
    this.loopedTime = this.elapsedTime % this.totalDuration;
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
            if (keyFrame.position) {
              bone.position.x = MathUtils.interpolateKeyframe(
                keyFrame.position.x,
                this.keyframes[i + 1].position.x,
                progress
              );
              bone.position.y = MathUtils.interpolateKeyframe(
                keyFrame.position.y,
                this.keyframes[i + 1].position.y,
                progress
              );
            }

            bone.rotation = MathUtils.interpolateKeyframe(
              keyFrame.angle,
              this.keyframes[i + 1].angle,
              progress
            );
            bone.scale.x = MathUtils.interpolateKeyframe(
              keyFrame.scale.x,
              this.keyframes[i + 1].scale.x,
              progress
            );
            bone.scale.y = MathUtils.interpolateKeyframe(
              keyFrame.scale.y,
              this.keyframes[i + 1].scale.y,
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
