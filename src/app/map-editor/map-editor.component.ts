import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { Surface } from 'src/components/surface';
import { BlendMode, Material as RenderMaterial } from 'src/renderer/material';
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
import { MouseHandler } from 'src/core/mouse-handler';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Light } from 'src/components/light';
import { Renderer } from 'src/renderer/renderer';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { Keyboard } from 'src/core/keyboard';
import { BufferLayout } from 'src/renderer/buffer';
import { ShaderDataType, ShaderType } from 'src/renderer/shader-data-type';
import { Grass } from 'src/components/grass';
import { CommandManager } from 'src/resource-manager/command-manager';
import { BatchRenderable } from 'src/components/batch-renderable';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SceneManager } from 'src/scene/scene-manager';
import { HttpClient } from '@angular/common/http';
import { BrushImage } from 'src/components/brush-image';
import { BrushImageComponent } from '../brush-image/brush-image.component';
import {
  BoxShape,
  ParticleEmitter,
  PointShape,
  RingShape,
  SpawnShape,
  SubEmitterMode,
} from 'src/particles/particle-emitter';
import { ParticleEmitterSystem } from 'src/systems/particle-emitter-system';
import { Animation } from 'src/components/animation';
import { AnimationPlayer, Keyframe, Track } from 'src/core/animation-player';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnd,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AnimationPlayerSystem } from 'src/systems/animation-player-system';
import { AnimationPlayerManager } from 'src/resource-manager/animation-player-manager';
import { TrailRenderer } from 'src/components/trail-renderer';
import { TrailRendererSystem } from 'src/systems/trail-renderer-system';
import { Tree } from 'src/components/tree';
import { GradientCreatorComponent } from '../gradient-creator/gradient-creator.component';
import { AssetManager } from 'src/resource-manager/asset-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { Flower } from 'src/components/flower';
import { MeshRenderer } from 'src/components/mesh-renderer';
import { Target, Texture } from 'src/renderer/texture';
import { MaterialManager } from 'src/resource-manager/material-manager';
import { EditorMoveSystem } from 'src/systems/editor-move-system';
import { Pivot } from 'src/components/pivot';
import { ApiService } from '../api.service';
import { ArrayManager } from 'src/resource-manager/array-manager';

type IsSelected = {
  select: boolean;
  element: number;
};

enum Mode {
  Edit = 0,
  Game = 1,
  Object = 2,
  Pivot = 3,
}

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
  isUp: boolean;
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

export enum TerrainBrushes {
  Height,
  Splat,
  Grass,
  Tree,
  Erosion,
  Flower,
  Flattening,
}

export type Asset = {
  name: string;
  src: string;
};

export type Brush = {
  radius: number;
  strength: number;
  color: Colors;
  alpha: number;
  image: HTMLImageElement;
  type: TerrainBrushes;
  entity: Entity;
  negative: boolean;
  fallOff: number;
  imageName: string;
  textureSlot: number;
};

export enum Models {
  Quad = 'Quad',
  Sphere = 'Sphere',
  Lightning = 'Lightning',
  RingMesh = 'Ring Mesh',
  Spiral = 'Spiral',
  Cone = 'Cone',
  Cylinder = 'Cylinder',
}

export enum Colors {
  Red = 'Red',
  Green = 'Green',
  Blue = 'Blue',
  Alpha = 'Alpha',
}

