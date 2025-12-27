import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
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
import { Skybox } from 'src/components/skybox';
import { AnimatedTexture } from 'src/components/animatedTexture';
import { Grass } from 'src/components/grass';
import { Transform } from 'src/components/transform';
import { Vec } from '../vec';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
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
import { Pivot } from 'src/components/pivot';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Light } from 'src/components/light';
import { Renderer } from 'src/renderer/renderer';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { BatchRenderer } from 'src/renderer/batch-renderer';
import { MeshManager } from 'src/resource-manager/mesh-manager';

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
    //JsonPipe,
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
  sceneObjects: Set<Name> = new Set<Name>();
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
    textureSlot: 0,
  };

  constructor(private cdr: ChangeDetectorRef) {
    //this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.editorCamera = new PerspectiveCamera(1920, 1080);
    this.ecs = new Ecs();
  }

  ngOnDestroy(): void {
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
      'AnimatedTexture'
    );
    if (animatedTexture) return animatedTexture;
    return null;
  }

  get terrain(): Terrain | null {
    const terrain = this.ecs.getComponent<Terrain>(
      this.meshbrush.entity,
      'Terrain'
    );
    if (terrain) return terrain;
    return null;
  }

  get images() {
    return Array.from(TextureManager.getImages().values());
  }

  get material(): Material | null {
    const material = this.ecs.getComponent<Material>(
      this.meshbrush.entity,
      'Material'
    );
    if (material) return material;
    return null;
  }

  get light(): Light | null {
    const light = this.ecs.getComponent<Light>(this.meshbrush.entity, 'Light');
    if (light) return light;
    return null;
  }

  setBrushTextureSlot(index: number) {
    console.log(index);
    this.meshbrush.textureSlot = index;
  }

  async ngAfterViewInit() {
    //Must do this first! INIT canvas! after viewinit
    this.canvas = this.canvasRef.nativeElement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    console.log(this.canvas);
    this.mouseHandler = new MouseHandler(this.canvas, this.editorCamera);
    Renderer.create(this.canvas, this.editorCamera);
    TextureManager.setGl(Renderer.getGL);
    await Loader.loadAllBones();
    await ResourceManager.loadAllAnimations();
    await this.loadAllShaders();

    const tree = await TextureManager.loadTexture('/assets/sprites/tree.png');
    TextureManager.createAndBindTexture('tree', tree, tree.width, tree.height);
    const tree3 = await TextureManager.loadTexture('/assets/sprites/tree3.png');
    TextureManager.createAndBindTexture(
      'tree3',
      tree3,
      tree3.width,
      tree3.height
    );
    const enemy1 = await TextureManager.loadTexture(
      '/assets/sprites/irongolem.png'
    );
    TextureManager.createAndBindTexture(
      'enemy1',
      enemy1,
      enemy1.width,
      enemy1.height
    );
    const enemy2 = await TextureManager.loadTexture(
      '/assets/sprites/gianotgreen.png'
    );
    TextureManager.createAndBindTexture(
      'enemy2',
      enemy2,
      enemy2.width,
      enemy2.height
    );
    this.bones = Loader.getBones('skeleton');
    this.renderSystem = new RenderSystem(this.editorCamera);
    await this.init();
  }

  async loadAllShaders() {
    await ShaderManager.load(
      'batch',
      'batch2d_vertex.txt',
      'batch2d_fragment.txt'
    );
    await ShaderManager.load('grass', 'grass_vertex.txt', 'grass_fragment.txt');
    await ShaderManager.load(
      'skybox',
      'skybox_vertex.txt',
      'skybox_fragment.txt'
    );
    await ShaderManager.load('basic', 'basic_vertex.txt', 'basic_fragment.txt');
    await ShaderManager.load(
      'splatmap',
      'image_vertex.txt',
      'image_fragment.txt'
    );
    await ShaderManager.load('water', 'water_vertex.txt', 'water_fragment.txt');
    await ShaderManager.load('image', 'imageVS.txt', 'imageFS.txt');
    await ShaderManager.load('debug', 'debug_vertex.txt', 'debug_fragment.txt');
    await ShaderManager.load('lamp', 'lamp_vertex.txt', 'lamp_fragment.txt');
  }

  changeActiveEntity(entity: Entity) {
    this.ecs.removeComponent<Pivot>(this.meshbrush.entity, 'Pivot');
    this.meshbrush.entity = entity;
    const transform = this.ecs.getComponent<Transform3D>(entity, 'Transform3D');
    if (transform) {
      this.transform = transform;
      this.ecs.addComponent<Pivot>(entity, new Pivot());
    }
    this.getToolbarComponents();
  }

  changeBrushImage(id: number) {
    this.meshbrush.image = this.brushToolsImages[id];
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

  async init() {
    const whirlwindTexture = await TextureManager.loadTexture(
      '/assets/textures/whirlwind_map.jpg'
    );

    const textureMapImage = await TextureManager.loadTexture(
      '/assets/textures/texture_map.jpg'
    );

    const characterImage = await TextureManager.loadTexture(
      '/assets/textures/character-animation.png'
    );

    const waterImage = await TextureManager.loadTexture(
      '/assets/textures/water_texture.jpg'
    );

    const skybox1 = await TextureManager.loadTexture(
      'assets/textures/skybox/right.bmp'
    );
    const skybox2 = await TextureManager.loadTexture(
      'assets/textures/skybox/left.bmp'
    );
    const skybox3 = await TextureManager.loadTexture(
      'assets/textures/skybox/top.bmp'
    );
    const skybox4 = await TextureManager.loadTexture(
      'assets/textures/skybox/bottom.bmp'
    );
    const skybox5 = await TextureManager.loadTexture(
      'assets/textures/skybox/front.bmp'
    );
    const skybox6 = await TextureManager.loadTexture(
      'assets/textures/skybox/back.bmp'
    );

    const frogImage = await TextureManager.loadTexture(
      'assets/textures/frog-enemy.png'
    );

    const noise = await TextureManager.loadTexture('assets/textures/noise.jpg');

    // const spriteSlot = TextureManager.createAndBindTexture(sprite, sprite.width, sprite.height);
    const slot = TextureManager.createAndBindTexture(
      'textureMap',
      textureMapImage,
      textureMapImage.width,
      textureMapImage.height
    );

    const whirlwindSlot = TextureManager.createAndBindTexture(
      'whirlwind',
      whirlwindTexture,
      whirlwindTexture.width,
      whirlwindTexture.height
    );

    const characterSlot = TextureManager.createAndBindTexture(
      'character',
      characterImage,
      characterImage.width,
      characterImage.height
    );

    const waterSlot = TextureManager.createAndBindTexture(
      'water',
      waterImage,
      waterImage.width,
      waterImage.height
    );

    const noiseSlot = TextureManager.createAndBindTexture(
      'noise',
      noise,
      noise.width,
      noise.height
    );

    const frogSlot = TextureManager.createAndBindTexture(
      'frogman',
      frogImage,
      frogImage.width,
      frogImage.height
    );

    const skyboxImages = [skybox1, skybox2, skybox3, skybox4, skybox5, skybox6];
    const skyboxTexture = TextureManager.loadSkybox(skyboxImages);

    const smokeBrushImage = await TextureManager.loadTexture(
      'assets/brushes/smoke_brush.jpg'
    );

    const starBrushImage = await TextureManager.loadTexture(
      'assets/brushes/star_brush.jpg'
    );

    const terrainBrushImage = await TextureManager.loadTexture(
      'assets/brushes/terrain_brush.jpg'
    );

    const roundBrushImage = await TextureManager.loadTexture(
      'assets/brushes/round_brush.jpg'
    );

    const smallRoundBrushImage = await TextureManager.loadTexture(
      'assets/brushes/round_brush_small.jpg'
    );

    const smallBrushImage = await TextureManager.loadTexture(
      'assets/brushes/small_brush.jpg'
    );

    // const strokeBrushImage = await TextureManager.loadTexture(
    //   'assets/textures/stroke_brush.jpg'
    // );

    this.brushToolsImages.push(
      smokeBrushImage,
      starBrushImage,
      terrainBrushImage,
      roundBrushImage,
      smallRoundBrushImage,
      smallBrushImage
    );

    this.meshbrush.image = smallRoundBrushImage;

    const grassModel = new Model();
    grassModel.addGrass();

    const grassEntity = this.ecs.createEntity();
    this.ecs.addComponent<Material>(
      grassEntity,
      new Material('grass', TextureManager.getSlot('whirlwind'))
    );
    this.ecs.addComponent<AnimatedTexture>(grassEntity, new AnimatedTexture(0));
    this.ecs.addComponent<Grass>(grassEntity, new Grass());

    //Add all entities with names to the scene list to display them in the scene list
    for (const entity of this.ecs.getEntities()) {
      const name = this.ecs.getComponent<Name>(entity, 'Name');
      if (!name) continue;
      this.sceneObjects.add(name);
    }

    this.cdr.detectChanges();
    this.loop();
  }

  private createCharacter(image: HTMLImageElement) {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Player'));
    const transform3D = this.ecs.addComponent<Transform3D>(
      entity,
      new Transform3D(500, 10, 950)
    );
    transform3D!.scale[0] = 0.2;
    transform3D!.scale[1] = 0.2;
    transform3D!.scale[2] = 0.2;
    transform3D!.rotation[2] = 3.1;
    const playerSkeleton = new Skeleton(
      '/assets/textures/character-animation.jpg',
      'playerAnimations'
    );
    playerSkeleton.bones = Loader.getBones('skeleton');
    const skeleton = this.ecs.addComponent<Skeleton>(entity, playerSkeleton);
    this.ecs.addComponent<Controlable>(
      entity,
      new Controlable(new Vec(0, 0), 0, false)
    );
    this.ecs.addComponent<Player>(entity, new Player());
    this.ecs.addComponent<Transform>(
      entity,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    if (!skeleton) return;
    skeleton.image = image;
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      'idle'
    );
    skeleton.animationDuration =
      skeleton.keyframes[skeleton.keyframes.length - 1].time;
    skeleton.startTime = performance.now();
  }

  createFrog(image: HTMLImageElement) {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Frogman'));
    const transform3D = this.ecs.addComponent<Transform3D>(
      entity,
      new Transform3D(550, 3, 950)
    );
    transform3D!.scale[0] = 0.2;
    transform3D!.scale[1] = 0.2;
    transform3D!.scale[2] = 0.2;
    transform3D!.rotation[2] = 3.1;
    const playerSkeleton = new Skeleton(
      '/assets/textures/frog-enemy.jpg',
      'frogAnimations'
    );
    playerSkeleton.bones = Loader.getBones('frogman');
    const skeleton = this.ecs.addComponent<Skeleton>(entity, playerSkeleton);
    this.ecs.addComponent<Transform>(
      entity,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    if (!skeleton) return;
    skeleton.image = image;
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      'idle'
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

  changeShader(event: MatSelectChange) {
    for (const entity of this.ecs.getEntities()) {
      const material = this.ecs.getComponent<Material>(entity, 'Material');
      const splatmap = this.ecs.getComponent<Splatmap>(entity, 'Splatmap');
      if (material && splatmap) {
        if (event.value === 'default') {
          material.shader = 'splatmap';
        } else if (event.value === 'shader1') {
          material.shader = 'splatmap';
        }
      }
    }
  }

  setupSkybox(texture: WebGLTexture) {
    //First create model
    const skyboxModel = new Model();
    skyboxModel.addSkybox();
    //Then create mesh
    //Then add to entity!
    const skyboxEntity = this.ecs.createEntity();
    this.ecs.addComponent(skyboxEntity, new Name('Skybox'));
    this.ecs.addComponent(
      skyboxEntity,
      new Skybox('skybox', TextureManager.getSlot('skybox'))
    );
  }

  protected createTerrainWithSplatmap() {
    const width = 128;
    const height = 128;
    const model = new Model();
    model.addPlane(50);
    const newEntity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(newEntity, new Name('Terrain ' + newEntity));
    //Add mesh component to entity
    this.ecs.addComponent(
      newEntity,
      new Mesh(model.vertices, model.indices, MeshManager.getindex())
    );
    const splatmap = TextureManager.createAndBindTexture(
      'splatmap',
      null,
      width,
      height
    );
    console.log(splatmap);
    //Add splatmap to terrain entity
    const newSplatmap = this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap(width, height, splatmap)
    );
    console.log(newSplatmap);

    if (TextureManager.getSlot('textureMap') !== 4) {
      alert('Wrong');
    }
    //Add material component to entity
    this.ecs.addComponent(
      newEntity,
      new Material('splatmap', TextureManager.getSlot('textureMap'))
    );

    this.ecs.addComponent<Terrain>(newEntity, new Terrain());
    this.ecs.addComponent<Transform3D>(newEntity, new Transform3D(0, 0, 0));
    const vertexArray = MeshManager.addMesh(model.vertices, model.indices);
    console.log(vertexArray);
  }

  public createAdjacentTerrain() {
    const activeEntity = this.meshbrush.entity;
    const mesh = this.ecs.getComponent<Mesh>(activeEntity, 'Mesh');
    const transform3D = this.ecs.getComponent<Transform3D>(
      activeEntity,
      'Transform3D'
    );
    const splatmap = this.ecs.getComponent<Splatmap>(activeEntity, 'Splatmap');
    if (mesh && transform3D && splatmap) {
      this.makeTerrainSeamless(mesh);
      const newVertices = [...mesh.vertices];
      const newIndices = [...mesh.indices];
      for (let i = 0; i < mesh.vertices.length / mesh.meshId; i += 8) {
        const x = mesh.vertices[i + 0] + 1000 * mesh.meshId;
        const y = mesh.vertices[i + 1];
        const z = mesh.vertices[i + 2];
        const u = mesh.vertices[i + 3];
        const v = mesh.vertices[i + 4];
        const normal1 = mesh.vertices[i + 6];
        const normal2 = mesh.vertices[i + 7];
        const normal3 = mesh.vertices[i + 8];
        newVertices.push(x, y, z, u, v, normal1, normal2, normal3);
      }

      for (let i = 0; i < mesh.indices.length / mesh.meshId; i++) {
        newIndices.push(mesh.indices[i] + mesh.vertices.length / 8);
      }
      const adjacentMesh = new Mesh(newVertices, newIndices, 1);
      this.ecs.removeComponent(this.meshbrush.entity, 'Mesh');
      const newMesh = this.ecs.addComponent<Mesh>(
        this.meshbrush.entity,
        adjacentMesh
      );
      mesh.meshId++;
      if (newMesh === null) throw new Error('Could not add id to mesh!');
      newMesh.meshId = mesh.meshId;
    }
  }

  private makeTerrainSeamless(mesh: Mesh) {
    let newValue: number[] = [];
    for (let i = 0; i < mesh.vertices.length; i += 8 * 101) {
      newValue.push(mesh.vertices[i + 1]);
    }
    let index = 0;
    for (let i = 0; i < mesh.vertices.length; i += 8 * 101) {
      mesh.vertices[i + 100 * 8 + 1] = newValue[index];
      index++;
    }
  }

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
      new Material('splatmap', TextureManager.getSlot('whirlwind'))
    );

    this.ecs.addComponent<AnimatedTexture>(
      effectEntity,
      new AnimatedTexture(0)
    );

    this.ecs.addComponent<Transform3D>(effectEntity, new Transform3D(0, 0, 0));

    this.ecs.addComponent<Name>(effectEntity, new Name('Cylinder'));

    this.ecs.addComponent<Mesh>(
      effectEntity,
      new Mesh(cylinderModel.vertices, cylinderModel.indices, 1)
    );
    const vertex = MeshManager.addMesh(
      cylinderModel.vertices,
      cylinderModel.indices
    );
    console.log(vertex);
  }

  createLightSource() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Light'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Light>(entity, new Light());
    const model = new Model();
    model.addPlane(10);
    this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(model.vertices, model.indices, MeshManager.getindex())
    );
    const vertex = MeshManager.addMesh(model.vertices, model.indices);
    console.log(vertex);
  }

  protected createMesh(slot: number) {
    const entity = this.ecs.createEntity();
    const model = new Model();
    //Change later in runtime with some parameters in UI
    model.addPlane(10);
    this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(model.vertices, model.indices, MeshManager.getindex())
    );
    this.ecs.addComponent<Material>(entity, new Material('lamp', slot));
    const vertex = MeshManager.addMesh(model.vertices, model.indices);
    console.log(vertex);
  }

  protected createWater() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      entity,
      new Transform(new Vec(0, 0), new Vec(0, 0), 100)
    );
    const model = new Model();
    //Change later in runtime with some parameters in UI
    model.addPlane(50);
    this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(model.vertices, model.indices, MeshManager.getindex())
    );
    this.ecs.addComponent<Material>(
      entity,
      new Material('water', TextureManager.getSlot('water'))
    );
    this.ecs.addComponent<AnimatedTexture>(entity, new AnimatedTexture(0));
    this.ecs.addComponent<Name>(entity, new Name('Water'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Water>(entity, new Water());
    const vertex = MeshManager.addMesh(model.vertices, model.indices);
    console.log(vertex);
  }

  loop() {
    //FPS
    //console.log(Math.floor(performance.now() / 1000));
    if (this.play) {
      this.gameMode();
    } else {
      this.input();
      this.update();
      //this.updateMesh();
    }
    this.draw();
    this.gameId = requestAnimationFrame(() => this.loop());
  }

  input() {
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
  }

  //Not here! All gl should be done in renderer!
  // updateMesh() {
  //   const gl = Renderer.getGL;
  //   for (const entity of this.ecs.getEntities()) {
  //     const mesh = this.ecs.getComponent<Mesh>(entity, 'Mesh');
  //     if (mesh) {
  //       gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  //       gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices);
  //     }
  //   }
  // }

  update() {
    if (this.mouse.dragging) {
      this.mouse.dir = this.mouseHandler.calculateRayCast();
      this.brushSystem.update(
        this.meshbrush,
        this.ecs,
        this.mouse,
        this.editorCamera
      );
    }
    if (this.mouse.clicked) {
      console.log(TextureManager.getTextures());
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
    //this.updateMesh(); //Add to some system in future
    this.animationSystem.update(this.ecs);
    this.controllerSystem.update(this.ecs);
    // this.movementSystem.update(this.ecs);
  }

  togglePlay() {
    this.play = !this.play;
  }
}
