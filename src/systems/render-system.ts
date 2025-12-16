import { Mesh } from 'src/components/mesh';
import { Ecs } from '../core/ecs';
import { Material } from 'src/components/material';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { Splatmap } from 'src/components/splatmap';
import { Skybox } from 'src/components/skybox';
import { mat4, vec3 } from 'gl-matrix';
import { AnimatedTexture } from 'src/components/animatedTexture';
import { Grass } from 'src/components/grass';
import { MeshRenderer } from 'src/renderer/mesh-renderer';
import { Transform3D } from 'src/components/transform3D';
import { Water } from 'src/components/water';
import { Terrain } from 'src/components/terrain';
import { Skeleton } from 'src/components/skeleton';
import { BatchRenderer } from 'src/renderer/batch-renderer';
import { MathUtils } from 'src/Utils/MathUtils';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { Vec } from 'src/app/vec';
import { Pivot } from 'src/components/pivot';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { BatchRenderable } from 'src/components/batch-renderable';
import { Light } from 'src/components/light';

export class RenderSystem {
  constructor(gl: WebGL2RenderingContext) {
    BatchRenderer.init(gl);
    //Same with renderer later!!! Now everything is rendered in the system, like it is a renderer...
  }

  createBatch(gl: WebGL2RenderingContext, mesh: MeshRenderer, amount: number) {
    mesh.shader.use();
    mesh.vao.bind();
    const buffer = gl.createBuffer();
    mesh.vao.vertexBuffer.buffer = buffer!;
    if (!mesh.vao.vertexBuffer.buffer) {
      console.error('Couldnt not create buffer!');
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vao.vertexBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(amount), gl.DYNAMIC_DRAW);
    const location = gl.getAttribLocation(
      mesh.shader.program,
      'a_instancePositions'
    );
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 4 * 4, 0);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribDivisor(location, 1); // ← per‑instans
    const idLocation = gl.getAttribLocation(
      mesh.shader.program,
      'a_instanceID'
    );
    gl.vertexAttribPointer(idLocation, 1, gl.FLOAT, false, 4 * 4, 3 * 4);
    gl.enableVertexAttribArray(idLocation);
    gl.vertexAttribDivisor(idLocation, 1);
    gl.useProgram(null);
    mesh.vao.unbind();
    return mesh;
  }

  drawBatch(ecs: Ecs, camera: PerspectiveCamera) {
    BatchRenderer.begin();
    for (const entity of ecs.getEntities()) {
      const transform3D = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      const batchRenderable = ecs.getComponent<BatchRenderable>(
        entity,
        'BatchRenderable'
      );

      if (batchRenderable && transform3D) {
        BatchRenderer.addQuads(
          batchRenderable.width,
          batchRenderable.height,
          0,
          new Vec(1, 1),
          0,
          0,
          batchRenderable.width,
          batchRenderable.height,
          0,
          0,
          batchRenderable.width,
          batchRenderable.height,
          transform3D.translate[0],
          transform3D.translate[1],
          transform3D.translate[2],
          batchRenderable.textureSlot
        );
      }

      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (skeleton && transform3D) {
        const bones = skeleton.bones.sort((a, b) => a.order - b.order);
        for (let i = 0; i < bones.length; i++) {
          const bone = bones[i];
          BatchRenderer.addQuads(
            skeleton.image.width,
            skeleton.image.height,
            MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2,
            bone.pivot,
            bone.startX,
            bone.startY,
            bone.endX,
            bone.endY,
            bone.position.x - bone.pivot.x - bone.endX / 2,
            -bone.position.y + bone.pivot.y,
            bone.endX,
            bone.endY,
            transform3D.translate[0],
            transform3D.translate[1],
            transform3D.translate[2],
            batchRenderable.textureSlot
          );
        }
      }
    }
    BatchRenderer.end(camera);
  }

  getLightSources(ecs: Ecs): Light | null {
    let light: Light | null = null;
    for (const entity of ecs.getEntities()) {
      light = ecs.getComponent<Light>(entity, 'Light');
      const transform3D = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      if (light && transform3D) {
        light.position = vec3.fromValues(
          transform3D.translate[0],
          transform3D.translate[1],
          transform3D.translate[2]
        );
        return light;
      }
    }
    return light;
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

    this.drawBatch(ecs, camera);

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
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      const material = ecs.getComponent<Material>(entity, 'Material');
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      const animatedTexture = ecs.getComponent<AnimatedTexture>(
        entity,
        'AnimatedTexture'
      );
      const water = ecs.getComponent<Water>(entity, 'Water');
      const terrain = ecs.getComponent<Terrain>(entity, 'Terrain');
      const pivot = ecs.getComponent<Pivot>(entity, 'Pivot');
      const transform3D = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      const light = this.getLightSources(ecs);

      if (pivot && transform3D) {
        gl.useProgram(ShaderManager.getShader('debug').program);
        // Skapa VBO
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pivot.vertices, gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pivot.colors, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(
          ShaderManager.getShader('debug').program,
          'a_position'
        );

        const aColorLoc = gl.getAttribLocation(
          ShaderManager.getShader('debug').program,
          'a_color'
        );

        // bind vertex
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        // // bind color
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColorLoc);

        const location = gl.getUniformLocation(
          ShaderManager.getShader('debug').program,
          'u_matrix'
        );
        gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());

        const model = gl.getUniformLocation(
          ShaderManager.getShader('debug').program,
          'u_model'
        );
        const modelMatrix = mat4.create();

        mat4.translate(modelMatrix, modelMatrix, pivot.position);
        mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
        mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
        gl.uniformMatrix4fv(model, false, modelMatrix);

        // Draw lines (2 punkter per linje)
        gl.drawArrays(gl.LINES, 0, 6); // 3 linjer * 2 punkter
      }

      if (mesh && material && splatmap) {
        gl.useProgram(material.shader.program);
        if (light) {
          console.log('found light!');
          material.shader.setVec3('u_lightPos', light.color);
          material.shader.setVec3('u_lightColor', light.color);
        }
        const texLocation = gl.getUniformLocation(
          material.shader.program,
          'u_texture'
        );
        gl.uniform1i(texLocation, TextureManager.getSlot('textureMap'));
        const splatmapLocation = gl.getUniformLocation(
          material.shader.program,
          'u_splatmap'
        );
        gl.uniform1i(splatmapLocation, splatmap.slot);
        if (terrain) {
          const tilingLocation = gl.getUniformLocation(
            material.shader.program,
            'u_tiling'
          );
          gl.uniform1f(tilingLocation, terrain.tiling);
          const fogLocation = gl.getUniformLocation(
            material.shader.program,
            'u_fogPower'
          );
          gl.uniform1f(fogLocation, terrain.fogPower);
        }
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
        gl.uniform1f(timeLocation, performance.now() * 0.01);
        const textureLocation = gl.getUniformLocation(
          material.shader.program,
          'u_texture'
        );
        gl.uniform1i(textureLocation, material.slot);
        gl.bindVertexArray(mesh.vao);
        const indexCountPerBlade = 6 * 5; // 30 om du har 5 quads
        const instanceCount = grass.positions.length / 4; // en xyz per strå + instance id
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, grass.positions);
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
        const timeLocation = gl.getUniformLocation(
          material.shader.program,
          'u_time'
        );
        gl.uniform1f(timeLocation, performance.now() * animatedTexture.speed);
        const transform3D = ecs.getComponent<Transform3D>(
          entity,
          'Transform3D'
        );
        if (transform3D) {
          const modelMatrix = mat4.create();
          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
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
          gl.uniform1f(scaleLocation, water.displacement);
          const tilingLocation = gl.getUniformLocation(
            material.shader.program,
            'u_tiling'
          );
          gl.uniform1f(tilingLocation, water.tiling);
        }
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0
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
          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
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
      } else if (mesh) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices);
      }
    }
  }
}
