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
import { Terrain } from 'src/components/terrain';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { Mesh } from 'src/components/mesh';
import { Material } from 'src/components/material';
import { RenderSystem } from 'src/systems/render-system';
import { BrushSystem } from 'src/systems/brush-system';

enum Tools {
  Splatmap,
  Heightmap,
}

type MeshBrush = {
  radius: number;
  strength: number;
};

type SplatBrush = {
  alpha: number;
  radius: number;
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
  activeVertexId: number = 0;
  activeVertexPosition: vec3 = vec3.fromValues(0, 0, 0);
  bones: Bone[] = new Array();
  angle = 0;
  isMouseDown: boolean = false;
  splatMap = new Uint8Array(512 * 512 * 4);
  splatColor = 'red';
  tool: Tools = 0;
  meshbrush: MeshBrush = { radius: 5, strength: 1 };
  splatBrush: SplatBrush = { alpha: 0.5, radius: 5 };
  ecs: Ecs;
  renderSystem: RenderSystem = new RenderSystem();
  brushSystem: BrushSystem = new BrushSystem();

  constructor() {
    this.orthoCamera = new OrtographicCamera(0, 600, 600, 0);
    this.perspectiveCamera = new PerspectiveCamera(1920, 1080);
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
          this.perspectiveCamera.rotateZ(1);
          break;
        case 'KeyD':
          this.perspectiveCamera.rotateZ(-1);
          break;
        case 'ArrowUp':
          this.perspectiveCamera.updatePosition(0, 1, 0);
          break;
        case 'ArrowDown':
          this.perspectiveCamera.updatePosition(0, -1, 0);
          break;
        case 'ArrowRight':
          this.perspectiveCamera.updatePosition(0.1, 0, 0);
          break;
        case 'ArrowLeft':
          this.perspectiveCamera.updatePosition(-0.1, 0, 0);
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

  createSplatmap(uv0: number, uv1: number) {
    const texX = Math.floor(uv0 * 512); // Omvandla u till texel X
    const texY = Math.floor(uv1 * 512); // Omvandla v till texel Y
    this.paintCircle(512, 512, texX, texY);
    this.updateSplatmap();
  }

  paintRect(
    width: number,
    height: number,
    cx: number,
    cy: number,
    size: number
  ) {
    const half = Math.floor(size / 2);
    for (let y = -half; y <= half; y++) {
      for (let x = -half; x <= half; x++) {
        const px = cx + x;
        const py = cy + y;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const idx = (py * width + px) * 4;
          this.splatMap[idx + 0] = 0; // R
          this.splatMap[idx + 1] = 255; // G
          this.splatMap[idx + 2] = 0; // B
          this.splatMap[idx + 3] = 0; // A
        }
      }
    }
  }

  paintCircle(width: number, height: number, cx: number, cy: number) {
    const alpha = this.splatBrush.alpha;
    const radius = this.splatBrush.radius;
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const dx = x;
        const dy = y;
        if (dx * dx + dy * dy <= radius * radius) {
          const px = cx + dx;
          const py = cy + dy;
          if (px > 0 && px < width - 1 && py > 0 && py < height - 1) {
            const idx = (py * width + px) * 4;

            if (this.splatColor === 'red') {
              this.splatMap[idx + 0] = 255;
              if (this.splatMap[idx + 1] !== 0) {
                this.splatMap[idx + 0] = 255 * alpha;
                this.splatMap[idx + 1] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 2] !== 0) {
                this.splatMap[idx + 0] = 255 * alpha;
                this.splatMap[idx + 2] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 3] !== 0) {
                this.splatMap[idx + 0] = 255 * alpha;
                this.splatMap[idx + 3] = 255 * (1 - alpha);
              }
            } else if (this.splatColor === 'green') {
              this.splatMap[idx + 1] = 255;
              if (this.splatMap[idx + 0] !== 0) {
                this.splatMap[idx + 1] = 255 * alpha;
                this.splatMap[idx + 0] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 2] !== 0) {
                this.splatMap[idx + 1] = 255 * alpha;
                this.splatMap[idx + 2] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 3] !== 0) {
                this.splatMap[idx + 1] = 255 * alpha;
                this.splatMap[idx + 3] = 255 * (1 - alpha);
              }
            } else if (this.splatColor === 'blue') {
              this.splatMap[idx + 2] = 255;
              if (this.splatMap[idx + 0] !== 0) {
                this.splatMap[idx + 2] = 255 * alpha;
                this.splatMap[idx + 0] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 1] !== 0) {
                this.splatMap[idx + 2] = 255 * alpha;
                this.splatMap[idx + 1] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 3] !== 0) {
                this.splatMap[idx + 2] = 255 * alpha;
                this.splatMap[idx + 3] = 255 * (1 - alpha);
              }
            } else if (this.splatColor === 'alpha') {
              this.splatMap[idx + 3] = 255;
              if (this.splatMap[idx + 0] !== 0) {
                this.splatMap[idx + 3] = 255 * alpha;
                this.splatMap[idx + 0] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 1] !== 0) {
                this.splatMap[idx + 3] = 255 * alpha;
                this.splatMap[idx + 1] = 255 * (1 - alpha);
              }
              if (this.splatMap[idx + 2] !== 0) {
                this.splatMap[idx + 3] = 255 * alpha;
                this.splatMap[idx + 2] = 255 * (1 - alpha);
              }
            }
          }
        }
      }
    }
  }

  updateSplatmap() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture1.getTexture(2));
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      512,
      512,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.splatMap
    );
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
    await shader2.initShaders('image_vertex.txt', 'image_fragment.txt');
    const shader3 = new Shader(gl);
    await shader3.initShaders('basic_vertex.txt', 'basic_fragment.txt');
    const image1 = await this.texture1.loadTexture(
      '/assets/sprites/104085.png'
    );
    const image2 = await this.texture1.loadTexture(
      '/assets/textures/texture_map.png'
    );

    this.texture1.createAndBindTexture(image1, 0);
    this.texture1.createAndBindTexture(image2, 1);
    this.texture1.createAndBindTexture(this.splatMap, 2);
    this.texture1.setUniform(shader1, 'u_splatmap', 2);

    const model = new Model();
    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i];
      model.addSquares(
        500,
        500,
        MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2,
        bone.pivot,
        bone.startX,
        bone.startY,
        bone.endX,
        bone.endY,
        200 + bone.position.x - bone.pivot.x - bone.endX / 2,
        500 + bone.position.y - bone.pivot.y,
        bone.endX,
        bone.endY
      );
    }

    const backgroundModel = new Model();
    backgroundModel.addPlane(50, 0, 100, 100);
    const backgroundMesh = new MeshRenderer(
      gl,
      new Float32Array(backgroundModel.vertices),
      new Uint16Array(backgroundModel.indices),
      this.texture1.getTexture(1),
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

    const terrain = new Terrain();
    let hardness = 255;
    const radius = 10;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distSq = dx * dx + dy * dy;
        if (distSq <= radius * radius) {
          const nx = 30 + dx;
          const ny = 30 + dy;
          const distance = Math.sqrt(distSq); // euklidiskt avstånd
          const falloff = 1 - distance / radius;
          const index = (ny * 64 + nx) * 4;
          terrain.heightMap[index] = 50 * falloff;
        }
      }
    }
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distSq = dx * dx + dy * dy;
        if (distSq <= radius * radius) {
          const nx = 45 + dx;
          const ny = 45 + dy;
          const distance = Math.sqrt(distSq); // euklidiskt avstånd
          const falloff = 1 - distance / radius;
          const index = (ny * 64 + nx) * 4;
          if (distance > 5) {
            terrain.heightMap[index] = 50 * falloff;
          } else {
            terrain.heightMap[index] = 50;
          }
        }
      }
    }

    const width = 64;
    const height = 64;
    const expectedSize = width * height * 4; // RGB-format = 3 kanaler per pixel

    // Kontrollera storleken på arrayen innan du skickar den till WebGL
    console.log(terrain.heightMap.length, expectedSize); // Bör visa samma värde för båda

    this.texture1.createHeightMap(terrain.heightMap, 3);
    this.texture1.setUniform(shader, 'u_heightmap', 3);

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
    this.loop();
  }
  getVertexPosition() {}
  updateVertexValues() {}
  loop() {
    //FPS
    //console.log(Math.floor(performance.now() / 1000));
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.updateBonePositions(this.bones);
    if (this.isMouseDown) {
      this.brushSystem.update(this.ecs, this.mousePos, this.perspectiveCamera);
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
