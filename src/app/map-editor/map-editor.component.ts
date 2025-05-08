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
import { FormsModule } from '@angular/forms';
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
import { SplatmapSystem } from 'src/systems/splatmap-system';
import { Skybox } from 'src/components/skybox';

enum Tools {
  Splatmap,
  Heightmap,
}

export type MeshBrush = {
  radius: number;
  strength: number;
};

export type SplatBrush = {
  alpha: number;
  radius: number;
  color: string;
  imageData: HTMLImageElement;
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
  splatColor = 'red';
  tool: Tools = 0;
  meshbrush: MeshBrush = { radius: 5, strength: 1 };
  splatBrush: SplatBrush = {
    alpha: 1,
    radius: 50,
    color: 'red',
    imageData: new Image(),
  };
  ecs: Ecs;
  renderSystem: RenderSystem = new RenderSystem();
  brushSystem: BrushSystem = new BrushSystem();
  splatmapSystem: SplatmapSystem = new SplatmapSystem();

  constructor() {
    this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.perspectiveCamera = new PerspectiveCamera(800, 600);
    this.ecs = new Ecs();
  }

  async ngAfterViewInit() {
    this.gl = this.canvas.nativeElement.getContext('webgl2', { depth: true })!;
    if (!this.gl) throw Error('Webgl2 not supported');
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.gl.canvas.width = 800;
    this.gl.canvas.height = 600;
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
      console.log(event.code);
      switch (event.code) {
        case 'KeyW':
          this.perspectiveCamera.rotateX(1);
          break;
        case 'KeyS':
          this.perspectiveCamera.rotateX(-1);
          break;
        case 'KeyA':
          this.perspectiveCamera.updatePosition(0, 0, 1);
          break;
        case 'KeyD':
          this.perspectiveCamera.updatePosition(0, 0, -1);
          break;
        case 'ArrowUp':
          this.perspectiveCamera.updatePosition(0, 1, 0);
          break;
        case 'ArrowDown':
          this.perspectiveCamera.updatePosition(0, -1, 0);
          break;
        case 'ArrowRight':
          this.perspectiveCamera.updatePosition(1, 0, 0);
          break;
        case 'ArrowLeft':
          this.perspectiveCamera.updatePosition(-1, 0, 0);
          break;
      }
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
    });

    this.canvas.nativeElement.addEventListener('mousedown', (e) => {
      console.log(this.mousePos);
      //console.log(this.perspectiveCamera.position);
      const invertedMatrix = mat4.create();
      mat4.invert(invertedMatrix, this.perspectiveCamera.getViewMatrix());
      console.log(
        'x' + invertedMatrix[12],
        'y' + invertedMatrix[13],
        'z' + invertedMatrix[14]
      );
      this.isMouseDown = true;
    });

    this.canvas.nativeElement.addEventListener('mouseup', (e) => {
      this.isMouseDown = false;
    });
  }

  updateSplatmap() {
    const gl = this.gl;
    for (const entity of this.ecs.getEntities()) {
      const splatmap = this.ecs.getComponent<Splatmap>(entity, 'Splatmap');
      const material = this.ecs.getComponent<Material>(entity, 'Material');
      if (!splatmap || !material) continue;
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

  changeTool(id: number) {
    this.tool = id;
  }

  async init() {
    const gl = this.gl;
    const shader = new Shader(gl);
    await shader.initShaders('imageVS.txt', 'imageFS.txt');
    const shader1 = new Shader(gl);
    await shader1.initShaders('image_vertex.txt', 'image_fragment.txt');
    const shader2 = new Shader(gl);
    await shader2.initShaders('skybox_vertex.txt', 'skybox_fragment.txt');
    const shader3 = new Shader(gl);
    await shader3.initShaders('basic_vertex.txt', 'basic_fragment.txt');
    const image1 = await this.texture1.loadTexture(
      '/assets/sprites/104085.png'
    );
    const image2 = await this.texture1.loadTexture(
      '/assets/textures/texture_map.png'
    );

    const skybox1 = await this.texture1.loadTexture(
      'assets/textures/skybox/right.jpg'
    );
    const skybox2 = await this.texture1.loadTexture(
      'assets/textures/skybox/left.jpg'
    );
    const skybox3 = await this.texture1.loadTexture(
      'assets/textures/skybox/top.jpg'
    );
    const skybox4 = await this.texture1.loadTexture(
      'assets/textures/skybox/bottom.jpg'
    );
    const skybox5 = await this.texture1.loadTexture(
      'assets/textures/skybox/front.jpg'
    );
    const skybox6 = await this.texture1.loadTexture(
      'assets/textures/skybox/back.jpg'
    );

    this.texture1.createAndBindTexture(image1, image1.width, image1.height, 0);
    this.texture1.createAndBindTexture(image2, image2.width, image2.height, 1);
    this.texture1.createAndBindTexture(null, 2048, 2048, 2);
    this.texture1.createAndBindTexture(null, 2048, 2048, 3);

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

    this.splatBrush.imageData = terrainBrushImage;

    const backgroundModel = new Model();
    backgroundModel.addPlane(150, 0, 200, 200);
    const backgroundMesh = new MeshRenderer(
      gl,
      new Float32Array(backgroundModel.vertices),
      new Uint16Array(backgroundModel.indices),
      shader1
    );

    const newEntity = this.ecs.createEntity();
    this.ecs.addComponent(
      newEntity,
      new Mesh(
        backgroundMesh.vao.vao,
        backgroundMesh.vao.vertexBuffer.buffer,
        backgroundMesh.vao.vertexBuffer.vertices,
        backgroundMesh.vao.indexBuffer.indices
      )
    );
    this.ecs.addComponent(
      newEntity,
      new Material(shader1.program, this.texture1.getTexture(1), 1)
    );
    this.ecs.addComponent<Splatmap>(
      newEntity,
      new Splatmap(2048, 2048, this.texture1.getTexture(2), 2)
    );

    const backgroundModel2 = new Model();
    backgroundModel2.addPlane(150, 200, 200, 200);
    const backgroundMesh2 = new MeshRenderer(
      gl,
      new Float32Array(backgroundModel2.vertices),
      new Uint16Array(backgroundModel2.indices),
      shader1
    );

    const entity2 = this.ecs.createEntity();
    this.ecs.addComponent(
      entity2,
      new Mesh(
        backgroundMesh2.vao.vao,
        backgroundMesh2.vao.vertexBuffer.buffer,
        backgroundMesh2.vao.vertexBuffer.vertices,
        backgroundMesh2.vao.indexBuffer.indices
      )
    );
    this.ecs.addComponent(
      entity2,
      new Material(shader1.program, this.texture1.getTexture(1), 1)
    );
    this.ecs.addComponent<Splatmap>(
      entity2,
      new Splatmap(2048, 2048, this.texture1.getTexture(3), 3)
    );

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
    this.updateSplatmap();
    this.loop();
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

  loop() {
    //FPS
    //console.log(Math.floor(performance.now() / 1000));
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.updateBonePositions(this.bones);
    if (this.isMouseDown && this.tool === Tools.Heightmap) {
      this.brushSystem.update(
        this.meshbrush,
        this.ecs,
        this.mousePos,
        this.perspectiveCamera
      );
    } else if (this.isMouseDown && this.tool === Tools.Splatmap) {
      this.splatmapSystem.update(
        this.splatBrush,
        this.ecs,
        this.mousePos,
        this.perspectiveCamera
      );
      this.updateSplatmap();
    }

    const model = new Model();
    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i];
      model.addSquares(
        this.texture1.getImage(0).width,
        this.texture1.getImage(0).height,
        MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2,
        bone.pivot,
        bone.startX,
        bone.startY,
        bone.endX,
        bone.endY,
        300 + bone.position.x - bone.pivot.x - bone.endX / 2,
        300 + bone.position.y - bone.pivot.y,
        bone.endX,
        bone.endY
      );
    }

    for (const entity of this.ecs.getEntities()) {
      const mesh = this.ecs.getComponent<Mesh>(entity, 'Mesh');
      if (mesh) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, mesh.vertices);
      }
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
