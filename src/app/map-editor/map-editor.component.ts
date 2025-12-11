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
import { Shader } from 'src/renderer/shader';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { MeshRenderer } from 'src/renderer/mesh-renderer';
import { FormsModule } from '@angular/forms';
import { Loader } from '../loader';
import { Bone } from 'src/components/bone';
import { Model } from 'src/renderer/model';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
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
import { Batch } from 'src/components/batch';
import { MouseHandler } from 'src/core/mouse-handler';
import { Pivot } from 'src/components/pivot';

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
  canvas!: ElementRef<HTMLCanvasElement>;
  gl!: WebGL2RenderingContext;
  width: number = 0;
  height: number = 0;
  perspectiveCamera: PerspectiveCamera;
  //orthoCamera: OrtographicCamera;
  mouseHandler!: MouseHandler;
  bones: Bone[] = new Array();
  angle = 0;
  splatColor = 'red';
  tool: Tools = 0;

  gameId: number = 0;

  play: boolean = false;

  images: Asset[] = new Array();

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

  constructor(private cdr: ChangeDetectorRef) {
    //this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.perspectiveCamera = new PerspectiveCamera(1920, 1080);
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

  async ngAfterViewInit() {
    this.gl = this.canvas.nativeElement.getContext('webgl2', { depth: true })!;
    if (!this.gl) throw Error('Webgl2 not supported');
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.gl.canvas.width = 1920;
    this.gl.canvas.height = 1080;
    this.addEventListeners();
    this.mouseHandler = new MouseHandler(this.canvas, this.perspectiveCamera);

    ShaderManager.setGl(this.gl);
    TextureManager.setGl(this.gl);
    await Loader.loadAllBones();
    await ResourceManager.loadAllAnimations();
    await this.loadAllShaders();

    const tree = await TextureManager.loadTexture('/assets/sprites/tree.png');
    TextureManager.createAndBindTexture('tree', tree, tree.width, tree.height);
    this.bones = Loader.getBones('skeleton');
    this.renderSystem = new RenderSystem(this.gl);
    await this.init();
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (this.play) return;
      switch (event.code) {
        case 'KeyW':
          this.perspectiveCamera.updatePosition(0, 100, 0);
          break;
        case 'KeyS':
          this.perspectiveCamera.updatePosition(0, -100, 0);
          break;
        case 'KeyA':
          this.perspectiveCamera.updatePosition(-100, 0, 0);
          break;
        case 'KeyD':
          this.perspectiveCamera.updatePosition(100, 0, 0);
          break;
        case 'KeyQ':
          this.perspectiveCamera.updatePosition(0, 0, -100);
          break;
        case 'KeyE':
          this.perspectiveCamera.updatePosition(0, 0, 100);
          break;
        case 'ArrowUp':
          this.perspectiveCamera.updatePosition(0, 0.1, 0);
          break;
        case 'ArrowDown':
          this.perspectiveCamera.updatePosition(0, -0.1, 0);
          break;
        case 'ArrowRight':
          this.perspectiveCamera.updatePosition(0.1, 0, 0);
          break;
        case 'ArrowLeft':
          this.perspectiveCamera.updatePosition(-0.1, 0, 0);
          break;
      }
    });

    this.canvas.nativeElement.addEventListener('wheel', (event) => {
      this.perspectiveCamera.rotateX(event.deltaY / 50);
    });
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
  }

  changeActiveEntity(entity: Entity) {
    this.meshbrush.entity = entity;
    const transform = this.ecs.getComponent<Transform3D>(entity, 'Transform3D');
    if (transform) {
      this.transform = transform;
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
    const gl = this.gl;
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

    for (const textureName of TextureManager.getNames()) {
      const image = TextureManager.getImage(textureName);
      this.images.push({ name: textureName, src: image.src });
    }

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

    const grassMesh = new MeshRenderer(
      gl,
      new Float32Array(grassModel.vertices),
      new Uint16Array(grassModel.indices),
      ShaderManager.getShader('grass')
    );

    const grassEntity = this.ecs.createEntity();
    this.ecs.addComponent<Material>(
      grassEntity,
      new Material(
        ShaderManager.getShader('grass'),
        TextureManager.getTexture('whirlwind'),
        TextureManager.getSlot('whirlwind')
      )
    );
    this.ecs.addComponent<AnimatedTexture>(grassEntity, new AnimatedTexture(0));
    const grass = this.ecs.addComponent<Grass>(grassEntity, new Grass());
    if (grass) {
      const newMesh = this.renderSystem.createBatch(
        gl,
        grassMesh,
        grass.maxGrassBuffer
      );
      this.ecs.addComponent<Mesh>(grassEntity, new Mesh(newMesh.vao));
    }

    this.createTerrainWithSplatmap();

    // this.createWater(waterShader, 4, 0, 0.1);
    // this.createWater(waterShader, 4, 50, 0.1);

    this.setupSkybox(ShaderManager.getShader('skybox'), skyboxTexture!);

    // this.debugMesh = new MeshRenderer(
    //   gl,
    //   new Float32Array([
    //     start[0],
    //     start[1],
    //     start[2],
    //     0,
    //     0,
    //     start[0],
    //     start[1],
    //     start[2],
    //     0,
    //     0,
    //   ]),
    //   new Uint16Array([0, 1, 2]),
    //   TextureManager.getTexture(0),
    //   shader3
    // );

    //Add all entities with names to the scene list to display them in the scene list
    for (const entity of this.ecs.getEntities()) {
      const name = this.ecs.getComponent<Name>(entity, 'Name');
      if (!name) continue;
      this.sceneObjects.add(name);
    }

    // this.createCharacter(characterImage);
    // this.createFrog(frogImage);
    this.createBatch();

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
          material.shader = ShaderManager.getShader('splatmap');
        } else if (event.value === 'shader1') {
          material.shader = ShaderManager.getShader('splatmap');
        }
      }
    }
  }

  setupSkybox(shader: Shader, texture: WebGLTexture) {
    const gl = this.gl;
    //First create model
    const skyboxModel = new Model();
    skyboxModel.addSkybox();
    //Then create mesh
    const skyboxMesh = new MeshRenderer(
      gl,
      new Float32Array(skyboxModel.vertices),
      new Uint16Array(skyboxModel.indices),
      shader
    );
    //Then add to entity!
    const skyboxEntity = this.ecs.createEntity();
    this.ecs.addComponent(skyboxEntity, new Name('Skybox'));
    this.ecs.addComponent(
      skyboxEntity,
      new Skybox(skyboxMesh.vao, shader, texture!)
    );
    shader.use();
    gl.bindVertexArray(skyboxMesh.vao.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxMesh.vao.vertexBuffer.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      skyboxMesh.vao.vertexBuffer.vertices,
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    skyboxMesh.vao.unbind();
  }

  protected createTerrainWithSplatmap() {
    const width = 128;
    const height = 128;
    const model = new Model();
    model.addPlane(50);
    const newEntity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(newEntity, new Name('Terrain ' + newEntity));
    this.ecs.addComponent<Pivot>(newEntity, new Pivot());
    //Add mesh component to entity
    //Check if entity exists as parameter and make a copy of the other terrain

    const backgroundMesh = new MeshRenderer(
      this.gl,
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
      ShaderManager.getShader('splatmap')
    );
    this.ecs.addComponent(newEntity, new Mesh(backgroundMesh.vao));
    const splatmap = TextureManager.createAndBindTexture(
      'splatmap',
      null,
      width,
      height
    );
    //Add splatmap too terrain entity
    this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap(
        width,
        height,
        TextureManager.getTexture('splatmap'),
        splatmap
      )
    );

    //Add material component to entity
    this.ecs.addComponent(
      newEntity,
      new Material(
        ShaderManager.getShader('splatmap'),
        TextureManager.getTexture('textureMap'),
        TextureManager.getSlot('textureMap')
      )
    );
    this.ecs.addComponent<Terrain>(newEntity, new Terrain());
    this.ecs.addComponent<Transform3D>(newEntity, new Transform3D(0, 0, 0));
    this.updateSplatmap();
    this.updateMesh();
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
      for (let i = 0; i < mesh.vertices.length / mesh.id; i += 8) {
        const x = mesh.vertices[i + 0] + 1000 * mesh.id;
        const y = mesh.vertices[i + 1];
        const z = mesh.vertices[i + 2];
        const u = mesh.vertices[i + 3];
        const v = mesh.vertices[i + 4];
        const normal1 = mesh.vertices[i + 6];
        const normal2 = mesh.vertices[i + 7];
        const normal3 = mesh.vertices[i + 8];
        newVertices.push(x, y, z, u, v, normal1, normal2, normal3);
      }

      for (let i = 0; i < mesh.indices.length / mesh.id; i++) {
        newIndices.push(mesh.indices[i] + mesh.vertices.length / 8);
      }
      const meshRenderer = new MeshRenderer(
        this.gl,
        new Float32Array(newVertices),
        new Uint16Array(newIndices),
        ShaderManager.getShader('splatmap')
      );
      const adjacentMesh = new Mesh(meshRenderer.vao);
      this.ecs.removeComponent(this.meshbrush.entity, 'Mesh');
      const newMesh = this.ecs.addComponent<Mesh>(
        this.meshbrush.entity,
        adjacentMesh
      );
      mesh.id++;
      if (newMesh === null) throw new Error('Could not add id to mesh!');
      newMesh.id = mesh.id;
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
    const gl = this.gl;
    const cylinderModel = new Model();
    cylinderModel.addCylinder();
    const effectEntity = this.ecs.createEntity();
    const cylinderMesh = new MeshRenderer(
      gl,
      new Float32Array(cylinderModel.vertices),
      new Uint16Array(cylinderModel.indices),
      ShaderManager.getShader('splatmap')
    );

    this.ecs.addComponent<Material>(
      effectEntity,
      new Material(
        ShaderManager.getShader('splatmap'),
        TextureManager.getTexture('whirlwind')!,
        TextureManager.getSlot('whirlwind')
      )
    );

    this.ecs.addComponent<AnimatedTexture>(
      effectEntity,
      new AnimatedTexture(0)
    );

    this.ecs.addComponent<Transform3D>(effectEntity, new Transform3D(0, 0, 0));

    this.ecs.addComponent<Name>(effectEntity, new Name('Cylinder'));

    this.ecs.addComponent<Mesh>(effectEntity, new Mesh(cylinderMesh.vao));
  }

  protected createBatch() {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(entity, new Name('Batch'));
    this.ecs.addComponent<Batch>(entity, new Batch());
  }

  protected createMesh(shader: Shader, slot: number) {
    const entity = this.ecs.createEntity();
    const model = new Model();
    //Change later in runtime with some parameters in UI
    model.addPlane(10);
    const mesh = new MeshRenderer(
      this.gl,
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
      shader
    );
    this.ecs.addComponent<Mesh>(entity, new Mesh(mesh.vao));
    this.ecs.addComponent<Material>(
      entity,
      new Material(shader, TextureManager.getTexture('textureMap')!, slot)
    );
    console.log('Created Mesh!!!');
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
    const mesh = new MeshRenderer(
      this.gl,
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
      ShaderManager.getShader('water')
    );
    this.ecs.addComponent<Mesh>(entity, new Mesh(mesh.vao));
    this.ecs.addComponent<Material>(
      entity,
      new Material(
        ShaderManager.getShader('water'),
        TextureManager.getTexture('water'),
        TextureManager.getSlot('water')
      )
    );
    this.ecs.addComponent<AnimatedTexture>(entity, new AnimatedTexture(0));
    this.ecs.addComponent<Name>(entity, new Name('Water'));
    this.ecs.addComponent<Transform3D>(entity, new Transform3D(0, 0, 0));
    this.ecs.addComponent<Water>(entity, new Water());
    console.log('Created Water!!!');
  }

  loop() {
    //FPS
    //console.log(Math.floor(performance.now() / 1000));
    if (this.play) {
      this.gameMode();
    } else {
      this.update();
      this.updateMesh();
    }
    this.draw();
    this.gameId = requestAnimationFrame(() => this.loop());
  }

  updateMesh() {
    for (const entity of this.ecs.getEntities()) {
      const mesh = this.ecs.getComponent<Mesh>(entity, 'Mesh');
      if (mesh) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, mesh.vertices);
      }
    }
  }

  update() {
    if (this.mouseHandler.getIsMouseDown) {
      this.mouseHandler.calculateRayCast();
      this.brushSystem.update(
        this.meshbrush,
        this.ecs,
        this.mouseHandler,
        this.perspectiveCamera
      );
      this.updateSplatmap();
    }
  }

  updateSplatmap() {
    const ecs = this.ecs;
    const gl = this.gl;
    for (const entity of ecs.getEntities()) {
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      if (!splatmap) continue;
      gl.activeTexture(gl.TEXTURE0 + splatmap.slot);
      gl.bindTexture(gl.TEXTURE_2D, splatmap.texture);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        splatmap.width,
        splatmap.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        splatmap.coords
      );
    }
  }

  draw() {
    this.renderSystem.update(this.ecs, this.gl, this.perspectiveCamera);
  }

  openDialog() {
    const dialogRef = this.dialog.open(CreateEntityDialogComponent, {
      width: '250px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog reesult ' + result);
    });
  }

  saveEntity() {
    const blob = new Blob(
      [JSON.stringify(this.ecs.getComponents(this.meshbrush.entity))],
      {
        type: 'application/json',
      }
    );
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'world';
    a.click();

    URL.revokeObjectURL(url); // Städa upp
  }

  loadEntity() {}
  editorMode() {}

  gameMode() {
    this.updateMesh(); //Add to some system in future
    this.animationSystem.update(this.ecs);
    this.controllerSystem.update(this.ecs);
    // this.movementSystem.update(this.ecs);
  }

  togglePlay() {
    this.play = !this.play;
  }
}
