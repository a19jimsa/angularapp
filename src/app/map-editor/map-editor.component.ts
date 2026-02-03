import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  model,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Loader } from '../loader';
import { Bone } from 'src/components/bone';
import { Model } from 'src/renderer/model';
import { Ecs } from 'src/core/ecs';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { Mesh } from 'src/components/mesh';
import { Material } from 'src/components/material';
import { RenderSystem } from 'src/systems/render-system';
import { BrushSystem } from 'src/systems/brush-system';
import { Splatmap } from 'src/components/splatmap';
import { AnimatedTexture } from 'src/components/animatedTexture';
import { MatSelectModule } from '@angular/material/select';
import { Entity } from '../entity';
import { Name } from 'src/components/name';
import { Transform3D } from 'src/components/transform3D';
import { AnimationSystem } from 'src/systems/animation-system';
import { Skeleton } from 'src/components/skeleton';
import { ResourceManager } from 'src/core/resource-manager';
import { MatDialog } from '@angular/material/dialog';
import { CreateEntityDialogComponent } from '../create-entity-dialog/create-entity-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { Water } from 'src/components/water';
import { Terrain } from 'src/components/terrain';
import { Component as ECSComponent } from 'src/components/component';
import { ControllerSystem } from 'src/systems/controller-system';
import { MovementSystem } from 'src/systems/movement-system';
import { Controlable } from 'src/components/controlable';
import { Player } from 'src/components/player';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { MouseHandler } from 'src/core/mouse-handler';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Light } from 'src/components/light';
import { Renderer } from 'src/renderer/renderer';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { Keyboard } from 'src/core/keyboard';
import { BufferLayout } from 'src/renderer/buffer';
import { ShaderDataType, ShaderType } from 'src/renderer/shader-data-type';
import { Pivot } from 'src/components/pivot';
import { Grass } from 'src/components/grass';
import { BrushImageComponent } from '../brush-image/brush-image.component';
import { CommandManager } from 'src/resource-manager/command-manager';
import { FlowMap } from 'src/components/flow-map';
import { BatchRenderable } from 'src/components/batch-renderable';

type IsSelected = {
  select: boolean;
  element: number;
};

export type Mouse = {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  deltaX: number;
  deltaY: number;
  dir: vec3;
  dragging: boolean;
  pressed: boolean;
  isDown: boolean;
  clicked: boolean;
  moving: boolean;
  released: boolean;
  isSelected: IsSelected;
  scrollDeltaY: number;
  lastScrollDeltaY: number;
};

export enum Tools {
  Splatmap,
  Heightmap,
}

export enum ToolBrush {
  Height,
  Grass,
  Trees,
  Splat,
  Pivot,
}

export type Asset = {
  name: string;
  src: string;
};

export type Brush = {
  radius: number;
  strength: number;
  color: string;
  alpha: number;
  image: HTMLImageElement;
  type: ToolBrush;
  entity: Entity;
  negative: boolean;
  fallOff: number;
  imageName: string;
  textureSlot: number;
};

