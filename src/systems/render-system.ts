import { Mesh } from 'src/components/mesh';
import { Ecs } from '../core/ecs';
import { Transform } from 'src/components/transform';
import { Material } from 'src/components/material';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { Splatmap } from 'src/components/splatmap';
import { Skybox } from 'src/components/skybox';
import { mat4 } from 'gl-matrix';
import { AnimatedTexture } from 'src/components/animatedTexture';
import { Grass } from 'src/components/grass';

export class RenderSystem {
  update(ecs: Ecs, gl: WebGL2RenderingContext, camera: PerspectiveCamera) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    for (const entity of ecs.getEntities()) {
      //Use transform for later... not very matrixfriendly yet or maybe with 2 vectors? What do I kn´pw??
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      const material = ecs.getComponent<Material>(entity, 'Material');
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      const skybox = ecs.getComponent<Skybox>(entity, 'Skybox');
      const animatedTexture = ecs.getComponent<AnimatedTexture>(
        entity,
        'AnimatedTexture'
      );

      if (mesh && material && splatmap) {
        gl.useProgram(material.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);
        const texLocation = gl.getUniformLocation(
          material.program,
          'u_texture'
        );
        gl.uniform1i(texLocation, 0);
        gl.activeTexture(gl.TEXTURE0 + splatmap.slot);
        gl.bindTexture(gl.TEXTURE_2D, splatmap.texture);
        const splatmapLocation = gl.getUniformLocation(
          material.program,
          'u_splatmap'
        );
        gl.uniform1i(splatmapLocation, splatmap.slot);
        const location = gl.getUniformLocation(material.program, 'u_matrix');
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());

        gl.bindVertexArray(mesh.vao);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
        gl.bindVertexArray(null);
      } else if (mesh && material && grass) {
        gl.useProgram(material.program);
        const location = gl.getUniformLocation(material.program, 'u_matrix');
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        const textureLocation = gl.getUniformLocation(
          material.program,
          'u_texture'
        );
        gl.uniform1i(textureLocation, material.slot);
        gl.activeTexture(gl.TEXTURE0 + material.slot);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);
        const timeLocation = gl.getUniformLocation(material.program, 'u_time');
        gl.uniform1f(timeLocation, performance.now() * 0.001);
        gl.bindVertexArray(mesh.vao);
        const indexCountPerBlade = 6 * 5; // 30 om du har 5 quads
        const instanceCount = grass.positions.length / 3; // en xyz per strå

        gl.bindBuffer(gl.ARRAY_BUFFER, grass.buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(grass.positions),
          gl.STATIC_DRAW
        );

        gl.drawElementsInstanced(
          gl.TRIANGLES,
          indexCountPerBlade, // hur många index beskriver ETT strå
          gl.UNSIGNED_SHORT, // typ i index‑buffern
          0, // byte‑offset i index‑buffern
          instanceCount
        );
        gl.bindVertexArray(null);
      } else if (mesh && material && animatedTexture) {
        gl.useProgram(material.program);
        const location = gl.getUniformLocation(material.program, 'u_matrix');
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        const textureLocation = gl.getUniformLocation(
          material.program,
          'u_texture'
        );
        gl.uniform1i(textureLocation, material.slot);
        gl.activeTexture(gl.TEXTURE0 + material.slot);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);
        const timeLocation = gl.getUniformLocation(material.program, 'u_time');
        gl.uniform1f(timeLocation, performance.now() * 0.001);
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
        gl.bindVertexArray(null);
      } else if (mesh && material) {
        gl.useProgram(material.program);
        const location = gl.getUniformLocation(material.program, 'u_matrix');
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
        gl.bindVertexArray(null);
      }

      if (skybox) {
        gl.depthMask(false);
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(skybox.shader.program);
        gl.bindVertexArray(skybox.vao.vao);
        const matrix = mat4.create();
        mat4.copy(matrix, camera.getViewMatrix());
        matrix[12] = 0;
        matrix[13] = 0;
        matrix[14] = 0;
        const perspectiveMatrix = mat4.create();
        mat4.multiply(perspectiveMatrix, camera.getProjectionMatrix(), matrix);
        skybox.shader.uploadUniformMat4('u_matrix', perspectiveMatrix);
        const textureLocation = gl.getUniformLocation(
          skybox.shader.program,
          'u_texture'
        );
        gl.uniform1i(textureLocation, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.texture);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.bindVertexArray(null);
        gl.depthMask(true);
        gl.depthFunc(gl.LESS);
      }
    }
  }
}
