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
import { OrtographicCamera } from 'src/renderer/orthographic-camera';
import { Renderer } from 'src/renderer/renderer';
import { Shader } from 'src/renderer/shader';
import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';
import { Texture } from 'src/renderer/texture';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { vec3 } from 'gl-matrix';

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
  texture!: Texture;
  texture2!: Texture;

  vsSource = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;

  uniform sampler2D uTexture;
  uniform mat4 u_viewProjection;

  varying vec2 vTexCoord;

  void main(void) {
    float displacementScale = 10.0;
    float displacement = texture2D(uTexture, aTexCoord).r * displacementScale;
    vec4 displacedPosition = aPosition + vec4(0, displacement, 0, 0);
    gl_Position = u_viewProjection * displacedPosition;
    vTexCoord = aTexCoord;
  }
`;

  // Fragment shader program
  fsSource = `
    precision highp float;
    
    uniform sampler2D uTexture;

    varying vec2 vTexCoord;

    void main(){
      float displacementScale = 10.0;
    
      vec3 data = texture2D(uTexture, vTexCoord).rgb;
      vec3 normal = data * 2. - 1.;
    
      vec3 lightDir = normalize(vec3(1, -3, 2));
      float light = dot(lightDir, normal);
      vec3 color = vec3(0.3, 1, 0.1);
      gl_FragColor = vec4(data * (light * 0.5 + 0.5), 1);
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
    this.texture = new Texture(this.gl);
    this.texture2 = new Texture(this.gl);
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
          this.camera.rotateY(10);
          break;
        case 'KeyD':
          this.camera.rotateY(-10);
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
  }

  async init() {
    const gl = this.gl;
    const gridSize = 10; // 10x10 rutnät = 100 trianglar
    const vertices = [];
    const indices = [];

    for (let y = 0; y <= 64; y++) {
      for (let x = 0; x <= 96; x++) {
        let posX = (x / 96) * 96 - 96 / 2;
        let posY = 0;
        let posZ = (y / 64) * 64 - 64 / 2;
        vertices.push(posX, posY, posZ, x / 96, y / 64);
      }
    }

    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 96; x++) {
        let topLeft = y * (96 + 1) + x; // Räkna radvis
        let topRight = topLeft + 1;
        let bottomLeft = topLeft + (96 + 1); // Räkna nästa rad
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

    const image = await this.texture.loadTexture(
      'assets/textures/heightmap-96x64.png',
      0
    );

    // get image data
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.canvas.width = image.width;
    ctx.canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, image.width, image.height);

    // generate normals from height data
    const displacementScale = 10;
    const data = new Uint8Array(imgData.data.length);
    for (let z = 0; z < imgData.height; ++z) {
      for (let x = 0; x < imgData.width; ++x) {
        const off = (z * image.width + x) * 4;
        const h0 = imgData.data[off];
        const h1 = imgData.data[off + 4] || 0; // being lazy at edge
        const h2 = imgData.data[off + imgData.width * 4] || 0; // being lazy at edge
        const p0 = vec3.fromValues(x, (h0 * displacementScale) / 255, z);
        const p1 = vec3.fromValues(x + 1, (h1 * displacementScale) / 255, z);
        const p2 = vec3.fromValues(x, (h2 * displacementScale) / 255, z + 1);
        const v0 = vec3.normalize(p1, vec3.subtract(p1, p1, p0));
        const v1 = vec3.normalize(p2, vec3.subtract(p2, p2, p0));
        const normal = vec3.normalize(v0, vec3.cross(v0, v0, v1));
        data[off + 0] = (normal[0] * 0.5 + 0.5) * 255;
        data[off + 1] = (normal[1] * 0.5 + 0.5) * 255;
        data[off + 2] = (normal[2] * 0.5 + 0.5) * 255;
        data[off + 3] = h0;
      }
    }
    console.log(image);
    const texture = gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // Level (mipmap nivå)
      gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
      image.width, // Bredd
      image.height, // Höjd
      0, // Border (ska alltid vara 0)
      gl.RGBA, // Format
      gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
      data // Data från Uint8Array
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR_MIPMAP_LINEAR
    );

    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.loop();
  }

  loop() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(this.shader.program, 'uTexture'), 0);

    this.vao.bind();
    gl.drawElements(
      gl.TRIANGLES,
      this.vao.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0
    );
    this.vao.unbind();
  }
}
