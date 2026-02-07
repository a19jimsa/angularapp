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
import { FlowMap } from 'src/components/flow-map';
import { Loader } from 'src/app/loader';

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
        'BatchRenderable',
      );

      if (batchRenderable && transform3D) {
        BatchRenderer.addQuads(
          100,
          100,
          0,
          new Vec(1, 1),
          0,
          0,
          100,
          100,
          transform3D.translate[0],
          transform3D.translate[1],
          transform3D.translate[2],
          100,
          100,
          TextureManager.getSlot(batchRenderable.slot),
        );
      }

      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (skeleton && transform3D) {
        const bones = Loader.getBones('frogman');
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
            bone.position.y + bone.pivot.y,
            0,
            bone.endX,
            bone.endY,
            0,
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
    Renderer.begin();
    Renderer.drawSkybox();
    this.drawBatch(ecs);
    const cameraMatrix = mat4.invert(
      mat4.create(),
      this.camera.getViewMatrix(),
    );
    const cameraPos = vec3.fromValues(
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    );
    for (const entity of ecs.getEntities()) {
      //Use transform for later... not very matrixfriendly yet or maybe with 2 vectors? What do I kn´pw??
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      const material = ecs.getComponent<Material>(entity, 'Material');
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      const animatedTexture = ecs.getComponent<AnimatedTexture>(
        entity,
        'AnimatedTexture',
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

      if (mesh) {
        Renderer.updateMesh(mesh.meshId);
        this.updateNormals(mesh);
        mesh.dirty = false;
      }

      const flowMap = ecs.getComponent<FlowMap>(entity, 'FlowMap');
      if (splatmap && splatmap.dirty) {
        Renderer.updateTexture(
          splatmap.slot,
          splatmap.width,
          splatmap.height,
          splatmap.coords,
        );
        splatmap.dirty = false;
      }

      if (flowMap) {
        Renderer.updateTexture(flowMap.slot, 64, 64, flowMap.coords);
      }

      if (pivot && transform3D) {
        const shader = ShaderManager.getShader('debug');
        shader.bind();
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix(),
        );
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, transform3D.translate);
        shader.setUniformMat4('u_model', modelMatrix);
        const vao = MeshManager.getMesh('pivot');
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
        shader.setMaterialTexture('u_texture', material.slot);
        shader.setMaterialTexture('u_splatmap', splatmap.slot);

        if (terrain) {
          shader.setFloat('u_tiling', terrain.tiling);
          shader.setFloat('u_fogPower', terrain.fogPower);
        }
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix(),
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
          this.camera.getViewProjectionMatrix(),
        );
        shader.setVec3('u_cameraPos', cameraPos);
        shader.setFloat('u_time', performance.now() * 0.001);
        shader.setFloat('u_animationSpeed', animatedTexture.speed);
        const transform3D = ecs.getComponent<Transform3D>(
          entity,
          'Transform3D',
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
          shader.setFloat('u_flowSpeed', water.flowSpeed);
          const flowMap = ecs.getComponent<FlowMap>(entity, 'FlowMap');
          if (flowMap) {
            shader.setMaterialTexture('u_flowMap', flowMap.slot);
          }
        }
        const vao = MeshManager.getMesh(mesh.meshId);
        if (!vao) continue;
        Renderer.drawIndexed(vao);
      } else if (mesh && transform3D && material) {
        const shader = ShaderManager.getShader(material.shaderId);
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
          this.camera.getViewProjectionMatrix(),
        );
        const vertexArray = MeshManager.getMesh(mesh.meshId);
        if (!vertexArray) continue;
        Renderer.drawIndexed(vertexArray);
      }
      if (grass) {
        if (grass.meshId !== 'grass') throw new Error('Mesh is not grass!');
        const shader = ShaderManager.getShader(grass.meshId);
        shader.bind();
        shader.setUniformMat4(
          'u_matrix',
          this.camera.getViewProjectionMatrix(),
        );
        shader.setFloat('u_time', performance.now() * 0.001);
        shader.setVec3('u_cameraPos', cameraPos);
        if (light && lightPos) {
          shader.setVec3('light.position', lightPos.translate);
          shader.setVec3('light.ambient', light.ambient);
          shader.setVec3('light.diffuse', light.diffuse);
        }
        shader.setVec3('material.ambient', material.ambient);
        shader.setVec3('material.diffuse', material.diffuse);
        shader.setVec3('material.specular', material.specular);
        shader.setFloat('material.shininess', material.shininess);
        const vertexArray = MeshManager.getMesh(grass.meshId);
        if (!vertexArray) throw new Error('Mesh is not grass');
        console.log('Render grass');
        Renderer.drawInstancing(vertexArray, grass.positions, grass.amount);
      }
    }
  }

  private updateNormals(mesh: Mesh): void {
    // Steg 1: Initiera alla normals till 0
    for (let i = 0; i < mesh.vertices.length / 8; i++) {
      mesh.vertices[i * 8 + 5] = 0;
      mesh.vertices[i * 8 + 6] = 0;
      mesh.vertices[i * 8 + 7] = 0;
    }
    //Stride 8 xyzuvnormals(3)
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];

      const v0 = mesh.vertices[i0 * 8];
      const v1 = mesh.vertices[i0 * 8 + 1];
      const v2 = mesh.vertices[i0 * 8 + 2];

      const v3 = mesh.vertices[i1 * 8];
      const v4 = mesh.vertices[i1 * 8 + 1];
      const v5 = mesh.vertices[i1 * 8 + 2];

      const v6 = mesh.vertices[i2 * 8];
      const v7 = mesh.vertices[i2 * 8 + 1];
      const v8 = mesh.vertices[i2 * 8 + 2];

      const triangleA = vec3.fromValues(v0, v1, v2);
      const triangleB = vec3.fromValues(v3, v4, v5);
      const triangleC = vec3.fromValues(v6, v7, v8);

      const edge = vec3.create();
      vec3.subtract(edge, triangleB, triangleA);
      const edge1 = vec3.create();
      vec3.subtract(edge1, triangleC, triangleA);

      const normal = vec3.create();
      vec3.cross(normal, edge, edge1);
      vec3.normalize(normal, normal);
      // Skriv normalen till varje vertex i triangeln (flat shading)
      for (const idx of [i0, i1, i2]) {
        mesh.vertices[idx * 8 + 5] += normal[0];
        mesh.vertices[idx * 8 + 6] += normal[1];
        mesh.vertices[idx * 8 + 7] += normal[2];
      }
    }
    // Steg 3: Normalisera normals för varje vertex
    for (let i = 0; i < mesh.vertices.length / 8; i++) {
      const nx = mesh.vertices[i * 8 + 5];
      const ny = mesh.vertices[i * 8 + 6];
      const nz = mesh.vertices[i * 8 + 7];

      const normal = vec3.fromValues(nx, ny, nz);
      vec3.normalize(normal, normal);

      mesh.vertices[i * 8 + 5] = normal[0];
      mesh.vertices[i * 8 + 6] = normal[1];
      mesh.vertices[i * 8 + 7] = normal[2];
    }
  }
}
