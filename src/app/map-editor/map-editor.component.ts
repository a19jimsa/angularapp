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

  vsSource = `
  attribute vec3 aPosition;

  uniform mat4 u_viewProjection;

  void main(void) {
    gl_Position = u_viewProjection * vec4(aPosition, 1.0);
  }
`;

  // Fragment shader program

  fsSource = `

  void main(void) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
    if (!this.renderer) return;
    this.addEventListeners();
    this.addPlane();
    this.loop();
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
          break;
        case 'KeyD':
          break;
        case 'ArrowUp':
          break;
        case 'ArrowDown':
          break;
      }
      this.camera.recalculateViewMatrix();
    });
  }

  addPlane() {
    const gl = this.gl;
    const vertices = [-0.5, -0.5, 0.0, 0.5, -0.5, 0];

    const indices = [0, 1, 2];
    this.vao = VertexArrayBuffer.create(
      gl,
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
  }

  loop() {
    const gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Svart bakgrund
    gl.clear(gl.COLOR_BUFFER_BIT); // Rensa skärmen
    this.shader.use();

    // Koppla attributen
    const posAttrib = gl.getAttribLocation(this.shader.program, 'aPosition');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    const cameraLocation = gl.getUniformLocation(
      this.shader.program,
      'u_viewProjection'
    );

    gl.uniformMatrix4fv(
      cameraLocation,
      false,
      this.camera.getViewProjectionMatrix()
    );

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
