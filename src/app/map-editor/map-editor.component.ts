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
  camera!: OrtographicCamera;
  shader!: Shader;
  vao!: VertexArrayBuffer;
  texture!: Texture;

  vsSource = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  uniform mat4 u_viewProjection;

  varying vec2 vTexCoord;

  void main(void) {
    gl_Position = u_viewProjection * vec4(aPosition, 1.0);
    vTexCoord = aTexCoord;
  }
`;

  // Fragment shader program

  fsSource = `
    precision mediump float;

    varying vec2 vTexCoord;  // Texturkoordinater från vertexshadern
    uniform sampler2D uTexture;  // Texturen som vi samplar från

    void main(void) {
      // Sampla färgen från texturen vid de koordinater som skickas från vertexshadern
      gl_FragColor = texture2D(uTexture, vTexCoord);
  }
`;

  constructor() {
    this.camera = new OrtographicCamera(-1, 1, -1, 1);
  }

  ngAfterViewInit(): void {
    this.gl = this.canvas.nativeElement.getContext('webgl2')!;
    if (!this.gl) throw Error('Webgl2 not supported');
    console.log(this.gl);
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.shader = new Shader(this.gl, this.vsSource, this.fsSource);
    this.renderer = new Renderer(this.gl);
    this.texture = new Texture(this.gl);
    if (!this.renderer) return;
    this.addEventListeners();
    this.init();
    this.loop();
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      const speed = 10;
      console.log(event.code);
      switch (event.code) {
        case 'KeyW':
          this.camera.setPosition(0, 1);
          break;
        case 'KeyS':
          this.camera.setPosition(0, -1);
          break;
        case 'KeyA':
          break;
        case 'KeyD':
          break;
        case 'ArrowUp':
          break;
        case 'ArrowDown':
          break;
      }
      this.camera.recalculateViewMatrix();
      this.loop();
    });
  }

  init() {
    const gl = this.gl;
    const vertices = [-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 0, 1, 0, 0.5, 1];

    const indices = [0, 1, 2];
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

    this.texture.loadTexture('assets/textures/cubetexture.png');
    this.shader.use();
    setTimeout(() => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture.getTexture());

      const location = this.shader.getUniformLocation('uTexture');
      gl.uniform1i(location, 0);
      this.loop();
    }, 3000);
  }

  loop() {
    const gl = this.gl;
    const cameraLocation = gl.getUniformLocation(
      this.shader.program,
      'u_viewProjection'
    );
    gl.uniformMatrix4fv(
      cameraLocation,
      false,
      this.camera.getViewProjectionMatrix()
    );
    
    gl.clearColor(0.1, 0.1, 0.1, 1.0); // Svart bakgrund
    gl.clear(gl.COLOR_BUFFER_BIT); // Rensa skärmen

    this.vao.bind();
    gl.drawElements(
      gl.TRIANGLES,
      this.vao.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0
    );
    this.vao.unbind();
    requestAnimationFrame(() => this.loop());
  }
}
