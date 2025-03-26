import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

@Component({
    selector: 'app-webgl-particles',
    templateUrl: './webgl-particles.component.html',
    styleUrls: ['./webgl-particles.component.css'],
    standalone: false
})
export class WebglParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  particlePositions = new Array();
  particleVelocity = new Array();
  positionAttributeLocation: any;
  colorAttributeLocation: any;
  particlePositionBuffer: any;
  program: any;
  gl: any;
  previous: number = window.performance.now();
  lag: number = 0.0;
  windowId: number = 0;

  constructor() {}

  ngAfterViewInit(): void {
    this.gl = this.canvas.nativeElement.getContext('webgl2');
    this.initWebGL();
    this.draw();
  }

  ngOnDestroy(): void {
    window.cancelAnimationFrame(this.windowId);
  }

  initWebGL(): void {
    // Hämta canvas-elementet
    if (!this.gl) {
      console.error('WebGL is not supported.');
      return;
    }

    // Skapa vertex- och fragmentshaderkällkod
    var vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;

    void main() {
      gl_Position = vec4(a_position, 1.0);
      v_color = a_color;
      gl_PointSize = 2.0;
    }
  `;

    var fragmentShaderSource = `
    precision mediump float;

    varying vec3 v_color;

    void main() {
      gl_FragColor = vec4(v_color, 1.0);
    }
  `;

    var vertexShader = this.createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    var fragmentShader = this.createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    this.program = this.createProgram(vertexShader, fragmentShader);

    const numParticles = 1000000;
    for (var i = 0; i < numParticles; i += 2) {
      this.particlePositions[i] = this.getRandomFloat(-1, 1);
      this.particlePositions[i + 1] = this.getRandomFloat(-1, 1);
    }
    for (var i = 0; i < this.particlePositions.length; i++) {
      this.particleVelocity[i] = this.getRandomFloat(-1, 1);
    }

    var colors = [];
    for (var i = 0; i < numParticles * 3; i++) {
      colors.push(this.getRandomFloat(0, 1));
    }

    this.particlePositionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particlePositionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.particlePositions),
      this.gl.STATIC_DRAW
    );

    var particleVelocityBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, particleVelocityBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.particleVelocity),
      this.gl.STATIC_DRAW
    );

    var colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(colors),
      this.gl.STATIC_DRAW
    );

    // Konfigurera vertexattributerna
    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      'a_position'
    );
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particlePositionBuffer);
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.vertexAttribDivisor(this.positionAttributeLocation, 1);

    this.colorAttributeLocation = this.gl.getAttribLocation(
      this.program,
      'a_color'
    );
    this.gl.enableVertexAttribArray(this.colorAttributeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    this.gl.vertexAttribPointer(
      this.colorAttributeLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.vertexAttribDivisor(this.colorAttributeLocation, 1);
  }

  update() {
    for (let i = 0; i < this.particlePositions.length; i += 2) {
      let dx = 0,
        dy = 0,
        dist = 0;
      dx = -this.particlePositions[i];
      dy = -this.particlePositions[i + 1];
      dist = Math.sqrt(dx * dx + dy * dy);
      this.particleVelocity[i] += dx / dist; // Gravitational force
      this.particleVelocity[i + 1] += dy / dist;
      this.particlePositions[i] += this.particleVelocity[i] * 0.00001; // Euler integration
      this.particlePositions[i + 1] += this.particleVelocity[i + 1] * 0.0001;
    }
  }

  draw() {
    const UPDATE_PER_MS = 1000 / 60;
    const current = performance.now();
    const elapsed = current - this.previous;
    this.previous = current;
    this.lag += elapsed;
    while (this.lag >= UPDATE_PER_MS) {
      this.update();
      this.lag -= UPDATE_PER_MS;
    }

    if (this.gl == null) {
      return;
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particlePositionBuffer);
    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      new Float32Array(this.particlePositions)
    );
    console.log(Math.floor(performance.now() / 1000));
    // Använd shadersprogrammet
    this.gl.useProgram(this.program);

    this.resizeCanvasToDisplaySize(this.gl.canvas);
    // Rensa canvasen och rita partiklarna
    this.gl.viewport(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArraysInstanced(
      this.gl.POINTS,
      0,
      1,
      this.particlePositions.length / 2
    );
    this.windowId = window.requestAnimationFrame(() => this.draw());
  }

  createProgram(vertexShader: any, fragmentShader: any) {
    var program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(
        'Program linking error:',
        this.gl.getProgramInfoLog(program)
      );
      return null;
    }
    return program;
  }

  getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  resizeCanvasToDisplaySize(canvas: any) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize =
      canvas.width !== displayWidth || canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }

  // Kompilera och länka shaders
  createShader(gl: any, type: any, source: any) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
}
