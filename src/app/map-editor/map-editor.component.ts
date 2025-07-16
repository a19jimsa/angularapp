import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { Shader } from 'src/renderer/shader';
import { Texture } from 'src/renderer/texture';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { OrtographicCamera } from 'src/renderer/orthographic-camera';
import { MeshRenderer } from 'src/renderer/mesh-renderer';
import { FormControl, FormsModule } from '@angular/forms';
import { Loader } from '../loader';
import { Bone } from 'src/components/bone';
import { MathUtils } from 'src/Utils/MathUtils';
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
import { Tree } from 'src/components/tree';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Entity } from '../entity';
import { Name } from 'src/components/name';
import { Transform3D } from 'src/components/transform3D';

export enum Tools {
  Splatmap,
  Heightmap,
}

export enum ToolBrush {
  Height,
  Grass,
  Trees,
  Splat,
}

export type Brush = {
  radius: number;
  strength: number;
  color: string;
  alpha: number;
  image: HTMLImageElement;
  type: ToolBrush;
  entity: Entity;
  negative: boolean;
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
  ],
  templateUrl: './map-editor.component.html',
  styleUrl: './map-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapEditorComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  gl!: WebGL2RenderingContext;
  width: number = 0;
  height: number = 0;
  perspectiveCamera: PerspectiveCamera;
  orthoCamera: OrtographicCamera;
  texture1!: Texture;
  mousePos = vec3.create();
  bones: Bone[] = new Array();
  angle = 0;
  isMouseDown: boolean = false;
  isMouseMoved: boolean = false;
  splatColor = 'red';
  tool: Tools = 0;

  meshbrush: Brush = {
    radius: 5,
    strength: 1,
    image: new Image(),
    type: ToolBrush.Grass,
    color: 'red',
    alpha: 1,
    entity: -1,
    negative: false,
  };
  ecs: Ecs;
  //All systems in editor
  renderSystem: RenderSystem = new RenderSystem();
  brushSystem: BrushSystem = new BrushSystem();

  brushToolsImages: HTMLImageElement[] = new Array();

  selectedShader: string = 'default';

  splatmapShader1!: Shader;
  splatmapShader2!: Shader;

  sceneObjects: Set<Name> = new Set<Name>();

  transform: Transform3D = new Transform3D();

  constructor() {
    this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.perspectiveCamera = new PerspectiveCamera(1920, 1080);
    this.ecs = new Ecs();
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

  async ngAfterViewInit() {
    this.gl = this.canvas.nativeElement.getContext('webgl2', { depth: true })!;
    if (!this.gl) throw Error('Webgl2 not supported');
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.gl.canvas.width = 1920;
    this.gl.canvas.height = 1080;
    this.texture1 = new Texture(this.gl);
    this.addEventListeners();
    await Loader.loadAllBones();
    // await Loader.loadAllShader();
    // await Loader.loadAllTextures();
    this.bones = Loader.getBones('skeleton');
    await this.init();
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      const speed = 10;
      switch (event.code) {
        case 'KeyW':
          this.perspectiveCamera.rotateY(5);
          break;
        case 'KeyS':
          this.perspectiveCamera.rotateY(-5);
          break;
        case 'KeyA':
          this.perspectiveCamera.updatePosition(0, 0, 10);
          break;
        case 'KeyD':
          this.perspectiveCamera.updatePosition(0, 0, -10);
          break;
        case 'ArrowUp':
          this.perspectiveCamera.updatePosition(0, 10, 0);
          break;
        case 'ArrowDown':
          this.perspectiveCamera.updatePosition(0, -10, 0);
          break;
        case 'ArrowRight':
          this.perspectiveCamera.updatePosition(10, 0, 0);
          break;
        case 'ArrowLeft':
          this.perspectiveCamera.updatePosition(-10, 0, 0);
          break;
      }
    });

    this.canvas.nativeElement.addEventListener('wheel', (event) => {
      console.log(event.deltaY);
      this.perspectiveCamera.rotateX(event.deltaY / 50);
    });

    this.canvas.nativeElement.addEventListener('mouseleave', (e) => {
      this.isMouseDown = false;
    });

    this.canvas.nativeElement.addEventListener('mousemove', (e) => {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      const x = e.x - rect.left;
      const y = e.y - rect.top;
      const clipX = (x / rect.width) * 2 - 1;
      const clipY = (y / rect.height) * -2 + 1;
      const normalizedPos = vec2.fromValues(clipX, clipY);
      const clipCoords = vec4.fromValues(
        normalizedPos[0],
        normalizedPos[1],
        -1,
        1
      );
      const invertedProjectionMatrix = mat4.create();
      mat4.invert(
        invertedProjectionMatrix,
        this.perspectiveCamera.getProjectionMatrix()
      );
      const eyeCoords = vec4.fromValues(0, 0, 0, 0);
      vec4.transformMat4(eyeCoords, clipCoords, invertedProjectionMatrix);
      const toEyeCoords = vec4.fromValues(eyeCoords[0], eyeCoords[1], -1, 0);
      const invertedView = mat4.create();
      mat4.invert(invertedView, this.perspectiveCamera.getViewMatrix());
      const rayWorld = vec4.fromValues(0, 0, 0, 0);
      vec4.transformMat4(rayWorld, toEyeCoords, invertedView);
      const mouseRay = vec3.fromValues(rayWorld[0], rayWorld[1], rayWorld[2]);
      vec3.normalize(mouseRay, mouseRay);
      this.mousePos[0] = mouseRay[0];
      this.mousePos[1] = mouseRay[1];
      this.mousePos[2] = mouseRay[2];
      //console.log(this.mousePos, invertedView);
      this.isMouseMoved = true;
    });

    this.canvas.nativeElement.addEventListener('mousedown', (e) => {
      //console.log(this.perspectiveCamera.position);
      const invertedMatrix = mat4.create();
      mat4.invert(invertedMatrix, this.perspectiveCamera.getViewMatrix());
      this.isMouseDown = true;
    });

    this.canvas.nativeElement.addEventListener('mouseup', (e) => {
      this.isMouseDown = false;
    });
  }

  changeActiveEntity(entity: Entity) {
    this.meshbrush.entity = entity;
    const transform = this.ecs.getComponent<Transform3D>(entity, 'Transform3D');
    if (transform) {
      this.transform = transform;
      console.log(this.transform.translate);
    }
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
    }
  }

  addToScene() {
    this.createTerrainWithSplatmap(0);
  }

  async init() {
    const gl = this.gl;
    const shader = new Shader(gl);
    await shader.initShaders('imageVS.txt', 'imageFS.txt');
    this.splatmapShader1 = new Shader(gl);
    await this.splatmapShader1.initShaders(
      'image_vertex.txt',
      'image_fragment.txt'
    );
    const shader2 = new Shader(gl);
    await shader2.initShaders('skybox_vertex.txt', 'skybox_fragment.txt');
    const basicShader = new Shader(gl);
    await basicShader.initShaders('basic_vertex.txt', 'basic_fragment.txt');
    const waterShader = new Shader(gl);
    await waterShader.initShaders('water_vertex.txt', 'water_fragment.txt');
    const grassShader = new Shader(gl);
    await grassShader.initShaders('grass_vertex.txt', 'grass_fragment.txt');
    const treeShader = new Shader(gl);
    await treeShader.initShaders('tree_vertex.txt', 'tree_fragment.txt');
    const vfxShader = new Shader(gl);
    await vfxShader.initShaders('vfx_vertex.txt', 'vfx_fragment.txt');
    this.splatmapShader2 = new Shader(gl);
    await this.splatmapShader2.initShaders(
      'splatmap_vertex.txt',
      'splatmap_fragment.txt'
    );

    const whirlwindTexture = await this.texture1.loadTexture(
      '/assets/textures/whirlwind_map.jpg'
    );
    const textureMapImage = await this.texture1.loadTexture(
      '/assets/textures/texture_map.jpg'
    );

    const waterTextureImage = await this.texture1.loadTexture(
      '/assets/textures/water_texture.jpg'
    );

    const skybox1 = await this.texture1.loadTexture(
      'assets/textures/skybox/right.bmp'
    );
    const skybox2 = await this.texture1.loadTexture(
      'assets/textures/skybox/left.bmp'
    );
    const skybox3 = await this.texture1.loadTexture(
      'assets/textures/skybox/top.bmp'
    );
    const skybox4 = await this.texture1.loadTexture(
      'assets/textures/skybox/bottom.bmp'
    );
    const skybox5 = await this.texture1.loadTexture(
      'assets/textures/skybox/front.bmp'
    );
    const skybox6 = await this.texture1.loadTexture(
      'assets/textures/skybox/back.bmp'
    );

    const tree = await this.texture1.loadTexture(
      'assets/textures/tree_texture.png'
    );

    // const spriteSlot = this.texture1.createAndBindTexture(sprite, sprite.width, sprite.height);
    const slot = this.texture1.createAndBindTexture(
      textureMapImage,
      textureMapImage.width,
      textureMapImage.height
    );

    const whirlwindSlot = this.texture1.createAndBindTexture(
      whirlwindTexture,
      whirlwindTexture.width,
      whirlwindTexture.height
    );

    const treeSlot = this.texture1.createAndBindTexture(
      tree,
      tree.width,
      tree.height
    );

    const skyboxImages = [skybox1, skybox2, skybox3, skybox4, skybox5, skybox6];
    const skyboxTexture = this.texture1.loadSkybox(skyboxImages);

    const smokeBrushImage = await this.texture1.loadTexture(
      'assets/textures/smoke_brush.jpg'
    );

    const starBrushImage = await this.texture1.loadTexture(
      'assets/textures/star_brush.jpg'
    );

    const terrainBrushImage = await this.texture1.loadTexture(
      'assets/textures/terrain_brush.jpg'
    );

    const roundBrushImage = await this.texture1.loadTexture(
      'assets/textures/round_brush.jpg'
    );

    const smallRoundBrushImage = await this.texture1.loadTexture(
      'assets/textures/round_brush_small.jpg'
    );

    const smallBrushImage = await this.texture1.loadTexture(
      'assets/textures/small_brush.jpg'
    );

    // const strokeBrushImage = await this.texture1.loadTexture(
    //   'assets/textures/stroke_brush.jpg'
    // );

    // const cylinderModel = new Model();
    // cylinderModel.addCylinder();
    // const effectEntity = this.ecs.createEntity();
    // const cylinderMesh = new MeshRenderer(
    //   gl,
    //   new Float32Array(cylinderModel.vertices),
    //   new Uint16Array(cylinderModel.indices),
    //   vfxShader
    // );

    // this.ecs.addComponent<Material>(
    //   effectEntity,
    //   new Material(
    //     vfxShader,
    //     this.texture1.getTexture(whirlwindSlot)!,
    //     whirlwindSlot
    //   )
    // );

    // this.ecs.addComponent<AnimatedTexture>(
    //   effectEntity,
    //   new AnimatedTexture(10)
    // );

    // this.ecs.addComponent<Transform3D>(effectEntity, new Transform3D());

    // this.ecs.addComponent<Name>(effectEntity, new Name('Cylinder'));

    // this.ecs.addComponent<Mesh>(effectEntity, new Mesh(cylinderMesh.vao));

    this.brushToolsImages.push(
      smokeBrushImage,
      starBrushImage,
      terrainBrushImage,
      roundBrushImage,
      smallRoundBrushImage,
      smallBrushImage
    );

    this.meshbrush.image = smokeBrushImage;

    const grassModel = new Model();
    grassModel.addGrass(0, 0, 0);

    const grassMesh = new MeshRenderer(
      gl,
      new Float32Array(grassModel.vertices),
      new Uint16Array(grassModel.indices),
      grassShader
    );

    const grassEntity = this.ecs.createEntity();
    this.ecs.addComponent<Material>(
      grassEntity,
      new Material(grassShader, null, 4)
    );
    this.ecs.addComponent<AnimatedTexture>(
      grassEntity,
      new AnimatedTexture(10)
    );

    const grass = this.ecs.addComponent<Grass>(grassEntity, new Grass());
    if (grass) {
      const newMesh = this.renderSystem.createBatch(
        gl,
        grassMesh,
        grass.maxGrassBuffer
      );
      this.ecs.addComponent<Mesh>(grassEntity, new Mesh(newMesh.vao));
    }

    this.createTerrainWithSplatmap(slot);

    // this.createWater(waterShader, 4, 0, 0.1);
    // this.createWater(waterShader, 4, 50, 0.1);
    this.createTree(treeShader, treeSlot);

    this.setupSkybox(shader2, skyboxTexture!);

    // Kamera-position
    const viewMatrix = this.perspectiveCamera.getViewMatrix();
    const invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);
    const origin = vec3.fromValues(
      invertedView[12],
      invertedView[13],
      invertedView[14]
    );

    // Musposition
    const start = origin;
    const end = vec3.create();
    vec3.scaleAndAdd(end, start, this.mousePos, 500);

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
    //   this.texture1.getTexture(0),
    //   shader3
    // );

    // const pivotModel = new Model();
    // pivotModel.addPivot();
    // this.pivotMesh = new MeshRenderer(
    //   gl,
    //   new Float32Array(pivotModel.vertices),
    //   new Uint16Array(pivotModel.indices),
    //   this.texture1.getTexture(0),
    //   shader3
    // );
    //Add all entities with names to the scene list to display them in the scene list
    for (const entity of this.ecs.getEntities()) {
      const name = this.ecs.getComponent<Name>(entity, 'Name');
      if (!name) continue;
      this.sceneObjects.add(name);
    }
    this.loop();
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
          material.shader = this.splatmapShader1;
        } else if (event.value === 'shader1') {
          material.shader = this.splatmapShader2;
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

  private createTerrainWithSplatmap(slot: number) {
    const width = 1024;
    const height = 1024;
    const model = new Model();
    model.addPlane(100);
    const backgroundMesh = new MeshRenderer(
      this.gl,
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
      this.splatmapShader1
    );
    const newEntity = this.ecs.createEntity();
    this.ecs.addComponent<Name>(newEntity, new Name('Terrain' + newEntity));
    //Add mesh component to entity
    this.ecs.addComponent(newEntity, new Mesh(backgroundMesh.vao));
    //Add material component to entity
    this.ecs.addComponent(
      newEntity,
      new Material(this.splatmapShader1, this.texture1.getTexture(slot), slot)
    );

    const splatmap = this.texture1.createAndBindTexture(null, width, height);
    //Add splatmap too terrain entity
    this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap(width, height, this.texture1.getTexture(splatmap), splatmap)
    );
    this.ecs.addComponent<Transform3D>(newEntity, new Transform3D());
    this.updateSplatmap();
    this.updateMesh();
  }

  private createMesh(shader: Shader, slot: number) {
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
      new Material(shader, this.texture1.getTexture(slot)!, slot)
    );
    console.log('Created Mesh!!!');
  }

  private createWater(shader: Shader, slot: number, x: number, y: number) {
    const entity = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      entity,
      new Transform(new Vec(0, 0), new Vec(0, 0), 100)
    );
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
      new Material(shader, this.texture1.getTexture(slot)!, slot)
    );
    this.ecs.addComponent<AnimatedTexture>(entity, new AnimatedTexture(10));
    console.log('Created Water!!!');
  }

  private createTree(shader: Shader, slot: number) {
    const entity = this.ecs.createEntity();
    const model = new Model();
    //Change later in runtime with some parameters in UI
    model.addTree(0, 20);
    const mesh = new MeshRenderer(
      this.gl,
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
      shader
    );

    this.ecs.addComponent<Material>(
      entity,
      new Material(shader, this.texture1.getTexture(slot)!, slot)
    );
    this.ecs.addComponent<Tree>(entity, new Tree());
    const newTreeMesh = this.renderSystem.createBatch(this.gl, mesh, 1000);
    this.ecs.addComponent<Mesh>(entity, new Mesh(newTreeMesh.vao));
    console.log('Created tree!');
  }

  loop() {
    //FPS
    //console.log(Math.floor(performance.now() / 1000));
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
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
    this.updateBonePositions(this.bones);
    if (this.isMouseDown && this.isMouseMoved) {
      this.brushSystem.update(
        this.meshbrush,
        this.ecs,
        this.mousePos,
        this.perspectiveCamera
      );
      this.isMouseMoved = false;
      this.updateMesh();
      this.updateSplatmap();
    }

    // const model = new Model();
    // for (let i = 0; i < this.bones.length; i++) {
    //   const bone = this.bones[i];
    //   model.addSquares(
    //     this.texture1.getImage(0).width,
    //     this.texture1.getImage(0).height,
    //     MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2,
    //     bone.pivot,
    //     bone.startX,
    //     bone.startY,
    //     bone.endX,
    //     bone.endY,
    //     300 + bone.position.x - bone.pivot.x - bone.endX / 2,
    //     300 + bone.position.y - bone.pivot.y,
    //     bone.endX,
    //     bone.endY
    //   );
    // }
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

  updateBonePositions(bones: Bone[]): void {
    for (const bone of bones) {
      let parentRotation = 0;
      if (bone.parentId) {
        const parent = MathUtils.findBoneById(bones, bone.parentId);
        if (parent) {
          parentRotation = MathUtils.calculateGlobalRotation(bones, parent);
          bone.position = MathUtils.calculateParentPosition(
            parent.position,
            parent.length * bone.attachAt * parent.scale.y,
            parentRotation
          );
        }
      }
    }
  }

  draw() {
    this.renderSystem.update(this.ecs, this.gl, this.perspectiveCamera);
  }
}
