import { Mesh } from 'src/components/mesh';
import { Ecs } from '../core/ecs';
import { Transform } from 'src/components/transform';
import { Material } from 'src/components/material';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { Splatmap } from 'src/components/splatmap';
import { Skybox } from 'src/components/skybox';
import { mat4, vec3 } from 'gl-matrix';
import { AnimatedTexture } from 'src/components/animatedTexture';
import { Grass } from 'src/components/grass';
import { Tree } from 'src/components/tree';
import { MeshRenderer } from 'src/renderer/mesh-renderer';
import { Transform3D } from 'src/components/transform3D';
import { Water } from 'src/components/water';

export class RenderSystem {
  createBatch(gl: WebGL2RenderingContext, mesh: MeshRenderer, amount: number) {
    mesh.shader.use();
    mesh.vao.bind();
    const buffer = gl.createBuffer();
    mesh.vao.vertexBuffer.buffer = buffer!;
    if (!mesh.vao.vertexBuffer.buffer) {
      console.error('Coudn not create buffer!');
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vao.vertexBuffer.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(amount * 3),
      gl.DYNAMIC_DRAW
    );
    const location = gl.getAttribLocation(
      mesh.shader.program,
      'a_instancePositions'
    );
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribDivisor(location, 1); // ← per‑instans
    gl.useProgram(null);
    mesh.vao.unbind();
    return mesh;
  }

