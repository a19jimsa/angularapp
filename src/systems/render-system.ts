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
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';

export class RenderSystem {
  private camera: PerspectiveCamera;

  constructor(camera: PerspectiveCamera) {
    this.camera = camera;
    BatchRenderer.init();
  }

  private updateSplatmap(splatmap: Splatmap) {
    const gl = Renderer.getGL;
    gl.activeTexture(gl.TEXTURE0 + TextureManager.getSlot(splatmap.slot));
    gl.bindTexture(gl.TEXTURE_2D, TextureManager.getTexture(splatmap.slot));
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      splatmap.width,
      splatmap.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      splatmap.coords
    );
  }

  private drawBatch(ecs: Ecs) {
    BatchRenderer.begin();
    for (const entity of ecs.getEntities()) {
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      const transform3D = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      const batchRenderable = ecs.getComponent<BatchRenderable>(
        entity,
        'BatchRenderable'
      );

      if (splatmap) {
        this.updateSplatmap(splatmap);
      }

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
          transform3D.scale[0],
          transform3D.scale[1],
          TextureManager.getSlot(batchRenderable.texture)
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
            transform3D.scale[0],
            transform3D.scale[1],
            6
          );
        }
      }
    }
    BatchRenderer.end(this.camera);
  }

  private getLightSources(ecs: Ecs): Entity | null {
    let light: Entity | null = null;
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
    //Renderer.drawSkybox();
    Renderer.begin();
    this.drawBatch(ecs);
    const cameraMatrix = mat4.invert(
      mat4.create(),
      this.camera.getViewMatrix()
    );
    const cameraPos = vec3.fromValues(
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14]
    );
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
      let light = null;
      let lightPos = null;
      if (lightEntity) {
        light = ecs.getComponent<Light>(lightEntity, 'Light');
        lightPos = ecs.getComponent<Transform3D>(lightEntity, 'Transform3D');
      }

      if (pivot && transform3D) {
        const shader = ShaderManager.getShader('debug');
        shader.bind();
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix()
        );
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
        shader.setUniformMat4('u_model', modelMatrix);
        const vao = MeshManager.getMesh(mesh.meshId);
        if (!vao) continue;
        Renderer.drawLines(vao);
        shader.unbind();
      }
      if (mesh && material && splatmap) {
        const shader = ShaderManager.getShader('splatmap');
        shader.bind();
        if (light && lightPos) {
          shader.setVec3('light.position', lightPos.translate);
          shader.setVec3('light.ambient', light.ambient);
          shader.setVec3('light.diffuse', light.diffuse);
        }
        shader.setVec3('material.ambient', material.ambient);
        shader.setVec3('material.diffuse', material.diffuse);
        shader.setVec3('material.specular', material.specular);
        shader.setFloat('material.shininess', material.shininess);
        shader.setMaterialTexture('u_texture', 'texture');
        shader.setMaterialTexture('u_splatmap', 'splatmap');

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
        shader.setVec3('u_cameraPos', cameraPos);
        if (transform3D) {
          const modelMatrix = mat4.create();
          mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
          mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
          mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
          mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
          mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
          shader.setUniformMat4('u_model', modelMatrix);
        }
        //VAO comtains only vertexdata
        const vao = MeshManager.getMesh(mesh.meshId);
        if (!vao) continue;
        Renderer.drawIndexed(vao);
        shader.unbind();
      } else if (mesh && material && grass) {
        const shader = ShaderManager.getShader(mesh.meshId);
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix()
        );
        shader.setFloat('u_time', performance.now() * 0.001);
        shader.setMaterialTexture('u_texture', material.slot);
        Renderer.drawInstancing();
      } else if (mesh && material && animatedTexture) {
        const shader = ShaderManager.getShader(mesh.meshId);
        shader.bind();
        if (light && lightPos) {
          shader.setVec3('light.position', lightPos.translate);
          shader.setVec3('light.ambient', light.ambient);
          shader.setVec3('light.diffuse', light.diffuse);
        }
        shader.setVec3('material.ambient', material.ambient);
        shader.setVec3('material.diffuse', material.diffuse);
        shader.setVec3('material.specular', material.specular);
        shader.setFloat('material.shininess', material.shininess);
        shader.setMaterialTexture('u_texture', material.slot);

        if (terrain) {
          shader.setFloat('u_tiling', terrain.tiling);
          shader.setFloat('u_fogPower', terrain.fogPower);
        }
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix()
        );
        shader.setVec3('u_cameraPos', cameraPos);
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
        const vao = MeshManager.getMesh(mesh.meshId);
        if (!vao) continue;
        Renderer.drawIndexed(vao);
      } else if (mesh && transform3D) {
        const shader = ShaderManager.getShader('basic');
        shader.bind();
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
        mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
        mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
        shader.setUniformMat4('u_model', modelMatrix);
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix()
        );
        const vertexArray = MeshManager.getMesh('basic');
        if (!vertexArray) continue;
        Renderer.drawIndexed(vertexArray);
      }
    }
  }
}
