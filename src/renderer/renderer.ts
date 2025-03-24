import { Shader } from './shader';
import { Texture } from './texture';

export class Renderer {
  vertexShaderSource = `
    attribute vec2 position;
    attribute vec2 texCoord;  // För att ta emot texturkoordinater från vertexdata
    varying vec2 texCoords;   // Passa texturkoordinater till fragment shader

    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        texCoords = texCoord;  // Passa texturkoordinaterna vidare
    }
`;

  fragmentShaderSource = `
    precision mediump float;
    varying vec2 texCoords;  // Ta emot texturkoordinater från vertex shadern
    uniform sampler2D uTexture;  // Uniform för texturen

    void main() {
        vec4 texColor = texture2D(uTexture, texCoords);  // Använd texturkoordinaterna
        gl_FragColor = texColor * vec4(1.0, 0.0, 0.0, 1.0); // Röd färgfilter
    }
`;

  createOrthographicMatrix(
    left: number,
    right: number,
    bottom: number,
    top: number
  ) {
    return new Float32Array([
      2 / (right - left),
      0,
      0,
      0,
      0,
      2 / (top - bottom),
      0,
      0,
      0,
      0,
      -1,
      0,
      -(right + left) / (right - left),
      -(top + bottom) / (top - bottom),
      0,
      1,
    ]);
  }

  createPerspectiveMatrix(
    fov: number,
    aspect: number,
    near: number,
    far: number
  ) {
    const f = 1.0 / Math.tan(fov / 2);
    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) / (near - far),
      -1,
      0,
      0,
      (2 * far * near) / (near - far),
      0,
    ]);
  }

  drawTriangle(gl: WebGL2RenderingContext) {
    const shader = new Shader(
      gl,
      this.vertexShaderSource,
      this.fragmentShaderSource
    );
    shader.use();
    1;
    const texture = new Texture(gl, 'assets/textures/ground.jpg');

    setTimeout(() => {
      // Skapa ett VBO (Vertex Buffer Object) för position och texCoord
      const vertices = new Float32Array([
        // positions       // texCoords
        0.5,
        0.5,
        1.0,
        1.0, // top right
        0.5,
        -0.5,
        1.0,
        0.0, // bottom right
        -0.5,
        -0.5,
        0.0,
        0.0, // bottom left
        -0.5,
        0.5,
        0.0,
        1.0, // top left
      ]);

      const indices = new Uint16Array([
        0,
        1,
        3, // first triangle
        1,
        2,
        3, // second triangle
      ]);

      // Create buffers
      const VAO = gl.createVertexArray();
      gl.bindVertexArray(VAO);

      // Position buffer (VBO)
      const VBO = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      // Element buffer (EBO)
      const EBO = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      // Hämta uniform-lokationen för texturen i shadern
      const uTextureLocation = gl.getUniformLocation(
        shader.program,
        'uTexture'
      );
      gl.uniform1i(uTextureLocation, 0); // Bind texturen till texture unit 0

      // Sätt upp attributen för position och texCoord
      const positionLocation = gl.getAttribLocation(shader.program, 'position');
      const texCoordLocation = gl.getAttribLocation(shader.program, 'texCoord');

      // Bind data till VBO och EBO (Element Buffer Object)
      gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      // Ange hur position och texCoord ska tolkas
      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(
        texCoordLocation,
        2,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
      );
      gl.enableVertexAttribArray(texCoordLocation);

      // Bind EBO och rita
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      console.log('Draw!!');
    }, 500);
  }
}
