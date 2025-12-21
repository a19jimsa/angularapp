import { Mesh } from 'src/components/mesh';
import { Ecs } from '../core/ecs';
import { Material } from 'src/components/material';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { Splatmap } from 'src/components/splatmap';
import { mat4, vec3 } from 'gl-matrix';
import { AnimatedTexture } from 'src/components/animatedTexture';
import { Transform3D } from 'src/components/transform3D';
import { Water } from 'src/components/water';
import { Terrain } from 'src/components/terrain';
import { Skeleton } from 'src/components/skeleton';
import { BatchRenderer } from 'src/renderer/batch-renderer';
import { MathUtils } from 'src/Utils/MathUtils';
import { Vec } from 'src/app/vec';
import { Pivot } from 'src/components/pivot';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { BatchRenderable } from 'src/components/batch-renderable';
import { Light } from 'src/components/light';
import { Entity } from 'src/app/entity';
import { Renderer } from 'src/renderer/renderer';
import { Grass } from 'src/components/grass';
import { VertexArray } from 'src/renderer/vertex-array';

export class RenderSystem {
  private camera: PerspectiveCamera;

  constructor(camera: PerspectiveCamera) {
    this.camera = camera;
    BatchRenderer.init();
  }

  private drawBatch(ecs: Ecs) {
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
    BatchRenderer.end(this.camera);
  }

  private getLightSources(ecs: Ecs): Entity {
    let light: Entity | null = -1;
    for (const entity of ecs.getEntities()) {
      light = ecs.getComponent<Light>(entity, 'Light');
      const transform3D = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      if (light && transform3D) {
        return entity;
      }
    }
    return light;
  }

  public update(ecs: Ecs) {
    this.drawBatch(ecs);

    // for (const entity of ecs.getEntities()) {
    //   const skybox = ecs.getComponent<Skybox>(entity, 'Skybox');
    //   if (skybox) {
    //     gl.depthMask(false);
    //     gl.depthFunc(gl.LEQUAL);
    //     gl.useProgram(skybox.shader.program);
    //     gl.bindVertexArray(skybox.vao.vao);
    //     const matrix = mat4.create();
    //     mat4.copy(matrix, this.camera.getViewMatrix());
    //     matrix[12] = 0;
    //     matrix[13] = 0;
    //     matrix[14] = 0;
    //     const perspectiveMatrix = mat4.create();
    //     mat4.multiply(
    //       perspectiveMatrix,
    //       this.camera.getProjectionMatrix(),
    //       matrix
    //     );
    //     skybox.shader.uploadUniformMat4('u_matrix', perspectiveMatrix);
    //     const textureLocation = gl.getUniformLocation(
    //       skybox.shader.program,
    //       'u_texture'
    //     );
    //     gl.uniform1i(textureLocation, 0);
    //     gl.activeTexture(gl.TEXTURE0);
    //     gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.texture);
    //     gl.drawArrays(gl.TRIANGLES, 0, 36);
    //     gl.bindVertexArray(null);
    //     gl.depthMask(true);
    //     gl.depthFunc(gl.LESS);
    //     gl.colorMask(true, true, true, true);
    //     break;
    //   }
    // }

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
      const lightEntity = this.getLightSources(ecs);
      const light = ecs.getComponent<Light>(lightEntity, 'Light');
      const lightPos = ecs.getComponent<Transform3D>(
        lightEntity,
        'Transform3D'
      );

      if (pivot && transform3D && material) {
        ShaderManager.getShader(material.shader).bind();
        // Skapa VBO gärna nåpgon annan stans

        // const vertexBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, pivot.vertices, gl.STATIC_DRAW);

        // const colorBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, pivot.colors, gl.STATIC_DRAW);

        // const positionLoc = gl.getAttribLocation(
        //   ShaderManager.getShader('debug').program,
        //   'a_position'
        // );

        // const aColorLoc = gl.getAttribLocation(
        //   ShaderManager.getShader('debug').program,
        //   'a_color'
        // );

        // // bind vertex
        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(positionLoc);

        // // // bind color
        // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(aColorLoc);

        // const location = gl.getUniformLocation(
        //   ShaderManager.getShader('debug').program,
        //   'u_matrix'
        // );
        // gl.uniformMatrix4fv(
        //   location,
        //   false,
        //   this.camera.getViewProjectionMatrix()
        // );

        // const model = gl.getUniformLocation(
        //   ShaderManager.getShader('debug').program,
        //   'u_model'
        // );
        //   const modelMatrix = mat4.create();

        //   mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
        //   mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
        //   mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
        //   mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
        //   mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
        //   gl.uniformMatrix4fv(model, false, modelMatrix);

        //   // Draw lines (2 punkter per linje)
        //   gl.drawArrays(gl.LINES, 0, 6); // 3 linjer * 2 punkter
        // }

        if (mesh && material && splatmap) {
          ShaderManager.getShader(material.shader).bind();
          const shader = ShaderManager.getShader(material.shader);

          if (light && lightPos) {
            shader.setVec3('light.position', lightPos.translate);
            shader.setVec3('light.ambient', light.ambient);
            shader.setVec3('light.diffuse', light.diffuse);
          }

          shader.setVec3('material.ambient', material.ambient);
          shader.setVec3('material.diffuse', material.diffuse);
          shader.setVec3('material.specular', material.specular);
          shader.setFloat('material.shininess', material.shininess);
          shader.setMaterialTexture('u_splatmap', material.slot);

          if (terrain) {
            shader.setFloat('u_tiling', terrain.tiling);
            shader.setFloat('u_fogPower', terrain.fogPower);
          }
          shader.setUniformMat4(
            'u_matrix',
            this.camera.getViewProjectionMatrix()
          );
          shader.setFloat('u_time', performance.now() * 0.001);
          shader.setUniformMat4('u_view', this.camera.getViewMatrix());
          const cameraMatrix = mat4.invert(
            mat4.create(),
            this.camera.getViewMatrix()
          );
          const cameraPos = vec3.fromValues(
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14]
          );
          shader.setVec3('u_cameraPos', cameraPos);

          if (transform3D) {
            const modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
            mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
            mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
            mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
            mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
            shader.setUniformMat4('u_model', modelMatrix);

            //Renderer.drawIndexed(mesh.meshId);
          }
        } else if (mesh && material && grass) {
          const shader = ShaderManager.getShader(material.shader);
          shader.setUniformMat4(
            'u_matrix',
            this.camera.getViewProjectionMatrix()
          );
          shader.setFloat('u_time', performance.now() * 0.001);
          shader.setMaterialTexture('u_texture', material.slot);
          Renderer.drawInstancing();
        } else if (mesh && material && animatedTexture) {
          const shader = ShaderManager.getShader(material.shader);

          shader.setUniformMat4(
            'u_matrix',
            this.camera.getViewProjectionMatrix()
          );
          shader.setMaterialTexture('u_texture', material.slot);
          shader.setFloat('u_time', performance.now() * animatedTexture.speed);
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
            shader.setUniformMat4('u_model', modelMatrix);
          }
          if (water) {
            shader.setFloat('u_displacmentScale', water.displacement);
            shader.setFloat('u_tiling', water.tiling);
          }
          //Renderer.drawIndexed(mesh.id);
        }
        if (transform3D) {
          const shader = ShaderManager.getShader(material.shader);
          const modelMatrix = mat4.create();
          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
          shader.setUniformMat4('u_model', modelMatrix);
        }
        //Renderer.drawIndexed();
      }
    }
  }
}
