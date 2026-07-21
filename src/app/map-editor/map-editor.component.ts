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
import { CommandManager } from 'src/resource-manager/command-manager';
import { BatchRenderable } from 'src/components/batch-renderable';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SceneManager } from 'src/scene/scene-manager';
import { HttpClient } from '@angular/common/http';
import { BrushImage } from 'src/components/brush-image';
import { BrushImageComponent } from '../brush-image/brush-image.component';
import { Sprite2D } from 'src/components/sprite2D';
import {
  BoxShape,
  ParticleEmitter,
  PointShape,
  RingShape,
  SpawnShape,
} from 'src/particles/particle-emitter';
import { ParticleEmitterSystem } from 'src/systems/particle-emitter-system';
import { Animation } from 'src/components/animation';
import { AnimationPlayer, Keyframe, Track } from 'src/core/animation-player';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { AnimationPlayerSystem } from 'src/systems/animation-player-system';
import { AnimationPlayerManager } from 'src/resource-manager/animation-player-manager';
import { TrailRenderer } from 'src/components/trail-renderer';
import { TrailRendererSystem } from 'src/systems/trail-renderer-system';
import { Tree } from 'src/components/tree';

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
    MatToolbarModule,
    BrushImageComponent,
    CdkDrag,
    MatCheckboxModule,
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
  animationSystem: AnimationSystem = new AnimationSystem();
  particleEmitterSystem: ParticleEmitterSystem = new ParticleEmitterSystem();
  trailSystem: TrailRendererSystem = new TrailRendererSystem();

  sceneObjects: Map<Name, Entity[]> = new Map<Name, Entity[]>();
  transform: Transform3D = new Transform3D(0, 0, 0);
  componentsList: ECSComponent[] = new Array();
  editorCamera: PerspectiveCamera;
  mode: Mode = 0;
  private http = inject(HttpClient);
  animationPlayer: AnimationPlayer;
  animationPlayerSystem: AnimationPlayerSystem = new AnimationPlayerSystem();
  position = { x: 0, y: 0 };

  models: Set<string>;
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
    type: ToolBrush.Grass,
    color: 'red',
    alpha: 1,
    entity: -1,
    negative: false,
    fallOff: 0,
    imageName: '',
    textureSlot: 0,
  };

  brushImages: HTMLImageElement[] = new Array();

  constructor(private cdr: ChangeDetectorRef) {
    //this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.editorCamera = new PerspectiveCamera(1920, 1080);
    this.ecs = new Ecs();
    this.animationPlayer = new AnimationPlayer('Init');
    AnimationPlayerManager.animationPlayers.set('Init', this.animationPlayer);
    this.models = new Set<string>([
      'Quad',
      'Lightning',
      'Cylinder',
      'Sphere',
      'Plane',
      'Tornado',
      'Cone',
      'Ring',
      'Spiral',
    ]);
    this.spawnShapes = new Set<SpawnShape>([
      new PointShape(),
      new RingShape(),
      new BoxShape(),
    ]);
  }

  ngOnDestroy(): void {
    TextureManager.restore();
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
    return null;
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

  get material(): Material | null {
    const material = this.ecs.getComponent<Material>(
      this.meshbrush.entity,
      'Material',
    );
    if (material) return material;
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

  get splatmapImage(): string | null {
    const splatmap = this.splatmap;
    if (!splatmap) return null;
    const image = SceneManager.convertCoordsToImage(
      splatmap.size,
      splatmap.coords,
    );
    return image.src;
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

    // console.log(TextureManager.getTexture())

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

    await ShaderManager.load('trail', 'trail_vertex.txt', 'trail_fragment.txt');
  }

  async loadAllTextures() {}

  changeActiveEntity(newEntity: Entity) {
    const debug = new BufferLayout();
    debug.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    debug.add(1, ShaderDataType.GetType(ShaderType.Float), 3, false);
    this.ecs.addComponent<Pivot>(newEntity, new Pivot());
    const model = new Model(debug);
    model.addPivot();
    MeshManager.addMesh(model, 'pivot');
    const transform = this.ecs.getComponent<Transform3D>(
      newEntity,
      'Transform3D',
    );
    this.meshbrush.entity = newEntity;
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
    const toolMap: Record<string, ToolBrush> = {
      grass: ToolBrush.Grass,
      tree: ToolBrush.Trees,
      height: ToolBrush.Height,
      splat: ToolBrush.Splat,
      pivot: ToolBrush.Pivot,
    };

    this.meshbrush.type = toolMap[name];
  }

  addToScene() {
    this.openDialog();
  }

  async loadAllbrushes() {
    const smokeBrushImage = await TextureManager.loadImage(
      'assets/brushes/mountain_brush_002.jpg',
    );

    const starBrushImage = await TextureManager.loadImage(
      'assets/brushes/star_brush.jpg',
    );

    const terrainBrushImage = await TextureManager.loadImage(
      'assets/brushes/terrain_brush.jpg',
    );

    const roundBrushImage = await TextureManager.loadImage(
      'assets/brushes/round_brush_001.jpg',
    );

    const squareBrushImage = await TextureManager.loadImage(
      'assets/brushes/square_brush.jpg',
    );

    const mountainBrushImage0 = await TextureManager.loadImage(
      'assets/brushes/mountain_brush.jpg',
    );

    const mountainBrushImage1 = await TextureManager.loadImage(
      'assets/brushes/mountain_brush_001.jpg',
    );

    const textureImage = await TextureManager.loadImage(
      'assets/brushes/texture_brush.jpg',
    );

    const texture1 = await TextureManager.loadImage(
      'assets/textures/grass.jpg',
    );
    const texture2 = await TextureManager.loadImage(
      'assets/textures/mountain.jpg',
    );
    const texture3 = await TextureManager.loadImage('assets/textures/snow.jpg');
    const texture4 = await TextureManager.loadImage('assets/textures/sand.jpg');
    const texture5 = await TextureManager.loadImage(
      'assets/textures/sand_01.jpg',
    );
    const texture6 = await TextureManager.loadImage(
      'assets/textures/sand_02.jpg',
    );

    const texture7 = await TextureManager.loadImage(
      'assets/textures/ground_01.jpg',
    );

    const texture8 = await TextureManager.loadImage(
      'assets/textures/stone.jpg',
    );

    const textureArray = await TextureManager.addTextureArray(
      'brushes',
      'u_brushes',
      [
        smokeBrushImage,
        starBrushImage,
        terrainBrushImage,
        roundBrushImage,
        squareBrushImage,
        textureImage,
        mountainBrushImage0,
        mountainBrushImage1,
      ],
      'splatmap',
      false,
    );

    const mountaintexture = await TextureManager.loadImage(
      'assets/textures/marble_rock_01.jpg',
    );

    const mountainNormal = await TextureManager.loadImage(
      'assets/textures/marble_rock_01_normal.jpg',
    );

    const textureArray2 = await TextureManager.addTextureArray(
      'splatmap',
      'u_textures',
      [texture1, texture2, texture3, mountaintexture, mountainNormal],
      'splatmap',
      true,
    );

    this.brushImages.push(
      ...[
        smokeBrushImage,
        starBrushImage,
        terrainBrushImage,
        roundBrushImage,
        squareBrushImage,
        textureImage,
        mountainBrushImage0,
        mountainBrushImage1,
      ],
    );

    //Init brushimage to brush
    this.meshbrush.image = smokeBrushImage;

    const waterNormal = await TextureManager.loadImage(
      'assets/textures/water_normal_01.jpg',
    );

    const waterTextureArray = await TextureManager.addTextureArray(
      'noise',
      'u_textures',
      [waterNormal],
      'water',
      true,
    );

    const tree1 = await TextureManager.loadImage('/assets/trees/tree_004.png');
    const tree5 = await TextureManager.loadImage('/assets/trees/tree_005.png');
    const tree6 = await TextureManager.loadImage('/assets/trees/tree_006.png');
    const tree8 = await TextureManager.loadImage('/assets/trees/tree_008.png');

    const treeTextureArray = await TextureManager.addTextureArray(
      'batch',
      'u_textures',
      [tree8],
      'batch',
      false,
    );

    const fireNoise = await TextureManager.loadImage(
      '/assets/textures/fire-noise.jpg',
    );
    const fireNoiseSub = await TextureManager.loadImage(
      '/assets/textures/fire-noise-sub.jpg',
    );
    const fireNoiseColor = await TextureManager.loadImage(
      '/assets/textures/fire-noise-color.png',
    );
    const fireNoiseAdd = await TextureManager.loadImage(
      '/assets/textures/fire-noise-add.jpg',
    );
    const noise = await TextureManager.loadImage(
      '/assets/textures/noise_002.jpg',
    );

    const fireTexture = await TextureManager.addTexture(
      'fire',
      'u_texture',
      fireNoise,
      'fire',
      true,
    );

    const fires = await TextureManager.addTextureArray(
      'fire',
      'u_textures',
      [fireNoiseAdd, fireNoiseSub, fireNoiseColor],
      'fire',
      false,
    );

    const lightning = await TextureManager.loadImage(
      '/assets/textures/lightning.jpg',
    );
    const gradient = await TextureManager.loadImage(
      '/assets/textures/gradient.jpg',
    );
    const alphaCurve = await TextureManager.loadImage(
      '/assets/textures/alpha-curve.jpg',
    );
    const lightningColor = await TextureManager.loadImage(
      '/assets/textures/lightning-color.jpg',
    );
    const lightningTexture = await TextureManager.addTexture(
      'lightning',
      'u_texture',
      lightning,
      'lightning',
      true,
    );

    const lightningTextures = await TextureManager.addTextureArray(
      'lightning',
      'u_textures',
      [gradient, lightningColor],
      'lightning',
      false,
    );

    const noiseTexture = await TextureManager.addTexture(
      'noise',
      'u_heightMap',
      noise,
      'splatmap',
      true,
    );

    const healing = await TextureManager.loadImage(
      '/assets/textures/healing.jpg',
    );
    const healing1 = await TextureManager.loadImage(
      '/assets/textures/heal_shade.jpg',
    );

    const healtextures = await TextureManager.addTextureArray(
      'heal',
      'u_textures',
      [healing],
      'heal',
      true,
    );

    const healtexture = await TextureManager.addTexture(
      'heal',
      'u_texture',
      healing1,
      'heal',
      false,
    );

    const portalTextures = await TextureManager.addTextureArray(
      'portal',
      'u_textures',
      [noise],
      'portal',
      false,
    );

    const colorCurve = await TextureManager.loadImage(
      '/assets/textures/color-curve.jpg',
    );

    const eraseCurve = await TextureManager.loadImage(
      '/assets/textures/erase.jpg',
    );

    const auraTexture = await TextureManager.addTexture(
      'aura',
      'u_texture',
      eraseCurve,
      'aura',
      false,
    );

    const auraTextures = await TextureManager.addTextureArray(
      'aura',
      'u_textures',
      [noise],
      'aura',
      true,
    );

    const fireImage = await TextureManager.loadImage(
      '/assets/textures/fire_vfx.jpg',
    );

    const colorRamp = await TextureManager.loadImage(
      '/assets/textures/color-ramp.jpg',
    );

    const fireTextures = await TextureManager.addTextureArray(
      'fire_vfx',
      'u_textures',
      [fireImage, alphaCurve, colorRamp],
      'fire_vfx',
      false,
    );

    const curve = await TextureManager.loadImage(
      '/assets/textures/size-curve.jpg',
    );

    const beamTexture = await TextureManager.addTexture(
      'beam',
      'u_texture',
      curve,
      'beam',
      false,
    );

    const beamTextures = await TextureManager.addTextureArray(
      'beam',
      'u_textures',
      [noise],
      'beam',
      true,
    );

    const wave = await TextureManager.loadImage(
      '/assets/textures/expansive_wave.jpg',
    );

    const waveTextures = await TextureManager.addTextureArray(
      'wave',
      'u_textures',
      [wave],
      'wave',
      true,
    );

    const waveTexture = await TextureManager.addTexture(
      'wave',
      'u_texture',
      healing1,
      'wave',
      false,
    );

    const windImage = await TextureManager.loadImage(
      '/assets/textures/wind.jpg',
    );
    const wind001Image = await TextureManager.loadImage(
      '/assets/textures/wind_001.png',
    );

    const windTexture = await TextureManager.addTexture(
      'tornado',
      'u_texture',
      wind001Image,
      'tornado',
      true,
    );
    const windTexture2 = await TextureManager.addTexture(
      'tornado',
      'u_texture2',
      healing1,
      'tornado',
      false,
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
    const size = 128;
    const width = 500;
    const depth = 500;
    const height = 500;
    const splatmap = await TextureManager.addNonImage(
      'terrain' + newEntity,
      size,
      size,
      'u_splatmap',
      'splatmap',
      true,
    );

    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const model = new Model(buffer);
    model.addPlane(100, width, depth);
    this.ecs.addComponent<Name>(newEntity, new Name('Terrain ' + newEntity));
    const transform = this.ecs.addComponent<Transform3D>(
      newEntity,
      new Transform3D(0, 0, 0),
    );
    this.ecs.addComponent<Material>(newEntity, new Material('splatmap'));
    this.ecs.addComponent<Mesh>(
      newEntity,
      new Mesh(500, 500, 'splatmap', 'terrain' + newEntity),
    );
    this.ecs.addComponent<Terrain>(
      newEntity,
      new Terrain(width, depth, height, size),
    );
    //Add mesh component to entity VAO splatmap id meshId
    this.ecs.addComponent(
      newEntity,
      new Mesh(width, height, 'terrain' + newEntity, 'terrain' + newEntity),
    );
    this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap(size, 'terrain' + newEntity),
    );
    this.ecs.addComponent<BrushImage>(newEntity, new BrushImage());
    this.ecs.addComponent<Grass>(newEntity, new Grass(128));
    this.ecs.addComponent<Tree>(newEntity, new Tree(size));

    const grassBuffer = new BufferLayout();
    grassBuffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    grassBuffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    grassBuffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
    const shader = await ShaderManager.load(
      'grass',
      'grass_vertex.txt',
      'grass_fragment.txt',
    );
    const grassModel = new Model(grassBuffer);
    grassModel.addGrass();
    MeshManager.addMesh(grassModel, 'grass');
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    MeshManager.addInstanceMesh('grass', instanceBuffer, 1000000);
    MeshManager.addMesh(model, 'terrain' + newEntity);
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

  protected createSphere() {
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    const sphere = new Model(buffer);
    sphere.addTornado();
    const effectEntity = this.ecs.createEntity();
    this.ecs.addComponent<Material>(effectEntity, new Material('fire'));
    this.ecs.addComponent<Transform3D>(
      effectEntity,
      new Transform3D(0, 0, 9000),
    );
    this.ecs.addComponent<Name>(effectEntity, new Name('Sphere'));
    this.ecs.addComponent<Mesh>(
      effectEntity,
      new Mesh(50, 50, 'fire', 'sphere' + effectEntity),
    );
    MeshManager.addMesh(sphere, 'sphere' + effectEntity);
  }

  protected createCylinder() {
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    //Add correct buffer!
    const cylinderModel = new Model(buffer);
    cylinderModel.addCylinder();
    const effectEntity = this.ecs.createEntity();
    this.ecs.addComponent<Transform3D>(
      effectEntity,
      new Transform3D(0, 0, 9000),
    );
    this.ecs.addComponent<Material>(effectEntity, new Material('fire'));
    this.ecs.addComponent<Name>(effectEntity, new Name('Cylinder'));
    this.ecs.addComponent<Mesh>(
      effectEntity,
      new Mesh(50, 50, 'fire', 'cylinder'),
    );
    MeshManager.addMesh(cylinderModel, 'cylinder');
  }

  public createCircle() {
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    //buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, true); I am not there yeti..
    const model = new Model(buffer);
    //Change later in runtime with some parameters in UI
    model.addFlatCircle(10, 10);
    MeshManager.addMesh(model, 'circle');
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      2,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      1,
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
    instanceBuffer.add(
      6,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      7,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    MeshManager.addInstanceMesh('circle', instanceBuffer, 1);
    const effectEntity = this.ecs.createEntity();
    this.ecs.addComponent<Material>(effectEntity, new Material('heal'));
    this.ecs.addComponent<Transform3D>(
      effectEntity,
      new Transform3D(0, 0, 9000),
    );
    this.ecs.addComponent<Name>(effectEntity, new Name('Circle'));
    this.ecs.addComponent<Mesh>(
      effectEntity,
      new Mesh(50, 50, 'heal', 'circle'),
    );
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
    this.ecs.addComponent<Mesh>(entity, new Mesh(10, 10, 'basic', 'light'));
    this.ecs.addComponent<Material>(entity, new Material('basic'));
    MeshManager.addMesh(model, 'light');
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
    MeshManager.addMesh(model, 'water');
    //Add all components
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(width, height, 'water', 'water'),
    );
    this.ecs.addComponent<Name>(entity, new Name('Water'));
    this.ecs.addComponent<Material>(entity, new Material('water'));
    this.ecs.addComponent<AnimatedTexture>(entity, new AnimatedTexture());
    this.ecs.addComponent<Water>(entity, new Water());
  }

  protected async addGrass() {
    const grassComponent = this.ecs.addComponent<Grass>(
      this.meshbrush.entity,
      new Grass(128),
    );
    this.ecs.addComponent<Material>(
      this.meshbrush.entity,
      new Material('grass'),
    );
    if (!grassComponent) return;
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
    this.brushSystem.update(this.meshbrush, this.ecs, this.mouse);
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
    const speed = 5;
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
      rotateY -= speed * 0.1;
      this.mouse.lastScrollDeltaY = this.mouseHandler.scrollY;
      this.mouseHandler.scrollY = 0;
    } else if (this.mouseHandler.scrollY > 0) {
      rotateY += speed * 0.1;
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

      // här kan du kalla SceneLoader.load(scene)
      const ecs = await SceneManager.loadScene(scene);
      this.ecs = ecs;
    };

    reader.readAsText(file);
  }

  async saveScene() {
    const json = SceneManager.saveScene(this.ecs);

    this.http.post('/api/saveMap', { json }).subscribe({
      next: (e) => {
        console.log(e);
      },
      error: (e) => console.error(e),
      complete: () => {
        console.log('Completed save scene!');
      },
    });
  }

  changeMode(mode: Mode) {
    this.mode = mode;
  }

  openFolder() {
    throw new Error('Method not implemented.');
  }

  createFire() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent(entity, new Transform3D(0, 0, 9000));
    this.ecs.addComponent(entity, new Sprite2D('fire', 100, 100));
    this.ecs.addComponent(entity, new Name('Fire'));
  }

  createLightning() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent(entity, new Transform3D(0, 50, 9000));
    const transform = this.ecs.getComponent<Transform3D>(entity, 'Transform3D');
    if (transform) {
      transform.scale[0] = 10;
      transform.scale[1] = 10;
      transform.scale[2] = 10;
    }
    this.ecs.addComponent<Material>(entity, new Material('lightning'));
    this.ecs.addComponent(entity, new Name('Lightning'));
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    const model = new Model(buffer);
    //Change later in runtime with some parameters in UI
    model.addLightning(100, 200, 20);
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      2,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      1,
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
    instanceBuffer.add(
      6,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      7,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    MeshManager.addInstanceMesh('lightning', instanceBuffer, 1);

    MeshManager.addMesh(model, 'lightning');
    //Add all components
    this.ecs.addComponent<Mesh>(
      entity,
      new Mesh(100, 100, 'lightning', 'lightning'),
    );
    this.ecs.addComponent<Material>(entity, new Material('lightning'));
  }

  createParticleEmitter() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Particle System ' + entity));
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    //buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, true); I am not there yeti..
    const model = new Model(buffer);
    //Change later in runtime with some parameters in UI
    model.addCone();
    MeshManager.addMesh(model, 'particleEmitter' + entity);
    const instanceBuffer = new BufferLayout();
    instanceBuffer.add(
      2,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      true,
    );
    instanceBuffer.add(
      3,
      ShaderDataType.GetType(ShaderType.Float),
      1,
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
    instanceBuffer.add(
      6,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      7,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      8,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      9,
      ShaderDataType.GetType(ShaderType.Float),
      1,
      false,
      true,
    );
    instanceBuffer.add(
      10,
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
    this.ecs.addComponent<ParticleEmitter>(
      entity,
      new ParticleEmitter(
        'tornado',
        'particleEmitter' + entity,
        100,
        instanceBuffer.amount,
      ),
    );
  }

  changeParticleMesh(index: number) {
    const emitter = this.ecs.getComponent<ParticleEmitter>(
      this.meshbrush.entity,
      'ParticleEmitter',
    );
    if (!emitter) return;
    const mesh = MeshManager.getMesh(emitter.meshId);
    if (!mesh) return;
    const model = new Model(mesh.bufferLayout);

    switch (index) {
      case 0:
        model.addQuad();
        break;
      case 1:
        model.addLightning(10, 10, 20);
        break;
      case 2:
        model.addFlatCircle(50, 100);
        break;
      case 3:
        model.addCylinder();
        break;
      case 4:
        model.addSphere(10, 10, 10);
        break;
      case 5:
        model.addTornado();
        break;
      case 6:
        model.addCone();
        break;
      case 7:
        model.addRingMesh(5, 10, 50);
        break;
      case 8:
        model.addSpiral(50, 0.5, 10, 1);
        break;
      default:
        model.addQuad();
        break;
    }
    MeshManager.updateMesh(model, emitter.meshId);
  }

  addAnimationToComponent() {
    this.ecs.addComponent<Animation>(
      this.meshbrush.entity,
      new Animation('Init'),
    );
  }

  addKeyframe(type: string) {
    const anim = this.ecs.getComponent<Animation>(
      this.meshbrush.entity,
      'Animation',
    );
    if (!anim) return;
  }

  addTrack(componentID: string, property: string, item: any) {
    const track = this.animationPlayer.tracks.find(
      (e) =>
        e.componentID === componentID &&
        e.entity === this.meshbrush.entity &&
        e.property === property,
    );
    if (track) {
      track.keyframes.push({ value: item[property], time: 0 });
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
}