@Component({
  selector: 'app-map-editor',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatAccordion,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatSliderModule,
    MatRadioModule,
    MatSelectModule,
    MatMenuModule,
    BrushImageComponent,
  ],
  templateUrl: './map-editor.component.html',
  styleUrl: './map-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapEditorComponent implements AfterViewInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;
  width: number = 0;
  height: number = 0;
  mouseHandler!: MouseHandler;
  keyboard = new Keyboard();
  bones: Bone[] = new Array();
  angle = 0;
  splatColor = 'red';
  tool: Tools = 0;
  ecs: Ecs;
  //All systems in editor
  renderSystem!: RenderSystem;
  brushSystem: BrushSystem = new BrushSystem();
  controllerSystem: ControllerSystem = new ControllerSystem();
  movementSystem: MovementSystem = new MovementSystem();
  brushToolsImages: HTMLImageElement[] = new Array();
  selectedShader: string = 'default';
  sceneObjects: Map<Name, Entity[]> = new Map<Name, Entity[]>();
  transform: Transform3D = new Transform3D(0, 0, 0);
  animationSystem: AnimationSystem = new AnimationSystem();
  componentsList: ECSComponent[] = new Array();
  editorCamera: PerspectiveCamera;

  mouse: Mouse = {
    x: 0,
    y: 0,
    pressed: false,
    moving: false,
    dragging: false,
    dir: vec3.fromValues(0, 0, 0),
    released: true,
    isSelected: {
      select: false,
      element: 0,
    },
    lastX: 0,
    lastY: 0,
    deltaX: 0,
    deltaY: 0,
    clicked: false,
    isDown: false,
    scrollDeltaY: 0,
    lastScrollDeltaY: 0,
  };

  gameId: number = 0;

  play: boolean = false;

  meshbrush: Brush = {
    radius: 5,
    strength: 1,
    image: new Image(),
    type: ToolBrush.Grass,
    color: 'red',
    alpha: 1,
    entity: -1,
    negative: false,
    fallOff: 0,
    imageName: '',
    textureSlot: 0,
  };

  constructor(private cdr: ChangeDetectorRef) {
    //this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.editorCamera = new PerspectiveCamera(1920, 1080);
    this.ecs = new Ecs();
  }

  ngOnDestroy(): void {
    TextureManager.restore();
    ShaderManager.restore();
    cancelAnimationFrame(this.gameId);
  }

  get translateX() {
    return this.transform.translate[0];
  }

  get translateY() {
    return this.transform.translate[1];
  }

  get translateZ() {
    return this.transform.translate[2];
  }

  set translateX(value: number) {
    this.transform.translate[0] = value;
  }

  set translateY(value: number) {
    this.transform.translate[1] = value;
  }

  set translateZ(value: number) {
    this.transform.translate[2] = value;
  }

  get scaleX() {
    return this.transform.scale[0];
  }

  get scaleY() {
    return this.transform.scale[1];
  }

  get scaleZ() {
    return this.transform.scale[2];
  }

  set scaleX(value: number) {
    this.transform.scale[0] = value;
  }

  set scaleY(value: number) {
    this.transform.scale[1] = value;
  }

  set scaleZ(value: number) {
    this.transform.scale[2] = value;
  }

  get rotateX() {
    return this.transform.rotation[0];
  }

  get rotateY() {
    return this.transform.rotation[1];
  }

  get rotateZ() {
    return this.transform.rotation[2];
  }

  set rotateX(value: number) {
    this.transform.rotation[0] = value;
  }

  set rotateY(value: number) {
    this.transform.rotation[1] = value;
  }

  set rotateZ(value: number) {
    this.transform.rotation[2] = value;
  }

  get water(): Water | null {
    const water = this.ecs.getComponent<Water>(this.meshbrush.entity, 'Water');
    if (water) return water;
    return null;
  }

  get animatedTexture(): AnimatedTexture | null {
    const animatedTexture = this.ecs.getComponent<AnimatedTexture>(
      this.meshbrush.entity,
      'AnimatedTexture',
    );
    if (animatedTexture) return animatedTexture;
    return null;
  }

  get terrain(): Terrain | null {
    const terrain = this.ecs.getComponent<Terrain>(
      this.meshbrush.entity,
      'Terrain',
    );
    if (terrain) return terrain;
    return null;
  }

  get images() {
    return this.brushToolsImages;
  }

  get material(): Material | null {
    const material = this.ecs.getComponent<Material>(
      this.meshbrush.entity,
      'Material',
    );
    if (material) return material;
    return null;
  }

  get grass(): Grass | null {
    const grass = this.ecs.getComponent<Grass>(this.meshbrush.entity, 'Grass');
    if (grass) return grass;
    return null;
  }

  get light(): Light | null {
    const light = this.ecs.getComponent<Light>(this.meshbrush.entity, 'Light');
    if (light) return light;
    return null;
  }

  get splatmap(): Splatmap | null {
    const splatmap = this.ecs.getComponent<Splatmap>(
      this.meshbrush.entity,
      'Splatmap',
    );
    if (splatmap) return splatmap;
    return null;
  }

  setBrushTextureSlot(image: string) {
    this.meshbrush.imageName = image;
  }

  async ngAfterViewInit() {
    //Must do this first! INIT canvas! after viewinit
    this.canvas = this.canvasRef.nativeElement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    console.log(this.canvas);
    this.mouseHandler = new MouseHandler(this.canvas);
    Renderer.create(this.canvas, this.editorCamera);
    await Loader.loadAllBones();
    await ResourceManager.loadAllAnimations();
    await this.loadAllShaders();
    await this.loadAllbrushes();
    this.bones = Loader.getBones('skeleton');
    this.renderSystem = new RenderSystem(this.editorCamera);
    const image = await TextureManager.loadImage('assets/sprites/tree.png');
    const slot = TextureManager.createAndBindTexture(
      'tree',
      image,
      image.width,
      image.height,
    );
    await this.init();
  }

  async loadAllShaders() {
    await ShaderManager.load(
      'batch',
      'batch2d_vertex.txt',
      'batch2d_fragment.txt',
    );

    await ShaderManager.load(
      'skybox',
      'skybox_vertex.txt',
      'skybox_fragment.txt',
    );
    await ShaderManager.load('basic', 'basic_vertex.txt', 'basic_fragment.txt');
    await ShaderManager.load(
      'splatmap',
      'image_vertex.txt',
      'image_fragment.txt',
    );
    await ShaderManager.load('water', 'water_vertex.txt', 'water_fragment.txt');
    await ShaderManager.load('debug', 'debug_vertex.txt', 'debug_fragment.txt');
  }

  changeActiveEntity(newEntity: Entity) {
    const debug = new BufferLayout();
    debug.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    debug.add(1, ShaderDataType.GetType(ShaderType.Float), 3, false);
    this.ecs.addComponent<Pivot>(newEntity, new Pivot());
    const model = new Model();
    model.addPivot();
    MeshManager.addMesh(model, 'pivot', debug);
    const transform = this.ecs.getComponent<Transform3D>(
      newEntity,
      'Transform3D',
    );
    this.meshbrush.entity = newEntity;
    if (!transform) return;
    this.transform = transform;
    this.getToolbarComponents();
  }

  changeBrushImage(image: HTMLImageElement) {
    this.meshbrush.image = image;
  }

  changeTool(name: string) {
    if (name === 'grass') {
      this.meshbrush.type = ToolBrush.Grass;
    } else if (name === 'tree') {
      this.meshbrush.type = ToolBrush.Trees;
    } else if (name === 'height') {
      this.meshbrush.type = ToolBrush.Height;
    } else if (name === 'splat') {
      this.meshbrush.type = ToolBrush.Splat;
    } else if (name === 'pivot') {
      this.meshbrush.type = ToolBrush.Pivot;
    }
  }

  addToScene() {
    this.openDialog();
  }

  async loadAllbrushes() {
    const smokeBrushImage = await TextureManager.loadImage(
      'assets/brushes/smoke_brush.jpg',
    );

    const starBrushImage = await TextureManager.loadImage(
      'assets/brushes/star_brush.jpg',
    );

    const terrainBrushImage = await TextureManager.loadImage(
      'assets/brushes/terrain_brush.jpg',
    );

    const roundBrushImage = await TextureManager.loadImage(
      'assets/brushes/round_brush.jpg',
    );

    const smallRoundBrushImage = await TextureManager.loadImage(
      'assets/brushes/round_brush_small.jpg',
    );

    const smallBrushImage = await TextureManager.loadImage(
      'assets/brushes/small_brush.jpg',
    );

    this.brushToolsImages.push(
      smokeBrushImage,
      starBrushImage,
      terrainBrushImage,
      roundBrushImage,
      smallRoundBrushImage,
      smallBrushImage,
    );
  }

  async init() {
    //Add all entities with names to the scene list to display them in the scene list
    for (const entity of this.ecs.getEntities()) {
      const name = this.ecs.getComponent<Name>(entity, 'Name');
      if (!name) continue;
      if (this.sceneObjects.has(name)) {
        this.sceneObjects.get(name)!.push(entity); // lägg till i listan
      } else {
        this.sceneObjects.set(name, [entity]); // skapa ny lista
      }
    }

    //Init brushimage to brush
    this.meshbrush.image = this.brushToolsImages[0];

    this.cdr.detectChanges();
    this.loop();
  }

  protected async createCharacter() {
    const image = await TextureManager.loadImage(
      '/assets/textures/character-animation.png',
    );
    const character = 'character';
    const textureSlot = TextureManager.createAndBindTexture(
      character,
      image,
      image.width,
      image.height,
    );
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));

    const playerSkeleton = new Skeleton(
      '/assets/textures/frogman.png',
      'frogAnimations',
    );
    playerSkeleton.bones = Loader.getBones('skeleton');
    const skeleton = this.ecs.addComponent<Skeleton>(entity, playerSkeleton);
    this.ecs.addComponent<Controlable>(entity, new Controlable());
    this.ecs.addComponent<Player>(entity, new Player());

    this.ecs.addComponent<BatchRenderable>(
      entity,
      new BatchRenderable(textureSlot),
    );
    if (!skeleton) return;
    skeleton.image = playerSkeleton.image;
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      'idle',
    );
    skeleton.animationDuration =
      skeleton.keyframes[skeleton.keyframes.length - 1].time;
    skeleton.startTime = performance.now();
  }

  async createFrog() {
    const image = await TextureManager.loadImage(
      '/assets/textures/frog-enemy.png',
    );
    const textureSlot = TextureManager.createAndBindTexture(
      'frog',
      image,
      image.width,
      image.height,
    );
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Frogman'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    const playerSkeleton = new Skeleton(
      '/assets/textures/frog-enemy.png',
      'frogAnimations',
    );
    playerSkeleton.bones = Loader.getBones('frogman');
    const skeleton = this.ecs.addComponent<Skeleton>(entity, playerSkeleton);
    this.ecs.addComponent<BatchRenderable>(
      entity,
      new BatchRenderable(textureSlot),
    );
    if (!skeleton) return;
    skeleton.image = image;
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      'idle',
    );
    skeleton.animationDuration =
      skeleton.keyframes[skeleton.keyframes.length - 1].time;
    skeleton.startTime = performance.now();
  }

  public getSceneObjectName(entity: Entity) {
    const name = this.ecs.getComponent<Name>(entity, 'Name');
    if (!name) return 'No name';
    return this.ecs.getComponent<Name>(entity, 'Name').value;
  }

  protected async createTerrainWithSplatmap() {
    const newEntity = this.ecs.createEntity();
    const width = 128;
    const height = 128;
    const image = await TextureManager.loadImage(
      '/assets/textures/texture_map.jpg',
    );
    const name = 'textureMap';
    const texture = TextureManager.createAndBindTexture(
      name,
      image,
      image.width,
      image.height,
    );
    const splatmap = 'splatmap' + newEntity;
    const splatmapTexture = TextureManager.createAndBindTexture(
      splatmap,
      null,
      width,
      height,
    );
    const model = new Model();
    model.addPlane(50, 1000, 1000);
    this.ecs.addComponent<Name>(newEntity, new Name('Terrain ' + newEntity));
    this.ecs.addComponent(newEntity, new Material(texture, 'splatmap'));
    //Add mesh component to entity VAO splatmap id meshId
    this.ecs.addComponent(
      newEntity,
      new Mesh(
        model.vertices,
        model.indices,
        1000,
        1000,
        'splatmap' + newEntity,
      ),
    );
    this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap(width, height, splatmapTexture),
    );
    //Add material component to entity
    this.ecs.addComponent<Terrain>(newEntity, new Terrain());
    this.ecs.addComponent<Transform3D>(newEntity, new Transform3D(0, 0, 0));
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    MeshManager.addMesh(model, 'splatmap' + newEntity, buffer);
  }

  public createAdjacentTerrain() {
    // const activeEntity = this.meshbrush.entity;
    // const mesh = this.ecs.getComponent<Mesh>(activeEntity, 'Mesh');
    // const transform3D = this.ecs.getComponent<Transform3D>(
    //   activeEntity,
    //   'Transform3D'
    // );
    // const splatmap = this.ecs.getComponent<Splatmap>(activeEntity, 'Splatmap');
    // if (mesh && transform3D && splatmap) {
    //   this.makeTerrainSeamless(mesh);
    //   const newVertices = [...mesh.vertices];
    //   const newIndices = [...mesh.indices];
    //   for (let i = 0; i < mesh.vertices.length / mesh.meshId; i += 8) {
    //     const x = mesh.vertices[i + 0] + 1000 * mesh.meshId;
    //     const y = mesh.vertices[i + 1];
    //     const z = mesh.vertices[i + 2];
    //     const u = mesh.vertices[i + 3];
    //     const v = mesh.vertices[i + 4];
    //     const normal1 = mesh.vertices[i + 6];
    //     const normal2 = mesh.vertices[i + 7];
    //     const normal3 = mesh.vertices[i + 8];
    //     newVertices.push(x, y, z, u, v, normal1, normal2, normal3);
    //   }
    //   for (let i = 0; i < mesh.indices.length / mesh.meshId; i++) {
    //     newIndices.push(mesh.indices[i] + mesh.vertices.length / 8);
    //   }
    //   const adjacentMesh = new Mesh(newVertices, newIndices, 1);
    //   this.ecs.removeComponent(this.meshbrush.entity, 'Mesh');
    //   const newMesh = this.ecs.addComponent<Mesh>(
    //     this.meshbrush.entity,
    //     adjacentMesh
    //   );
    //   mesh.meshId++;
    //   if (newMesh === null) throw new Error('Could not add id to mesh!');
    //   newMesh.meshId = mesh.meshId;
    // }
  }

  // private makeTerrainSeamless(mesh: Mesh) {
  //   let newValue: number[] = [];
  //   for (let i = 0; i < mesh.vertices.length; i += 8 * 101) {
  //     newValue.push(mesh.vertices[i + 1]);
  //   }
  //   let index = 0;
  //   for (let i = 0; i < mesh.vertices.length; i += 8 * 101) {
  //     mesh.vertices[i + 100 * 8 + 1] = newValue[index];
  //     index++;
  //   }
  // }

  getToolbarComponents() {
    const list = [];
    const entity = this.meshbrush.entity;
    const components = this.ecs.getComponents(entity);
    if (components.length === 0) return;
    for (const component of components) {
      list.push(component);
    }
    this.componentsList = list;
  }

  protected createCylinder() {
    const cylinderModel = new Model();
    cylinderModel.addCylinder();
    const effectEntity = this.ecs.createEntity();
    this.ecs.addComponent<Material>(
      effectEntity,
      new Material('whirlwind', 'whirlwind'),
    );
    this.ecs.addComponent<AnimatedTexture>(effectEntity, new AnimatedTexture());
    this.ecs.addComponent<Transform3D>(effectEntity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Name>(effectEntity, new Name('Cylinder'));
    this.ecs.addComponent<Mesh>(
      effectEntity,
      new Mesh(
        cylinderModel.vertices,
        cylinderModel.indices,
        50,
        50,
        'cylinder' + effectEntity,
      ),
    );
    //MeshManager.addMesh(cylinderModel, 'cylinder' + effectEntity);
  }

  createLightSource() {
    const layout = new BufferLayout();
    layout.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model();
    model.addCube(10, 10, 10);
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Light'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(500, 10, 500));
    this.ecs.addComponent<Light>(entity, new Light());

    const mesh = this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(model.vertices, model.indices, 10, 10, 'light'),
    );

    MeshManager.addMesh(model, 'light', layout);
  }

  protected async createWater() {
    const width = 1000;
    const height = 1000;
    const waterImage = await TextureManager.loadImage(
      'assets/textures/water_texture.jpg',
    );
    const textureSlot = TextureManager.createAndBindTexture(
      'water',
      waterImage,
      waterImage.width,
      waterImage.height,
    );
    const entity = this.ecs.createEntity();
    const model = new Model();
    //Change later in runtime with some parameters in UI
    model.addPlane(50, width, height);
    this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(model.vertices, model.indices, width, height, 'water'),
    );
    this.ecs.addComponent<Material>(entity, new Material(textureSlot, 'water'));
    this.ecs.addComponent<AnimatedTexture>(entity, new AnimatedTexture());
    this.ecs.addComponent<Name>(entity, new Name('Water'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Water>(entity, new Water());
    const flowMapSlot = TextureManager.createAndBindTexture(
      'FlowMap',
      null,
      64,
      64,
    );
    this.ecs.addComponent<FlowMap>(entity, new FlowMap(flowMapSlot));
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    MeshManager.addMesh(model, 'water', buffer);
  }

  protected async addTextureToMaterial(path: string) {
    const image = await TextureManager.loadImage(path);
    const textureSlot = TextureManager.createAndBindTexture(
      'textureMap',
      image,
      image.width,
      image.height,
    );
    const material = this.ecs.getComponent<Material>(
      this.meshbrush.entity,
      'Material',
    );
    if (!material) return;
    material.slot = textureSlot;
  }

  protected async addGrass() {
    const grass = new BufferLayout();
    grass.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    grass.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    grass.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const shader = await ShaderManager.load(
      'grass',
      'grass_vertex.txt',
      'grass_fragment.txt',
    );

    const image = await TextureManager.loadImage('assets/textures/noise.jpg');
    TextureManager.createAndBindTexture(
      'grass',
      image,
      image.width,
      image.height,
    );
    const grassComponent = this.ecs.addComponent<Grass>(
      this.meshbrush.entity,
      new Grass(),
    );
    this.ecs.addComponent<Material>(
      this.meshbrush.entity,
      new Material('grass', 'grass'),
    );
    if (!grassComponent) return;
    const grassModel = new Model();
    grassModel.addGrass();
    MeshManager.addMesh(grassModel, 'grass', grass);
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    MeshManager.addInstanceMesh(
      'grass',
      instanceBuffer,
      grassComponent.positions,
    );
  }

  loop() {
    //FPS
    //console.log(Math.floor(performance.now() / 1000));
    if (this.play) {
      this.gameMode();
    } else {
      this.input();
      this.update();
    }
    this.draw();
    this.gameId = requestAnimationFrame(() => this.loop());
  }

  private input() {
    this.mouse.x = this.mouseHandler.getMousePosition[0];
    this.mouse.y = this.mouseHandler.getMousePosition[1];

    if (this.mouseHandler.getIsMouseDown) {
      this.mouse.pressed = true;
      this.mouse.released = false;
    } else {
      this.mouse.pressed = false;
      this.mouse.released = true;
      this.mouse.isSelected = { select: false, element: -1 };
    }

    if (this.mouse.pressed && !this.mouse.isDown) {
      console.log('Mouse is clicked once');
      this.mouse.clicked = true;
      this.mouse.isDown = true;
    } else {
      this.mouse.clicked = false;
    }

    if (this.mouse.released) {
      this.mouse.isDown = false;
    }

    if (
      this.keyboard.isKeyPressed('Control') &&
      this.keyboard.isKeyPressed('z')
    ) {
      CommandManager.undo();
    }

    //Dragging
    if (
      this.mouse.pressed &&
      (Math.floor(this.mouse.lastX) !== Math.floor(this.mouse.x) ||
        Math.floor(this.mouse.lastY) !== Math.floor(this.mouse.y))
    ) {
      console.log('Dragging is true');
      this.mouse.dragging = true;
      this.mouse.deltaX = this.mouse.lastX - this.mouse.x;
      this.mouse.deltaY = this.mouse.lastY - this.mouse.y;
    } else {
      this.mouse.dragging = false;
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
    }
    this.mouse.lastX = this.mouse.x;
    this.mouse.lastY = this.mouse.y;
    this.cameraMovement();
  }

  update() {
    if (this.mouse.dragging) {
      this.mouse.dir = this.calculateRayCast();
      this.brushSystem.update(
        this.meshbrush,
        this.ecs,
        this.mouse,
        this.editorCamera,
      );
    }
  }

  draw() {
    this.renderSystem.update(this.ecs);
  }

  openDialog() {
    const dialogRef = this.dialog.open(CreateEntityDialogComponent, {
      width: '250px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog reesult ' + result);
    });
  }

  // saveEntity() {
  //   const blob = new Blob(
  //     [JSON.stringify(this.ecs.getComponents(this.meshbrush.entity))],
  //     {
  //       type: 'application/json',
  //     }
  //   );
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'world';
  //   a.click();

  //   URL.revokeObjectURL(url); // Städa upp
  // }

  loadEntity() {}
  editorMode() {}

  gameMode() {
    this.controllerSystem.update(this.ecs);
    // this.movementSystem.update(this.ecs);
  }

  togglePlay() {
    this.play = !this.play;
  }

  //Calculate RayCast from mousePosition of canvas
  //Return mouseRay vector 3
  public calculateRayCast() {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.mouse.x;
    const y = this.mouse.y;
    //Between local space -1 - +1
    const clipX = (x / rect.width) * 2 - 1;
    const clipY = (y / rect.height) * -2 + 1;
    const normalizedPos = vec2.fromValues(clipX, clipY);
    const clipCoords = vec4.fromValues(
      normalizedPos[0],
      normalizedPos[1],
      -1,
      1,
    );
    const invertedProjectionMatrix = mat4.create();
    mat4.invert(
      invertedProjectionMatrix,
      this.editorCamera.getProjectionMatrix(),
    );
    const eyeCoords = vec4.fromValues(0, 0, 0, 0);
    vec4.transformMat4(eyeCoords, clipCoords, invertedProjectionMatrix);
    const toEyeCoords = vec4.fromValues(eyeCoords[0], eyeCoords[1], -1, 0);
    const invertedView = mat4.create();
    mat4.invert(invertedView, this.editorCamera.getViewMatrix());
    const rayWorld = vec4.fromValues(0, 0, 0, 0);
    vec4.transformMat4(rayWorld, toEyeCoords, invertedView);
    const mouseRay = vec3.fromValues(rayWorld[0], rayWorld[1], rayWorld[2]);
    vec3.normalize(mouseRay, mouseRay);
    return mouseRay;
  }

  private cameraMovement() {
    const speed = 1;
    let moveX = 0;
    let moveY = 0;
    let moveZ = 0;
    let rotateX = 0;
    let rotateY = 0;
    let rotateZ = 0;

    if (this.keyboard.isKeyPressed('w')) moveZ += speed;
    if (this.keyboard.isKeyPressed('s')) moveZ -= speed;

    if (this.keyboard.isKeyPressed('d')) moveX += speed;
    if (this.keyboard.isKeyPressed('a')) moveX -= speed;

    // Flyga upp/ner med space/shift om du vill
    if (this.keyboard.isKeyPressed(' ')) moveY += speed;
    if (this.keyboard.isKeyPressed('Shift')) moveY -= speed;

    if (this.keyboard.isKeyPressed('e')) rotateX += speed;
    if (this.keyboard.isKeyPressed('q')) rotateX -= speed;

    // if (this.keyboard.isKeyPressed('x')) rotateY += speed;
    // if (this.keyboard.isKeyPressed('z')) rotateY -= speed;

    if (this.keyboard.isKeyPressed('Escape')) {
      this.editorCamera.resetCamera();
    }

    if (this.mouseHandler.scrollY < 0) {
      rotateY -= speed;
      this.mouse.lastScrollDeltaY = this.mouseHandler.scrollY;
      this.mouseHandler.scrollY = 0;
    } else if (this.mouseHandler.scrollY > 0) {
      rotateY += speed;
      this.mouse.lastScrollDeltaY = this.mouseHandler.scrollY;
      this.mouseHandler.scrollY = 0;
    }

    // Uppdatera kameran (om något ändrats)
    if (moveX !== 0 || moveY !== 0 || moveZ !== 0) {
      this.editorCamera.updatePosition(moveX, moveY, moveZ);
    }

    if (rotateX !== 0 || rotateY !== 0 || rotateZ !== 0) {
      this.editorCamera.rotate(rotateX, rotateY);
    }
  }
}