  update(ecs: Ecs, gl: WebGL2RenderingContext, camera: PerspectiveCamera) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 0); // Viktigt! Gör hela canvasen transparent
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const entity of ecs.getEntities()) {
      const skybox = ecs.getComponent<Skybox>(entity, 'Skybox');
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
        gl.colorMask(true, true, true, true);
        break;
      }
    }

    for (const entity of ecs.getEntities()) {
      //Use transform for later... not very matrixfriendly yet or maybe with 2 vectors? What do I kn´pw??
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      const material = ecs.getComponent<Material>(entity, 'Material');
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      const tree = ecs.getComponent<Tree>(entity, 'Tree');
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      const skybox = ecs.getComponent<Skybox>(entity, 'Skybox');
      const animatedTexture = ecs.getComponent<AnimatedTexture>(
        entity,
        'AnimatedTexture'
      );
      const water = ecs.getComponent<Water>(entity, 'Water');

      if (mesh && material && splatmap) {
        gl.useProgram(material.shader.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);
        const texLocation = gl.getUniformLocation(
          material.shader.program,
          'u_texture'
        );
        gl.uniform1i(texLocation, 0);
        gl.activeTexture(gl.TEXTURE0 + splatmap.slot);
        gl.bindTexture(gl.TEXTURE_2D, splatmap.texture);
        const splatmapLocation = gl.getUniformLocation(
          material.shader.program,
          'u_splatmap'
        );
        gl.uniform1i(splatmapLocation, splatmap.slot);
        const location = gl.getUniformLocation(
          material.shader.program,
          'u_matrix'
        );
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        const timeLocation = gl.getUniformLocation(
          material.shader.program,
          'u_time'
        );
        gl.uniform1f(timeLocation, performance.now() * 0.001);
        const viewLocation = gl.getUniformLocation(
          material.shader.program,
          'u_view'
        );
        gl.uniformMatrix4fv(viewLocation, false, camera.getViewMatrix());
        gl.bindVertexArray(mesh.vao);
        const cameraLocation = gl.getUniformLocation(
          material.shader.program,
          'u_cameraPos'
        );
        const cameraMatrix = mat4.invert(mat4.create(), camera.getViewMatrix());
        const cameraPos = vec3.fromValues(
          cameraMatrix[12],
          cameraMatrix[13],
          cameraMatrix[14]
        );
        gl.uniform3fv(cameraLocation, cameraPos);
        const transform3D = ecs.getComponent<Transform3D>(
          entity,
          'Transform3D'
        );
        if (transform3D) {
          const model = gl.getUniformLocation(
            material.shader.program,
            'u_model'
          );
          const modelMatrix = mat4.create();

          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
          gl.uniformMatrix4fv(model, false, modelMatrix);
          gl.drawElements(
            gl.TRIANGLES,
            mesh.indices.length,
            gl.UNSIGNED_SHORT,
            0
          );
        }
        gl.bindVertexArray(null);
      } else if (mesh && material && grass) {
        gl.useProgram(material.shader.program);
        const location = gl.getUniformLocation(
          material.shader.program,
          'u_matrix'
        );
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        const timeLocation = gl.getUniformLocation(
          material.shader.program,
          'u_time'
        );
        gl.uniform1f(timeLocation, performance.now() * 0.001);
        gl.bindVertexArray(mesh.vao);
        const indexCountPerBlade = 6 * 5; // 30 om du har 5 quads
        const instanceCount = grass.positions.length / 3; // en xyz per strå
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(grass.positions));
        gl.drawElementsInstanced(
          gl.TRIANGLES,
          indexCountPerBlade, // hur många index beskriver ETT strå
          gl.UNSIGNED_SHORT, // typ i index‑buffern
          0, // byte‑offset i index‑buffern
          instanceCount
        );
        gl.bindVertexArray(null);
      } else if (mesh && material && animatedTexture) {
        gl.useProgram(material.shader.program);
        const location = gl.getUniformLocation(
          material.shader.program,
          'u_matrix'
        );
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        const textureLocation = gl.getUniformLocation(
          material.shader.program,
          'u_texture'
        );
        gl.uniform1i(textureLocation, material.slot);
        gl.activeTexture(gl.TEXTURE0 + material.slot);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);
        const timeLocation = gl.getUniformLocation(
          material.shader.program,
          'u_time'
        );
        gl.uniform1f(timeLocation, performance.now() * 0.001);
        const transform3D = ecs.getComponent<Transform3D>(
          entity,
          'Transform3D'
        );
        if (transform3D) {
          const modelMatrix = mat4.create();
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          const uModelLocation = gl.getUniformLocation(
            material.shader.program,
            'u_model'
          );
          gl.uniformMatrix4fv(uModelLocation, false, modelMatrix);
        }
        if (water) {
          const scaleLocation = gl.getUniformLocation(
            material.shader.program,
            'u_displacmentScale'
          );
          gl.uniform1f(scaleLocation, water.scale);
        }
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
        gl.bindVertexArray(null);
      } else if (mesh && material && tree) {
        gl.useProgram(material.shader.program);
        const location = gl.getUniformLocation(
          material.shader.program,
          'u_matrix'
        );
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
        const textureLocation = gl.getUniformLocation(
          material.shader.program,
          'u_texture'
        );
        gl.uniform1i(textureLocation, material.slot);
        gl.activeTexture(gl.TEXTURE0 + material.slot);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);
        const timeLocation = gl.getUniformLocation(
          material.shader.program,
          'u_time'
        );
        const viewLocation = gl.getUniformLocation(
          material.shader.program,
          'u_view'
        );
        gl.uniformMatrix4fv(viewLocation, false, camera.getViewMatrix());
        gl.uniform1f(timeLocation, performance.now() * 0.001);
        gl.bindVertexArray(mesh.vao);
        const instanceCount = tree.positions.length / 3; // en xyz per träd
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(tree.positions));
        gl.drawElementsInstanced(
          gl.TRIANGLES,
          6,
          gl.UNSIGNED_SHORT,
          0,
          instanceCount
        );
        gl.bindVertexArray(null);
      } else if (mesh && material) {
        gl.useProgram(material.shader.program);
        const location = gl.getUniformLocation(
          material.shader.program,
          'u_matrix'
        );
        const transform3D = ecs.getComponent<Transform3D>(
          entity,
          'Transform3D'
        );
        if (transform3D) {
          const modelMatrix = mat4.create();
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          const uModelLocation = gl.getUniformLocation(
            material.shader.program,
            'u_model'
          );
          gl.uniformMatrix4fv(uModelLocation, false, modelMatrix);
        }

        if (material.texture !== null) {
          const textureLocation = gl.getUniformLocation(
            material.shader.program,
            'u_texture'
          );
          gl.uniform1i(textureLocation, material.slot);
          gl.activeTexture(gl.TEXTURE0 + material.slot);
          gl.bindTexture(gl.TEXTURE_2D, material.texture);
        }
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
    }
  }
}
