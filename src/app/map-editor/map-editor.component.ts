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
import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';
import { Texture } from 'src/renderer/texture';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { mat4, vec3 } from 'gl-matrix';
import { Vec } from '../vec';

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
  camera!: PerspectiveCamera;
  shader!: Shader;
  vao!: VertexArrayBuffer;
  texture1!: Texture;
  texture2!: Texture;
  texture3!: Texture;
  texture4!: Texture;
  texture5!: Texture;
  mousePos = vec3.create();

  vsSource = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;

  uniform sampler2D uTexture;
  uniform mat4 u_viewProjection;
  uniform mat4 u_modelMatrix;

  varying vec2 vTexCoord;

  void main(void) {
    float displacementScale = 1.0;
    float displacement = texture2D(uTexture, aTexCoord).a * displacementScale;
    vec4 displacedPosition = aPosition + vec4(0, displacement, 0, 0);
    gl_Position = u_viewProjection * u_modelMatrix * displacedPosition;
    vTexCoord = aTexCoord * 10.0;
  }
`;

  // Fragment shader program
  fsSource = `
    precision highp float;
    
    uniform sampler2D uTexture;
    uniform sampler2D uSplatMap;
    uniform sampler2D uTextureMap;

    varying vec2 vTexCoord;

    void main(){

      // should make this a uniform so it's shared
      float displacementScale = 10.0;
      
      vec3 data = texture2D(uTexture, vTexCoord / 20.0).rgb;
      vec3 normal = data * 2. - 1.;
      
      // just hard code lightDir and color
      // to make it easy
      vec3 lightDir = normalize(vec3(1, -3, 2));
      float light = dot(lightDir, normal);

      vec4 splatColor = texture2D(uSplatMap, vTexCoord / 10.0);

      vec2 uv_dirt = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(0.0 / 5.0, 0.0 / 2.0);
      vec2 uv_sand = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(1.0 / 5.0, 0.0 / 2.0);
      vec2 uv_grass = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(2.0 / 5.0, 0.0 / 2.0);
      vec2 uv_plants = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(3.0 / 5.0, 0.0 / 2.0);
      vec2 uv_snow = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(4.0 / 5.0, 0.0 / 2.0);

      vec2 uv_ground1 = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(0.0 / 5.0, 1.0 / 2.0);
      vec2 uv_ground2 = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(1.0 / 5.0, 1.0 / 2.0);
      vec2 uv_ground3 = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(2.0 / 5.0, 1.0 / 2.0);
      vec2 uv_ground4 = fract(vTexCoord) * vec2(1.0 / 5.0, 1.0 / 2.0) + vec2(3.0 / 5.0, 1.0 / 2.0);

      vec4 grass = texture2D(uTextureMap, uv_grass);
      vec4 dirt = texture2D(uTextureMap, uv_dirt);
      vec4 sand = texture2D(uTextureMap, uv_sand);
      vec4 snow = texture2D(uTextureMap, uv_snow);
      vec4 plant = texture2D(uTextureMap, uv_plants);

      vec4 ground1 = texture2D(uTextureMap, uv_ground1);
      vec4 ground2 = texture2D(uTextureMap, uv_ground2);
      vec4 ground3 = texture2D(uTextureMap, uv_ground3);
      vec4 ground4 = texture2D(uTextureMap, uv_ground4);

      vec4 finalColor = splatColor.r * grass + 
                        splatColor.g * ground4 + 
                        splatColor.b * plant;

      gl_FragColor = finalColor * light;
    }
  `;

  constructor() {
    this.camera = new PerspectiveCamera();
  }

  ngAfterViewInit(): void {
    this.gl = this.canvas.nativeElement.getContext('webgl2')!;
    if (!this.gl) throw Error('Webgl2 not supported');
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.gl.canvas.width = 800;
    this.gl.canvas.height = 600;
    this.shader = new Shader(this.gl, this.vsSource, this.fsSource);
    this.renderer = new Renderer(this.gl);
    this.texture1 = new Texture(this.gl);
    this.texture2 = new Texture(this.gl);
    this.texture3 = new Texture(this.gl);
    this.texture4 = new Texture(this.gl);
    this.texture5 = new Texture(this.gl);
    if (!this.renderer) return;
    this.addEventListeners();
    this.init();
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      const speed = 10;
      console.log(event.code);
      switch (event.code) {
        case 'KeyW':
          this.camera.rotateX(1);
          break;
        case 'KeyS':
          this.camera.rotateX(-1);
          break;
        case 'KeyA':
          this.camera.updatePosition(1, 0, 0);
          break;
        case 'KeyD':
          this.camera.updatePosition(-1, 0, 0);
          break;
        case 'ArrowUp':
          this.camera.updatePosition(0, 0, 1);
          break;
        case 'ArrowDown':
          this.camera.updatePosition(0, 0, -1);
          break;
      }
      this.loop();
    });

    this.canvas.nativeElement.addEventListener('mousemove', (e) => {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clipX = (x / rect.width) * 2 - 1;
      const clipY = (y / rect.height) * -2 + 1;
      const invMat = mat4.invert(
        mat4.create(),
        this.camera.getViewProjectionMatrix()
      );

      const start = vec3.transformMat4(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(clipX, clipY, -1),
        invMat
      );
      const end = vec3.transformMat4(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(clipX, clipY, 1),
        mat4.invert(mat4.create(), this.camera.getViewProjectionMatrix())
      );

      const rayDir = vec3.normalize(
        vec3.create(),
        vec3.subtract(vec3.create(), end, start)
      );
      this.mousePos = rayDir;
      this.loop();
    });
  }

  async init() {
    const gl = this.gl;
    const vertices = [];
    const indices = [];
    const width = 100;
    const height = 100;

    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        let posX = (x / width) * width - width / 2;
        let posY = 5;
        let posZ = (y / height) * height - height / 2;
        vertices.push(posX, posY, posZ, x / width, y / height);
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let topLeft = y * (width + 1) + x; // Räkna radvis
        let topRight = topLeft + 1;
        let bottomLeft = topLeft + (width + 1); // Räkna nästa rad
        let bottomRight = bottomLeft + 1;

        // För varje fyrkant skapar vi två trianglar
        indices.push(topLeft, bottomLeft, topRight);
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    console.log('Vertices:', vertices);
    console.log('Indices:', indices);

    this.vao = VertexArrayBuffer.create(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
    // Koppla attributen
    const posAttrib = gl.getAttribLocation(this.shader.program, 'aPosition');
    gl.vertexAttribPointer(
      posAttrib,
      3,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(posAttrib);

    // Koppla attributen
    const texAttrib = gl.getAttribLocation(this.shader.program, 'aTexCoord');
    gl.vertexAttribPointer(
      texAttrib,
      2,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(texAttrib);

    const image1 = await this.texture1.loadTexture(
      'assets/textures/heightmap.png'
    );

    const image2 = await this.texture2.loadTexture(
      'assets/textures/texture_map.png'
    );

    const image3 = await this.texture3.loadTexture('assets/textures/grass.jpg');

    const image4 = await this.texture4.loadTexture(
      'assets/textures/mountain.png'
    );

    const image5 = await this.texture5.loadTexture(
      'assets/textures/splatmap.jpg'
    );

    // get image data
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.canvas.width = image1.width;
    ctx.canvas.height = image1.height;
    ctx.drawImage(image1, 0, 0);
    const imgData = ctx.getImageData(0, 0, image1.width, image1.height);

    // generate normals from height data
    const displacementScale = 10;
    const data = new Uint8Array(imgData.data.length);
    const v0 = vec3.fromValues(0, 0, 0);
    const v1 = vec3.fromValues(0, 0, 0);
    const normal = vec3.fromValues(0, 0, 0);
    for (let z = 0; z < imgData.height - 1; ++z) {
      for (let x = 0; x < imgData.width - 1; ++x) {
        const off = (z * imgData.width + x) * 4;

        // Get height values for current, right, and down pixels
        const h0 = imgData.data[off]; // Current height
        const h1 = imgData.data[off + 4]; // Right pixel height
        const h2 = imgData.data[off + imgData.width * 4]; // Down pixel height

        // Create 3D points for the triangle
        const p0 = vec3.fromValues(x, (h0 * displacementScale) / 255, z);
        const p1 = vec3.fromValues(x + 1, (h1 * displacementScale) / 255, z);
        const p2 = vec3.fromValues(x, (h2 * displacementScale) / 255, z + 1);

        // Calculate the two vectors for the triangle
        vec3.subtract(v0, p1, p0); // Vector from p0 to p1
        vec3.subtract(v1, p2, p0); // Vector from p0 to p2

        // Calculate the normal using cross product
        vec3.cross(normal, v0, v1);
        vec3.normalize(normal, normal); // Normalize the normal

        // Write the normal to the data array (converting it to RGB)
        data[off] = (normal[0] * 0.5 + 0.5) * 255;
        data[off + 1] = (normal[1] * 0.5 + 0.5) * 255;
        data[off + 2] = (normal[2] * 0.5 + 0.5) * 255;

        // Retain the original height value in the alpha channel
        data[off + 3] = h0;
      }
    }

    this.texture1.createNormalMap(data, image1);
    this.texture2.createAndBindTexture(image2, 1);
    this.texture3.createAndBindTexture(image3, 2);
    this.texture4.createAndBindTexture(image4, 3);
    this.texture5.createAndBindTexture(image5, 4);

    this.loop();
  }

  loop() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.1, 0.1, 0.1, 1.0); // Svart bakgrund
    gl.clear(gl.COLOR_BUFFER_BIT); // Rensa skärmen

    this.shader.use();

    const cameraLocation = gl.getUniformLocation(
      this.shader.program,
      'u_viewProjection'
    );
    gl.uniformMatrix4fv(
      cameraLocation,
      false,
      this.camera.getViewProjectionMatrix()
    );

    // Använd texturen i en shader
    gl.uniform1i(
      gl.getUniformLocation(this.shader.program, 'uTexture'),
      this.texture1.getSlot()
    );
    gl.uniform1i(
      gl.getUniformLocation(this.shader.program, 'uTextureMap'),
      this.texture2.getSlot()
    );
    gl.uniform1i(
      gl.getUniformLocation(this.shader.program, 'uDisplacementMap'),
      this.texture3.getSlot()
    );
    gl.uniform1i(
      gl.getUniformLocation(this.shader.program, 'uMountain'),
      this.texture4.getSlot()
    );
    gl.uniform1i(
      gl.getUniformLocation(this.shader.program, 'uSplatMap'),
      this.texture5.getSlot()
    );

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [
      this.mousePos[0],
      this.mousePos[1],
      this.mousePos[2] - 5,
    ]); // Flytta bakåt lite
    const modelMatrixLoc = gl.getUniformLocation(
      this.shader.program,
      'u_modelMatrix'
    );
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);

    this.vao.bind();
    gl.drawElements(
      gl.TRIANGLES,
      this.vao.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0
    );
    this.vao.unbind();
  }

  getVertexPosition(vertices: number[]) {
    vertices;
  }
}