export const ModelLabels: Record<Models, string> = {
  [Models.Quad]: 'Quad',
  [Models.Sphere]: 'Sphere',
  [Models.Lightning]: 'Lightning',
  [Models.RingMesh]: 'Ring Mesh',
  [Models.Spiral]: 'Spiral',
  [Models.Cone]: 'Cone',
  [Models.Cylinder]: 'Cylinder',
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
    MatToolbarModule,
    BrushImageComponent,
    CdkDrag,
    MatCheckboxModule,
    GradientCreatorComponent,
    CdkDropList,
  ],
  templateUrl: './map-editor.component.html',
  styleUrl: './map-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapEditorComponent implements AfterViewInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  http = inject(HttpClient);
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
  animationSystem: AnimationSystem = new AnimationSystem();
  particleEmitterSystem: ParticleEmitterSystem = new ParticleEmitterSystem();
  trailSystem: TrailRendererSystem = new TrailRendererSystem();
  pivotSystem: EditorMoveSystem = new EditorMoveSystem();

  sceneObjects: Map<Name, Entity[]> = new Map<Name, Entity[]>();
  transform: Transform3D = new Transform3D(0, 0, 0);
  componentsList: ECSComponent[] = new Array();
  editorCamera: PerspectiveCamera;
  mode: Mode = 0;
  animationPlayer: AnimationPlayer;
  animationPlayerSystem: AnimationPlayerSystem = new AnimationPlayerSystem();
  position = { x: 0, y: 0 };

  spawnShapes: Set<SpawnShape>;

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
    isUp: true,
    scrollDeltaY: 0,
    lastScrollDeltaY: 0,
  };

  gameId: number = 0;

  play: boolean = false;

  meshbrush: Brush = {
    radius: 5,
    strength: 1,
    image: new Image(),
    type: TerrainBrushes.Tree,
    color: Colors.Red,
    alpha: 1,
    entity: -1,
    negative: false,
    fallOff: 0,
    imageName: '',
    textureSlot: 0,
  };

  brushImages: HTMLImageElement[] = new Array();

  models = Object.values(Models);
  blendModes = Object.values(BlendMode);
  modes = Object.values(SubEmitterMode);
  colors = Object.values(Colors);

  constructor(private cdr: ChangeDetectorRef) {
    //this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.editorCamera = new PerspectiveCamera(1920, 1080);
    this.ecs = new Ecs();
    this.animationPlayer = new AnimationPlayer('Init');
    AnimationPlayerManager.animationPlayers.set('Init', this.animationPlayer);
    this.spawnShapes = new Set<SpawnShape>([
      new PointShape(),
      new RingShape(),
      new BoxShape(),
    ]);
  }

  ngOnDestroy(): void {
    ShaderManager.restore();
    cancelAnimationFrame(this.gameId);
    // WebGL cleanup
    if (Renderer.getGL) {
      const ext = Renderer.getGL.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }

    // Ta bort canvas från DOM helt
    this.canvas.remove();
  }

  get name() {
    const name = this.ecs.getComponent<Name>(this.meshbrush.entity, 'Name');
    if (name) return name.value;
    return 'randomName';
  }

  get animation() {
    const animation = this.ecs.getComponent<Animation>(
      this.meshbrush.entity,
      'Animation',
    );
    if (animation) return animation;
    return null;
  }

  get particleEmitter() {
    const emitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (emitter) return emitter;
    return null;
  }

  get emitters() {
    const emitters: ParticleEmitter[] = new Array();
    for (const entity of this.ecs.getEntities()) {
      const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
        entity,
        'ParticleEmitter',
      );
      if (!particleEmitter) continue;
      emitters.push(particleEmitter);
    }
    return emitters;
  }

  get shaders() {
    return ShaderManager.getShaderNames();
  }

  get meshes() {
    return MeshManager.getMeshNames();
  }

  get translateX() {
    return this.transform.position[0];
  }

  get translateY() {
    return this.transform.position[1];
  }

  get translateZ() {
    return this.transform.position[2];
  }

  set translateX(value: number) {
    this.transform.position[0] = value;
  }

  set translateY(value: number) {
    this.transform.position[1] = value;
  }

  set translateZ(value: number) {
    this.transform.position[2] = value;
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

  get ring() {
    const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (particleEmitter.shape instanceof RingShape) {
      return particleEmitter.shape as RingShape;
    }
    return null;
  }

  get point() {
    const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (particleEmitter.shape instanceof PointShape) {
      return particleEmitter.shape as PointShape;
    }
    return null;
  }

  get box() {
    const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (particleEmitter.shape instanceof BoxShape) {
      return particleEmitter.shape as BoxShape;
    }
    return null;
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

  get surface(): Surface | null {
    const surface = this.ecs.getComponent<Surface>(
      this.meshbrush.entity,
      'Surface',
    );
    if (surface) return surface;
    return null;
  }

  get mesh(): Mesh | null {
    const mesh = this.ecs.getComponent<Mesh>(this.meshbrush.entity, 'Mesh');
    if (mesh) return mesh;
    return null;
  }

  get grass(): Grass | null {
    const grass = this.ecs.getComponent<Grass>(this.meshbrush.entity, 'Grass');
    if (grass) return grass;
    return null;
  }

  get tree(): Tree | null {
    const tree = this.ecs.getComponent<Tree>(this.meshbrush.entity, 'Tree');
    if (tree) return tree;
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

  get assets() {
    return AssetManager.getAssets();
  }

  get asset() {
    return AssetManager.getAssets().values();
  }

  get getEditMode(): Mode {
    return Mode.Edit;
  }

  get getPivotMode(): Mode {
    return Mode.Pivot;
  }

  get getGameMode(): Mode {
    return Mode.Game;
  }
  get getObjectMode(): Mode {
    return Mode.Object;
  }

  get particleTexture(): Texture[] {
    const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (!particleEmitter) return [];
    const textures: Texture[] = Array();
    const material = MaterialManager.get(particleEmitter.materialId);
    if (!material) return [];
    for (const textureid of material.textures) {
      const texture = TextureManager.getTexture(textureid);
      textures.push(texture);
    }
    console.log(textures);
    return textures;
  }

  get meshRenderer() {
    const meshRenderer = this.ecs.getComponent<MeshRenderer>(
      this.meshbrush.entity,
      'MeshRenderer',
    );
    if (!meshRenderer) return null;
    return meshRenderer;
  }

  setBrushTextureSlot(image: string) {
    this.meshbrush.imageName = image;
  }

  async ngAfterViewInit() {
    //Must do this first! INIT canvas! after viewinit
    this.canvas = this.canvasRef.nativeElement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.mouseHandler = new MouseHandler(this.canvas);
    Renderer.create(this.canvas, this.editorCamera);
    await Loader.loadAllBones();
    await ResourceManager.loadAllAnimations();
    await this.loadAllShaders();
    await this.loadAllbrushes();
    //IS notr doing antyhting feyat
    await this.loadAllTextures();

    // console.log(AssetManager.getTexture())

    this.bones = Loader.getBones('skeleton');
    this.renderSystem = new RenderSystem();

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
    await ShaderManager.load('fire', 'fire_vertex.txt', 'fire_fragment.txt');
    await ShaderManager.load('heal', 'heal_vertex.txt', 'heal_fragment.txt');
    await ShaderManager.load(
      'lightning',
      'lightning_vertex.txt',
      'lightning_fragment.txt',
    );
    await ShaderManager.load(
      'portal',
      'portal_vertex.txt',
      'portal_fragment.txt',
    );
    await ShaderManager.load(
      'tornado',
      'tornado_vertex.txt',
      'tornado_fragment.txt',
    );
    await ShaderManager.load('aura', 'aura_vertex.txt', 'aura_fragment.txt');
    await ShaderManager.load('vfx', 'vfx_vertex.txt', 'vfx_fragment.txt');
    await ShaderManager.load(
      'fire_vfx',
      'fire_vfx_vertex.txt',
      'fire_vfx_fragment.txt',
    );
    await ShaderManager.load('beam', 'beam_vertex.txt', 'beam_fragment.txt');

    await ShaderManager.load('wave', 'wave_vertex.txt', 'wave_fragment.txt');
    await ShaderManager.load('wind', 'wind_vertex.txt', 'wind_fragment.txt');

    await ShaderManager.load('trail', 'trail_vertex.txt', 'trail_fragment.txt');

    await ShaderManager.load('tree', 'tree_vertex.txt', 'tree_fragment.txt');

    await ShaderManager.load(
      'framebuffer',
      'framebuffer_vertex.txt',
      'framebuffer_fragment.txt',
    );
  }

  async loadAllTextures() {}

  changeActiveEntity(entity: Entity) {
    const debug = new BufferLayout();
    debug.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    debug.add(1, ShaderDataType.GetType(ShaderType.Float), 3, false);
    this.ecs.addComponent<Pivot>(entity, new Pivot());
    const model = new Model(debug);
    model.addPivot();
    MeshManager.addMesh(model, 'pivot');
    const transform = this.ecs.getComponent<Transform3D>(entity, 'Transform3D');
    this.meshbrush.entity = entity;
    if (!transform) return;
    this.transform = transform;
    this.getToolbarComponents();
  }

  //Add array for all brushes in textureslot, going to be much more nicer to change brush image in future.
  changeBrushImage(index: number) {
    this.meshbrush.image = this.brushImages[index];
    const brushImage = this.ecs.getComponent<BrushImage>(
      this.meshbrush.entity,
      'BrushImage',
    );
    if (brushImage) {
      brushImage.layer = index;
    }
  }

  changeTool(name: string) {
    const toolMap: Record<string, TerrainBrushes> = {
      grass: TerrainBrushes.Grass,
      tree: TerrainBrushes.Tree,
      height: TerrainBrushes.Height,
      splat: TerrainBrushes.Splat,
      erosion: TerrainBrushes.Erosion,
      flower: TerrainBrushes.Flower,
      flattening: TerrainBrushes.Flattening,
    };

    this.meshbrush.type = toolMap[name];
  }

  addToScene() {
    this.openDialog();
  }

  async loadAllbrushes() {
    const smokeBrushImage = await AssetManager.loadImage(
      'assets/brushes/mountain_brush_002.jpg',
    );

    const starBrushImage = await AssetManager.loadImage(
      'assets/brushes/smoke_brush.jpg',
    );

    const terrainBrushImage = await AssetManager.loadImage(
      'assets/brushes/terrain_brush.jpg',
    );

    const roundBrushImage = await AssetManager.loadImage(
      'assets/brushes/round_brush_001.jpg',
    );

    const mountainBrushImage0 = await AssetManager.loadImage(
      'assets/brushes/mountain_brush.jpg',
    );

    const mountainBrushImage1 = await AssetManager.loadImage(
      'assets/brushes/mountain_brush_001.jpg',
    );

    const textureImage = await AssetManager.loadImage(
      'assets/brushes/texture_brush.jpg',
    );

    const textureArray = await TextureManager.addTextureArray(
      'brushes',
      'u_brushes',
      [
        smokeBrushImage,
        starBrushImage,
        terrainBrushImage,
        roundBrushImage,
        textureImage,
        mountainBrushImage0,
        mountainBrushImage1,
      ],
      false,
    );
    const sten = await AssetManager.loadImage('assets/textures/sten.png');
    const sten1 = await AssetManager.loadImage('assets/textures/stn.png');
    const circle = await AssetManager.loadImage('assets/textures/circle.png');
    const circle2 = await AssetManager.loadImage(
      'assets/textures/circle_02.png',
    );
    const mountaintexture1 = await AssetManager.loadImage(
      'assets/textures/mountain.png',
    );
    const mountaintexture2 = await AssetManager.loadImage(
      'assets/textures/mountain_001.png',
    );
    const mountaintexture3 = await AssetManager.loadImage(
      'assets/textures/mountain_002.png',
    );
    const mountaintexture4 = await AssetManager.loadImage(
      'assets/textures/mountain_003.png',
    );
    const texture1 = await AssetManager.loadImage('assets/textures/grass.jpg');
    const texture2 = await AssetManager.loadImage(
      'assets/textures/mountain.jpg',
    );
    const perlin = await AssetManager.loadImage('assets/textures/perlin.png');
    const texture3 = await AssetManager.loadImage('assets/textures/snow.jpg');
    const texture4 = await AssetManager.loadImage('assets/textures/sand.jpg');
    const texture5 = await AssetManager.loadImage(
      'assets/textures/sand_01.jpg',
    );
    const texture6 = await AssetManager.loadImage(
      'assets/textures/sand_02.jpg',
    );

    const texture7 = await AssetManager.loadImage(
      'assets/textures/ground_01.jpg',
    );

    const texture8 = await AssetManager.loadImage('assets/textures/stone.jpg');

    const texture9 = await AssetManager.loadImage(
      'assets/textures/T_Noise_HU85k.png',
    );

    const texture10 = await AssetManager.loadImage(
      'assets/textures/stonefloor.png',
    );

    const texture11 = await AssetManager.loadImage(
      'assets/textures/fire-noise-add.jpg',
    );

    const texture12 = await AssetManager.loadImage(
      'assets/textures/fire-noise-sub.jpg',
    );

    const texture13 = await AssetManager.loadImage(
      'assets/textures/fire-noise.jpg',
    );

    const mountaintexture = await AssetManager.loadImage(
      'assets/textures/marble_rock_01.jpg',
    );

    const mountainNormal = await AssetManager.loadImage(
      'assets/textures/marble_rock_01_normal.jpg',
    );

    const brus = await AssetManager.loadImage('assets/textures/brus.png');

    const ambientOcclusion = await AssetManager.loadImage(
      'assets/textures/marble_rock_01_ao_1k.jpg',
    );

    const pebbles = await AssetManager.loadImage(
      'assets/textures/dry_river_pebbles_diff_1k.jpg',
    );

    const pebblesAO = await AssetManager.loadImage(
      'assets/textures/dry_river_pebbles_ao_1k.jpg',
    );

    const goldMountain = await AssetManager.loadImage(
      'assets/textures/mountains.png',
    );

    const stonebricks = await AssetManager.loadImage(
      'assets/textures/stonebricks.png',
    );

    const sand = await AssetManager.loadImage('assets/textures/sand.jpg');

    const mosaik = await AssetManager.loadImage('assets/textures/mosaik.png');

    const framebuffer = TextureManager.addTexture(
      'framebuffer',
      Renderer.getWidth(),
      Renderer.getHeight(),
      'u_frameBuffer',
      null,
      false,
    );
    framebuffer.createFramebuffer();

    const terrainTexture = TextureManager.addTextureArray(
      'terrain',
      'u_textures',
      [
        mosaik,
        texture1,
        mountaintexture4,
        mountaintexture1,
        mountaintexture2,
        mountaintexture3,
        texture2,
        texture3,
        mountaintexture,
        mountainNormal,
        brus,
        ambientOcclusion,
        pebbles,
        pebblesAO,
        sand,
        goldMountain,
        stonebricks,
      ],
      true,
    );

    this.brushImages.push(
      ...[
        smokeBrushImage,
        starBrushImage,
        terrainBrushImage,
        roundBrushImage,
        textureImage,
        mountainBrushImage0,
        mountainBrushImage1,
      ],
    );

    //Init brushimage to brush
    this.meshbrush.image = smokeBrushImage;

    const waterTexture = await AssetManager.loadImage(
      'assets/textures/water_normal_01.jpg',
    );

    const waterTextureArray = TextureManager.addTextureArray(
      'water',
      'u_textures',
      [waterTexture],
      true,
    );

    const tree1 = await AssetManager.loadImage('/assets/trees/tree_004.png');
    const tree6 = await AssetManager.loadImage('/assets/trees/tree_006.png');
    const tree8 = await AssetManager.loadImage('/assets/trees/tree_008.png');

    const flower1 = await AssetManager.loadImage(
      '/assets/textures/flowers_001.png',
    );

    const bush1 = await AssetManager.loadImage('/assets/bushes/bushes2.png');
    const bush2 = await AssetManager.loadImage('/assets/bushes/bushes3.png');

    const treeTextureArray = TextureManager.addTextureArray(
      'trees',
      'u_textures',
      [flower1],
      false,
    );

    const flowerTextureArray = TextureManager.addTextureArray(
      'flowers',
      'u_textures',
      [flower1],
      false,
    );

    const lightning = await AssetManager.loadImage(
      '/assets/textures/lightning.jpg',
    );

    const healing = await AssetManager.loadImage(
      '/assets/textures/healing.jpg',
    );
    const healing1 = await AssetManager.loadImage(
      '/assets/textures/heal_shade.jpg',
    );

    const healtextures = TextureManager.addTextureArray(
      'heal',
      'u_textures',
      [healing],
      true,
    );

    const healtexture = TextureManager.addTexture(
      'healing1',
      healing1.width,
      healing1.height,
      'u_texture',
      healing1,
      false,
    );

    const eraseCurve = await AssetManager.loadImage(
      '/assets/textures/erase.jpg',
    );

    const fireImage = await AssetManager.loadImage(
      '/assets/textures/fire_vfx.jpg',
    );

    const wave = await AssetManager.loadImage(
      '/assets/textures/expansive_wave.jpg',
    );

    const wind001Image = await AssetManager.loadImage(
      '/assets/textures/wind_001.png',
    );
  }

  async init() {
    //Add all entities with names to the scene list to display them in the scene list
    await this.createTerrain();
    this.createLightSource();
    this.createParticleEmitter();
    for (const entity of this.ecs.getEntities()) {
      const name = this.ecs.getComponent<Name>(entity, 'Name');
      if (!name) continue;
      if (this.sceneObjects.has(name)) {
        this.sceneObjects.get(name)!.push(entity); // lägg till i listan
      } else {
        this.sceneObjects.set(name, [entity]); // skapa ny lista
      }
    }
    this.cdr.detectChanges();
    this.loop();
  }

  protected createCharacter() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));

    const playerSkeleton = new Skeleton(
      '/assets/textures/frogman.png',
      'frogAnimations',
    );
    playerSkeleton.bones = Loader.getBones('skeleton');
    this.ecs.addComponent<Skeleton>(entity, playerSkeleton);
    this.ecs.addComponent<Controlable>(entity, new Controlable());
    this.ecs.addComponent<Player>(entity, new Player());
    this.ecs.addComponent<BatchRenderable>(entity, new BatchRenderable(20));
  }

  createFrog() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Frogman'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    const playerSkeleton = new Skeleton(
      '/assets/textures/frog-enemy.png',
      'frogAnimations',
    );
    playerSkeleton.bones = Loader.getBones('frogman');
    const skeleton = this.ecs.addComponent<Skeleton>(entity, playerSkeleton);
    this.ecs.addComponent<BatchRenderable>(entity, new BatchRenderable(10));
  }

  public getSceneObjectName(entity: Entity) {
    const name = this.ecs.getComponent<Name>(entity, 'Name');
    if (!name) return 'No name';
    return this.ecs.getComponent<Name>(entity, 'Name').value;
  }

  protected async createTerrain() {
    const newEntity = this.ecs.createEntity();
    const size = 512;
    const width = 500;
    const depth = 500;
    const height = 500;

    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model(buffer);
    model.addPlane(100, width, depth);
    MeshManager.addMesh(model, 'terrain' + newEntity);

    this.ecs.addComponent<Name>(newEntity, new Name('Terrain ' + newEntity));
    const transform = this.ecs.addComponent<Transform3D>(
      newEntity,
      new Transform3D(0, 0, 0),
    );

    this.ecs.addComponent<Terrain>(
      newEntity,
      new Terrain(width, depth, height, size),
    );
    const splatmap = this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap('splatmap' + newEntity, size, 'splatmap' + newEntity),
    );
    this.ecs.addComponent<BrushImage>(newEntity, new BrushImage());
    this.ecs.addComponent<Grass>(
      newEntity,
      new Grass('grass' + newEntity, 'grass' + newEntity),
    );
    const grassPositions = ArrayManager.createPositions(
      'grass' + newEntity,
      1000000,
    );
    this.ecs.addComponent<Tree>(newEntity, new Tree('tree' + newEntity));
    this.ecs.addComponent<Flower>(newEntity, new Flower(100));
    this.ecs.addComponent<Surface>(newEntity, new Surface());
    const mesh = MeshManager.addMesh(model, 'terrain' + newEntity);
    const shader = ShaderManager.getShader('splatmap');
    const material = new RenderMaterial('terrain' + newEntity);
    if (!splatmap) throw new Error('Could not get splatmap');
    const coords = ArrayManager.createCoords(
      splatmap.splatmapId,
      splatmap.size,
    );
    TextureManager.addTexture(
      'splatmap' + newEntity,
      size,
      size,
      'u_splatmap',
      coords,
      false,
    );

    material.blendMode = BlendMode.Opaque;
    material.depthWrite = true;
    this.ecs.addComponent<MeshRenderer>(
      newEntity,
      new MeshRenderer('terrain' + newEntity, material, shader),
    );

    material.textures.add('splatmap' + newEntity);
    material.textures.add('brushes');
    material.textures.add('terrain');

    const grassBuffer = new BufferLayout();
    grassBuffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    grassBuffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    grassBuffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const grassShader = await ShaderManager.load(
      'grass',
      'grass_vertex.txt',
      'grass_fragment.txt',
    );
    const grassModel = new Model(grassBuffer);
    grassModel.addGrass();
    MeshManager.addMesh(grassModel, 'grass' + newEntity);
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    MeshManager.addInstanceMesh('grass' + newEntity, instanceBuffer, 1000000);

    const treeBuffer = new BufferLayout();
    treeBuffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    treeBuffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    treeBuffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);

    const treeModel = new Model(treeBuffer);
    treeModel.addQuad(10, 10);
    MeshManager.addMesh(treeModel, 'tree' + newEntity);
    const instanceTreeBuffer = new BufferLayout();
    instanceTreeBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    instanceTreeBuffer.add(
      4,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceTreeBuffer.add(
      5,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    MeshManager.addInstanceMesh('tree' + newEntity, instanceTreeBuffer, 100000);

    //Flower bufferlayout
    const flowerBuffer = new BufferLayout();
    flowerBuffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    flowerBuffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    flowerBuffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const flowerModel = new Model(flowerBuffer);
    treeModel.addQuad(10, 10);
    MeshManager.addMesh(flowerModel, 'flowers');
    const flowerInstanceBuffer = new BufferLayout();
    flowerInstanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    flowerInstanceBuffer.add(
      4,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    flowerInstanceBuffer.add(
      5,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    MeshManager.addInstanceMesh('flowers', flowerInstanceBuffer, 10000);
    TextureManager.dirty = true;
  }

  // private makeTerrainSeamless(mesh: Mesh) {
  //   let newValue: number[] = [];
  //   for (let i = 0; i < mesh.verties.length; i += 8 * 101) {
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

  createLightSource() {
    const layout = new BufferLayout();
    layout.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model(layout);
    model.addCube();
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Light'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Light>(entity, new Light());
    const mesh = MeshManager.addMesh(model, 'light');
    const shader = ShaderManager.getShader('basic');
    const material = new RenderMaterial('light' + entity);
    this.ecs.addComponent<MeshRenderer>(
      entity,
      new MeshRenderer('light', material, shader),
    );
  }

  protected async createWater() {
    const width = 500;
    const height = 500;
    const entity = this.ecs.createEntity();
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model(buffer);
    //Change later in runtime with some parameters in UI
    model.addPlane(1, width, height);
    const mesh = MeshManager.addMesh(model, 'water');
    //Add all components
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Name>(entity, new Name('Water'));
    this.ecs.addComponent<AnimatedTexture>(entity, new AnimatedTexture());
    this.ecs.addComponent<Water>(entity, new Water());
    this.ecs.addComponent<Surface>(entity, new Surface());
    const material = new RenderMaterial('water' + entity);
    const shader = ShaderManager.getShader('water');
    this.ecs.addComponent<MeshRenderer>(
      entity,
      new MeshRenderer('water', material, shader),
    );
    material.textures.add('water');
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
      console.log('Is down');
      CommandManager.beginBatch();
      this.mouse.clicked = true;
      this.mouse.isDown = true;
    } else {
      this.mouse.clicked = false;
    }

    if (this.mouse.released && this.mouse.isDown) {
      console.log('Released');
      this.mouse.isDown = false;
      CommandManager.endBatch();
    }

    if (
      this.keyboard.isKeyPressed('Control') &&
      this.keyboard.isKeyPressed('z')
    ) {
      console.log('Undo');
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
    if (this.mouse.dragging || this.mouse.clicked) {
      this.brushSystem.update(this.meshbrush, this.ecs, this.mouse);
      this.pivotSystem.update(this.ecs, this.mouse);
    }
    this.animationPlayerSystem.update(this.ecs);
    this.particleEmitterSystem.update(this.ecs);
    this.trailSystem.update(this.ecs);
    if (this.animationPlayer.playing) {
      this.updateAnimationPlayer();
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

  pivotMode() {}

  gameMode() {
    this.controllerSystem.update(this.ecs);
    // this.movementSystem.update(this.ecs);
  }

  togglePlay() {
    this.play = !this.play;
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
    if (this.keyboard.isKeyPressed(' ')) moveY += speed / 2;
    if (this.keyboard.isKeyPressed('Shift')) moveY -= speed / 2;

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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async () => {
      const json = reader.result as string;
      const scene = JSON.parse(json);

      console.log('Loaded scene:', scene);
    };
    reader.readAsText(file);
  }

  async saveScene() {}

  async loadScene($event: Event) {
    const scene = SceneManager.loadScene($event);
    console.log(scene);
  }

  async loadMesh(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    const [vertices, indices] = await SceneManager.loadMesh(file);
    const meshRenderer = this.ecs.getComponent<MeshRenderer>(
      this.meshbrush.entity,
      'MeshRenderer',
    );
    if (!meshRenderer) return;
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);
    mesh.vertexBuffer.vertices = vertices;
    mesh.indexBuffer.indices = indices;
    meshRenderer.dirty = true;
    console.log('Loaded new mesh');
  }

  async loadObj(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    const vertexArray = await SceneManager.loadObj(file);
    const meshRenderer = this.ecs.getComponent<MeshRenderer>(
      this.meshbrush.entity,
      'MeshRenderer',
    );
    if (!meshRenderer) return;
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);
    mesh.vertexBuffer.vertices = new Float32Array(vertexArray.vertices);
    mesh.indexBuffer.indices = new Uint16Array(vertexArray.indices);
    MeshManager.updateMesh(mesh);
    console.log('Loaded new mesh');
  }

  async loadParticleMesh(event: Event, particleEmitter: ParticleEmitter) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    const vertexArray = await SceneManager.loadObj(file);
    const mesh = MeshManager.getMesh(particleEmitter.meshId);
    if (!mesh) return;
    mesh.vertexBuffer.vertices = new Float32Array(vertexArray.vertices);
    mesh.indexBuffer.indices = new Uint16Array(vertexArray.indices);
    MeshManager.updateMesh(mesh);
  }

  changeMode(mode: Mode) {
    this.mode = mode;
  }

  openFolder() {
    throw new Error('Method not implemented.');
  }

  async createParticleEmitter() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Particle System ' + entity));
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model(buffer);
    //Change later in runtime with some parameters in UI
    model.addQuad(1, 1);
    const mesh = MeshManager.addMesh(model, 'particleEmitter' + entity);
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    instanceBuffer.add(
      4,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      5,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );

    MeshManager.addInstanceMesh(
      'particleEmitter' + entity,
      instanceBuffer,
      10000,
    );
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    //Renderer stuff not ECS. ParticleEmitter just holds strings.
    const particleEmitter = this.ecs.addComponent<ParticleEmitter>(
      entity,
      new ParticleEmitter(
        'wave',
        'particleEmitter' + entity,
        'material' + entity,
        instanceBuffer.amount,
      ),
    );
    if (!particleEmitter) throw Error('Could not create particle emitter!');
    const scaleX = particleEmitter.particleProp.scaleCurveX;
    const scaleY = particleEmitter.particleProp.scaleCurveY;
    const scaleZ = particleEmitter.particleProp.scaleCurveZ;
    const opacity = particleEmitter.particleProp.opacityCurve;
    const color = particleEmitter.particleProp.colorCurve;
    const displacement = particleEmitter.particleProp.displacement;
    //Bind all textures of particle Emitter
    scaleX.bindTexture();
    scaleY.bindTexture();
    scaleZ.bindTexture();
    opacity.bindTexture();
    color.bindTexture();
    displacement.bindTexture();
    //Add new render material per particle emitter
    const renderMaterial = new RenderMaterial('material' + entity);
    const image = AssetManager.getAsset('circle.png');
    if (!image) throw new Error('Could not get Asset');
    TextureManager.addTextureArray(
      'particleTextures' + entity,
      'u_textures',
      [image],
      true,
    );
    const imageData = new Uint8ClampedArray(128 * 4);
    TextureManager.addTexture(
      'particleTexture' + entity,
      128,
      128,
      'u_texture',
      imageData,
      false,
    );
    renderMaterial.textures.add('particleTextures' + entity);
    renderMaterial.textures.add('particleTexture' + entity);
    MaterialManager.add('material' + entity, renderMaterial);
  }

  changeParticleShader(shaderId: string) {
    const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    const meshRenderer = this.ecs.getComponent<MeshRenderer>(
      this.meshbrush.entity,
      'MeshRenderer',
    );
    if (!meshRenderer || !particleEmitter) return;
    particleEmitter.shaderId = shaderId;
  }

  changeParticleMesh() {
    const emitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (!emitter) return;
    const mesh = MeshManager.getMesh(emitter.meshId);
    if (!mesh) return;
    const model = new Model(mesh.bufferLayout);
    switch (emitter.models) {
      case Models.Quad:
        model.addQuad(1, 1);
        break;
      case Models.Sphere:
        model.addSphere(10, 10, 1);
        break;
      case Models.Lightning:
        model.addLightning(10, 10, 20);
        break;
      case Models.RingMesh:
        model.addRingMesh(1, 10, 10);
        break;
      case Models.Spiral:
        model.addSpiral(50, 5, 1, 5);
        break;
      case Models.Cone:
        model.addCone();
        break;
      case Models.Cylinder:
        model.addCylinder();
        break;
    }
    mesh.vertexBuffer.vertices = new Float32Array(model.vertices);
    mesh.indexBuffer.indices = new Uint16Array(model.indices);
    MeshManager.updateMesh(mesh);
  }

  addAnimationToComponent() {
    this.ecs.addComponent<Animation>(
      this.meshbrush.entity,
      new Animation('Init'),
    );
  }

  addTrack(componentID: string, property: string, item: any) {
    const track = this.animationPlayer.tracks.find(
      (e) =>
        e.componentID === componentID &&
        e.entity === this.meshbrush.entity &&
        e.property === property,
    );
    if (track) {
      console.log(item);
      if (
        property === 'position' ||
        property === 'rotation' ||
        property === 'scale'
      ) {
        track.keyframes.push({ value: { ...item[property] }, time: 0 });
      } else {
        track.keyframes.push({ value: item[property], time: 0 });
      }
    } else {
      const component = this.ecs.getComponent(
        this.meshbrush.entity,
        componentID,
      );
      this.animationPlayer.tracks.push(
        new Track(componentID, property, this.meshbrush.entity, component),
      );
      console.log('Added track ');
      console.log(this.animationPlayer.tracks);
    }
  }

  togglePlayAnimation() {
    this.animationPlayer.playing = !this.animationPlayer.playing;
  }

  onDropped(
    event: CdkDragEnd,
    keyframe: Keyframe<vec3 | boolean | number>,
    index: number,
  ) {
    const x = event.source.getFreeDragPosition().x;
    const width = this.timeline.nativeElement.clientWidth;
    const zoom = this.animationPlayer.zoom;
    const amount = zoom / 10;
    const position = (x * amount) / width;
    keyframe.time = position;
    console.log(keyframe);
  }

  setLoopedTime(event: CdkDragEnd) {
    const x = event.source.getFreeDragPosition().x;
    const width = this.timeline.nativeElement.clientWidth;
    const zoom = this.animationPlayer.zoom;
    const amount = zoom / 10;
    const position = (x * amount) / width;
    this.animationPlayer.loopedTime = position;
  }

  @ViewChild('cursor')
  cursor!: ElementRef<HTMLDivElement>;
  @ViewChild('timeline')
  timeline!: ElementRef<HTMLDivElement>;
  updateAnimationPlayer() {
    const currentTime = this.animationPlayer.loopedTime;
    const width = this.timeline.nativeElement.clientWidth;
    const zoom = this.animationPlayer.zoom;
    const amount = zoom / 10;
    const position = (width / amount) * currentTime;

    this.position = { x: position, y: 0 };
    this.cdr.detectChanges();
  }

  subEmitter(subEmitter: ParticleEmitter) {
    const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (!particleEmitter) return;
    particleEmitter.subEmitter = subEmitter;
  }

  addTrailRendererComponent() {
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model(buffer);
    model.vertices = new Array(30000);
    MeshManager.addMesh(model, 'trail');
    this.ecs.addComponent<TrailRenderer>(
      this.meshbrush.entity,
      new TrailRenderer('trail'),
    );
  }

  @ViewChild('colorBox')
  colorBox!: ElementRef<HTMLDivElement>;
  animationPlayerZoom() {
    const width = this.timeline.nativeElement.clientWidth;
    const zoom = this.animationPlayer.zoom;
    const time = this.animationPlayer.lifetime;
    const amount = zoom / 10;
    const colorWidth = (width / amount) * time;
    this.colorBox.nativeElement.style.width = colorWidth + 'px';
    this.animationPlayer.timelines = [];
    for (let i = 0; i < amount; i++) {
      const boxWidth = width / amount;
      this.animationPlayer.timelines.push({
        width: boxWidth,
        value: i,
        position: boxWidth * i,
      });
    }
  }

  onRemove(track: Track<any>, $index: number) {
    track.keyframes.splice($index, 1);
  }

  resetAllParticles() {
    for (const entity of this.ecs.getEntities()) {
      const particleEmitter = this.ecs.getComponent<ParticleEmitter>(
        entity,
        'ParticleEmitter',
      );
      if (!particleEmitter) continue;
      particleEmitter.active.fill(0);
      particleEmitter.spawnAccumulator = 0;
    }
  }

  async drop(
    event: CdkDragDrop<string[], any, HTMLImageElement>,
    texture: Texture,
  ) {
    if (event.previousContainer === event.container) {
      await this.reorderTexture(event, texture);
    } else {
      await this.addTexture(event, texture);
    }
  }

  sortEntity(event: CdkDragDrop<string[]>) {
    const entities = Array.from(this.ecs.getEntities());
    moveItemInArray(entities, event.previousIndex, event.currentIndex);
    this.ecs.Entities = new Set(entities);
  }

  removeEntity(enity: Entity) {
    this.ecs.removeEntity(enity);
  }

  private async reorderTexture(event: CdkDragDrop<string[]>, texture: Texture) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    if (texture.UniformName === 'u_texture') {
      const image = await TextureManager.loadImage(event.container.data[0]);
      texture.ImageData = image;
      texture.bindTexture();
    } else if (texture.UniformName === 'u_textures') {
      const images = await TextureManager.loadImages(event.container.data);
      texture.bind2DArrayTexture(images);
    }
  }

  private async addTexture(event: CdkDragDrop<string[]>, texture: Texture) {
    const path = event.item.data[1].src as string;
    texture.Paths.push(path);
    if (texture.UniformName === 'u_texture') {
      const image = await TextureManager.loadImage(path);
      texture.ImageData = image;
      texture.bindTexture();
    } else if (texture.UniformName === 'u_textures') {
      const images = await TextureManager.loadImages(texture.Paths);
      texture.bind2DArrayTexture(images);
    }
  }

  public async removeTexture(texture: Texture, path: string) {
    const paths = texture.Paths.filter((e) => e !== path);
    texture.Paths = paths;
    if (texture.UniformName === 'u_textures') {
      const images = await TextureManager.loadImages(paths);
      texture.bind2DArrayTexture(images);
    }
  }
}
