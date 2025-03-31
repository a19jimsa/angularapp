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
  texture1!: Texture;
  texture2!: Texture;
  texture3!: Texture;
  texture4!: Texture;
  texture5!: Texture;

  vsSource = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;

  uniform sampler2D uTexture;
  uniform mat4 u_viewProjection;

  varying vec2 vTexCoord;

  void main(void) {
    float displacementScale = 1.0;
    float displacement = texture2D(uTexture, aTexCoord).a * displacementScale;
    vec4 displacedPosition = aPosition + vec4(0, displacement, 0, 0);
    gl_Position = u_viewProjection * displacedPosition;
    vTexCoord = aTexCoord;
  }
`;

  // Fragment shader program
  fsSource = `
    precision highp float;
    
    uniform sampler2D uSplatMap;
    uniform sampler2D uGround;
    uniform sampler2D uGrass;
    uniform sampler2D uMountain;

    varying vec2 vTexCoord;

    void main(){

      vec4 splatColor = texture2D(uSplatMap, vTexCoord);
      
      vec4 grass = texture2D(uGrass, vTexCoord);
      vec4 rock = texture2D(uMountain, vTexCoord);
      vec4 path = texture2D(uGround, vTexCoord);

      vec4 finalColor = splatColor.r * path + 
                        splatColor.g * grass + 
                        splatColor.b * rock;

      gl_FragColor = finalColor;
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
          this.camera.rotateY(1);
          break;
        case 'KeyD':
          this.camera.rotateY(-1);
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

    const image1 = await this.texture1.loadTexture(
      'assets/textures/heightmap-96x64.png'
    );

    const image2 = await this.texture2.loadTexture(
      'assets/textures/dirt_04.png'
    );

    const image3 = await this.texture3.loadTexture(
      'assets/textures/grass_01.png'
    );

    const image4 = await this.texture4.loadTexture(
      'assets/textures/mountain.png'
    );

    const image5 = await this.texture5.loadTexture(
      'assets/textures/splatmap.png'
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
      gl.getUniformLocation(this.shader.program, 'uGround'),
      this.texture2.getSlot()
    );
    gl.uniform1i(
      gl.getUniformLocation(this.shader.program, 'uGrass'),
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
