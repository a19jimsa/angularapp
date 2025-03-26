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
import { IndexBuffer, VertexBuffer } from 'src/renderer/buffer';
import { OrtographicCamera } from 'src/renderer/orthographic-camera';
import { Renderer } from 'src/renderer/renderer';
import { Shader } from 'src/renderer/shader';

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
  indexBuffer!: IndexBuffer;
  vertexBuffer!: VertexBuffer;

  //VAO
  vertexArray!: WebGLVertexArrayObject | null;

  vsSource = `
  attribute vec4 aPosition;
  uniform mat4 u_viewProjection;

  void main(void) {
    gl_Position = u_viewProjection * aPosition;
  }
`;

  // Fragment shader program

  fsSource = `

  void main(void) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

  constructor() {}

  ngAfterViewInit(): void {
    this.gl = this.canvas.nativeElement.getContext('webgl2')!;
    if (!this.gl) throw Error('Webgl2 not supported');
    console.log(this.gl);
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 600;
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.shader = new Shader(this.gl, this.vsSource, this.fsSource);
    this.camera = new OrtographicCamera(-0.5, 0.5, -0.5, 0.5);
    this.renderer = new Renderer(this.gl);
    if (!this.renderer) return;
    this.addEventListeners();
    this.loop();
  }

  addEventListeners() {
    document.addEventListener('keydown', (event) => {
      const speed = 10;
      console.log(event.code);
      switch (event.code) {
        case 'KeyW':
          this.camera.setPosition(-1, 0);
          break;
        case 'KeyS':
          this.camera.setPosition(0, 0);
          break;
        case 'KeyA':
          this.camera.setPosition(1, 0);
          break;
        case 'KeyD':
          this.camera.setPosition(2, 0);
          break;
        case 'ArrowUp':
          this.camera.setPosition(0, 0);
          break;
        case 'ArrowDown':
          this.camera.setPosition(0, 0);
          break;
      }
    });
  }

  addPlane(){
    
  }

  loop() {
    this.shader.use();
    const gl = this.gl;
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Skapa VertexBuffer och IndexBuffer en gång (bör göras en gång, inte varje loop)
    if (!this.vertexBuffer) {
      const vertices = new Float32Array([
        -0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.5, 0.0,
      ]);
      this.vertexBuffer = VertexBuffer.create(gl, vertices);
    }

    if (!this.indexBuffer) {
      const indices = new Uint16Array([0, 1, 2]);
      this.indexBuffer = IndexBuffer.create(gl, indices);
    }

    // Skapa och binda VAO en gång (bör göras en gång, inte varje loop)
    if (!this.vertexArray) {
      this.vertexArray = gl.createVertexArray();
      gl.bindVertexArray(this.vertexArray);

      // Binda VBO till VAO
      this.vertexBuffer.bind();
      // Här skulle du behöva definiera layouten för vertex attributet (t.ex. position)
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      //this.camera.setPosition(2, 1, 2);

      // Binda IBO till VAO
      this.indexBuffer.bind();
    }
    //Get locations in memory of uniform
    const location = gl.getUniformLocation(
      this.shader.program,
      'u_viewProjection'
    );
    //Change
    gl.uniformMatrix4fv(location, false, this.camera.getProjectionViewMatrix());

    console.log(this.camera.getProjectionViewMatrix());

    gl.drawElements(
      gl.TRIANGLES,
      this.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0
    );
    requestAnimationFrame(() => this.loop());
  }
}
