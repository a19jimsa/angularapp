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
import { Renderer } from 'src/renderer/renderer';
import { Shader } from 'src/renderer/shader';
import { Texture } from 'src/renderer/texture';
import { mat4, vec3 } from 'gl-matrix';
import { OrtographicCamera } from 'src/renderer/orthographic-camera';
import { Mesh } from 'src/renderer/mesh';
import { FormsModule } from '@angular/forms';
import { Loader } from '../loader';
import { Bone } from 'src/components/bone';
import { MathUtils } from 'src/Utils/MathUtils';
import { Model } from 'src/renderer/model';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

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
  renderer!: Renderer;
  perspectiveCamera: PerspectiveCamera;
  orthoCamera: OrtographicCamera;
  texture1!: Texture;
  mousePos = vec3.create();
  activeVertexId: number = 0;
  activeVertexPosition: vec3 = vec3.fromValues(0, 0, 0);
  bones: Bone[] = new Array();
  mesh: Mesh | null = null;
  backgroundMesh!: Mesh;
  cubeMesh!: Mesh;
  angle = 0;

  constructor() {
    this.orthoCamera = new OrtographicCamera(0, 800, 600, 0);
    this.perspectiveCamera = new PerspectiveCamera(800, 600);
  }

  async ngAfterViewInit() {
    this.gl = this.canvas.nativeElement.getContext('webgl2')!;
    if (!this.gl) throw Error('Webgl2 not supported');
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.gl.canvas.width = 800;
    this.gl.canvas.height = 600;
    this.renderer = new Renderer(this.gl);
    this.texture1 = new Texture(this.gl);
    if (!this.renderer) return;
    this.addEventListeners();
    await Loader.loadAllBones();
    this.bones = Loader.getBones('skeleton');
    await this.init();
    console.log(this.bones);
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      const speed = 10;
      console.log(event.code);
      switch (event.code) {
        case 'KeyW':
          this.perspectiveCamera.rotateX(180);
          break;
        case 'KeyS':
          this.perspectiveCamera.rotateX(-1);
          break;
        case 'KeyA':
          this.perspectiveCamera.rotateZ(-1);
          break;
        case 'KeyD':
          this.perspectiveCamera.rotateZ(1);
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

    this.canvas.nativeElement.addEventListener('mousemove', (e) => {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const clipX = (x / rect.width) * 2 - 1;
      const clipY = (y / rect.height) * -2 + 1;
      const invMat = mat4.invert(
        mat4.create(),
        this.perspectiveCamera.getViewProjectionMatrix()
      );

      const start = vec3.transformMat4(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(clipX, clipY, -1),
        invMat
      );
      const end = vec3.transformMat4(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(clipX, clipY, 1),
        mat4.invert(
          mat4.create(),
          this.perspectiveCamera.getViewProjectionMatrix()
        )
      );

      const rayDir = vec3.normalize(
        vec3.create(),
        vec3.subtract(vec3.create(), end, start)
      );
      this.mousePos = rayDir;
    });
  }

  async init() {
    const gl = this.gl;
    const shader = new Shader(gl);
    await shader.initShaders('imageVS.txt', 'imageFS.txt');
    const shader2 = new Shader(gl);
    await shader2.initShaders('image_vertex.txt', 'image_fragment.txt');
    const shader3 = new Shader(gl);
    await shader3.initShaders('image_vertex.txt', 'image_fragment.txt');
    const image1 = await this.texture1.loadTexture(
      '/assets/sprites/104085.png'
    );
    const image2 = await this.texture1.loadTexture(
      '/assets/textures/texture_map.png'
    );
    this.texture1.createAndBindTexture(image1, 0);
    this.texture1.createAndBindTexture(image2, 1);
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
    this.mesh = new Mesh(
      gl,
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
      this.texture1.getTexture(0),
      shader
    );
    const backgroundModel = new Model();
    backgroundModel.addPlane(50, 50, 50);
    this.backgroundMesh = new Mesh(
      gl,
      new Float32Array(backgroundModel.vertices),
      new Uint16Array(backgroundModel.indices),
      this.texture1.getTexture(0),
      shader
    );

    const cubeModel = new Model();
    cubeModel.addCube(5, 0, 0, 10, 10, 10);
    console.log(cubeModel);
    this.cubeMesh = new Mesh(
      gl,
      new Float32Array(cubeModel.vertices),
      new Uint16Array(cubeModel.indices),
      this.texture1.getTexture(1),
      shader3
    );
    console.log(this.cubeMesh);

    this.loop();
  }

  getVertexPosition() {
    if (this.mesh) {
      this.activeVertexPosition[0] =
        this.mesh.vao.vertexBuffer.vertices[this.activeVertexId];
      this.activeVertexPosition[1] =
        this.mesh.vao.vertexBuffer.vertices[this.activeVertexId + 1];
      this.activeVertexPosition[2] =
        this.mesh.vao.vertexBuffer.vertices[this.activeVertexId + 2];
    }
  }

  updateVertexValues() {
    if (this.mesh) {
      this.mesh.vao.vertexBuffer.vertices[this.activeVertexId] =
        this.activeVertexPosition[0];
      this.mesh.vao.vertexBuffer.vertices[this.activeVertexId + 1] =
        this.activeVertexPosition[1];
      this.mesh.vao.vertexBuffer.vertices[this.activeVertexId + 2] =
        this.activeVertexPosition[2];
    }
  }

  loop() {
    //console.log(Math.floor(performance.now() / 1000));
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.updateBonePositions(this.bones);
    this.angle++;
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
        bone.position.x - bone.pivot.x - bone.endX / 2,
        bone.position.y - bone.pivot.y,
        bone.endX,
        bone.endY
      );
    }
    if (this.mesh) {
      this.gl.bindBuffer(
        this.gl.ARRAY_BUFFER,
        this.mesh.vao.vertexBuffer.buffer
      );
      this.gl.bufferSubData(
        this.gl.ARRAY_BUFFER,
        0,
        new Float32Array(model.vertices)
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
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthMask(false);
    gl.cullFace(gl.FRONT);
    gl.frontFace(gl.CCW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.1, 0.6, 0.9, 1.0); // Svart bakgrund
    gl.clear(gl.COLOR_BUFFER_BIT); // Rensa skärmen
    this.backgroundMesh.draw(this.orthoCamera);
    this.mesh?.draw(this.orthoCamera);
    this.cubeMesh.draw(this.orthoCamera);
  }
}
