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

  vsSource = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;

  uniform sampler2D uTexture;
  uniform mat4 u_viewProjection;

  varying vec2 vTexCoord;

  void main(void) {
    float displacementScale = 30.0;
    float displacement = texture2D(uTexture, aTexCoord).r * displacementScale;
    vec4 displacedPosition = aPosition + vec4(0, displacement, 0, 0);
    gl_Position = u_viewProjection * displacedPosition;
    vTexCoord = aTexCoord;
  }
`;

  // Fragment shader program

  fsSource = `
    precision highp float;

    varying vec2 vTexCoord;
    uniform sampler2D uTexture;

    void main(){
      float displacementScale = 10.0;
    
      vec3 data = texture2D(uTexture, vTexCoord).rgb;
      vec3 normal = data * 2. - 1.;
    
      vec3 lightDir = normalize(vec3(1, -3, 2));
      float light = dot(lightDir, normal);
      vec3 color = vec3(0.3, 1, 0.1);
    
      gl_FragColor = vec4(color * (light * 0.5 + 0.5), 1.0);
    
    }
`;

  constructor() {
    this.camera = new PerspectiveCamera();
  }

  ngAfterViewInit(): void {
    this.gl = this.canvas.nativeElement.getContext('webgl2')!;
    if (!this.gl) throw Error('Webgl2 not supported');
    console.log(this.gl);
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.gl.canvas.width = 800;
    this.gl.canvas.height = 600;
    this.shader = new Shader(this.gl, this.vsSource, this.fsSource);
    this.renderer = new Renderer(this.gl);
    this.texture = new Texture(this.gl);
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
          break;
        case 'KeyS':
          break;
        case 'KeyA':
          this.camera.updatePosition(1, 0, 0);
          break;
        case 'KeyD':
          this.camera.updatePosition(0, 0, -1);
          break;
        case 'ArrowUp':
          this.camera.rotate(0.1);
          break;
        case 'ArrowDown':
          this.camera.rotate(-0.1);
          break;
      }
      this.loop();
    });
  }

  init() {
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
        let topLeft = y * (64 + 1) + x;
        let topRight = topLeft + 1;
        let bottomLeft = topLeft + (96 + 1);
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

    this.texture.loadTexture('assets/textures/map.jpg');
    this.shader.use();
    setTimeout(() => {
      this.loop();
    }, 1000);
  }

  loop() {
    const gl = this.gl;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
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
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture.getTexture());
    const location = this.shader.getUniformLocation('uTexture');
    gl.uniform1i(location, 0);

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
