import { Light } from 'src/components/light';
import { Material } from 'src/components/material';
import { Mesh } from 'src/components/mesh';
import { Name } from 'src/components/name';
import { Splatmap } from 'src/components/splatmap';
import { Terrain } from 'src/components/terrain';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { BufferLayout } from 'src/renderer/buffer';
import { Model } from 'src/renderer/model';
import { ShaderDataType, ShaderType } from 'src/renderer/shader-data-type';
import { MeshManager } from 'src/resource-manager/mesh-manager';

type Scene = {
  entities: [];
};

export class SceneManager {
  static async loadScene(json: any): Promise<Ecs> {
    const ecs = new Ecs();
    for (const entityData of json.entities) {
      const entity = ecs.createEntity();
      for (const [type, data] of Object.entries(entityData.components)) {
        console.log(type, data);
        if (type === 'Splatmap') {
          const newData = data as Splatmap;
          const splatmap = new Splatmap(newData.size, newData.slot);
          await splatmap.deserialize(splatmap, newData);
          ecs.addComponent<Splatmap>(entity, splatmap);
        } else if (type === 'Terrain') {
          const newData = data as Terrain;
          const terrain = new Terrain(newData.size, newData.meshId);
          terrain.deserialize(terrain, newData);
          ecs.addComponent<Terrain>(entity, terrain);
        } else if (type === 'Name') {
          const newData = data as any;
          const name = new Name(newData.value);
          ecs.addComponent<Name>(entity, name);
        } else if (type === 'Material') {
          const newData = data as Material;
          const material = new Material(
            newData.index,
            newData.textureType,
            newData.shaderId,
          );
          ecs.addComponent<Material>(entity, material);
        } else if (type === 'Transform3D') {
          const newData = data as Transform3D;
          const transform = new Transform3D(0, 0, 0);
          ecs.addComponent<Transform3D>(entity, transform);
        } else if (type === 'Mesh') {
          const newData = data as Mesh;
          const mesh = new Mesh(
            newData.vertices,
            newData.indices,
            newData.width,
            newData.height,
            newData.meshId,
          );
          ecs.addComponent<Mesh>(entity, mesh);
          const buffer = new BufferLayout();
          buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
          buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
          buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 3, false);
          const model = new Model(buffer);
          model.vertices = newData.vertices;
          model.indices = newData.indices;
          MeshManager.addMesh(model, newData.meshId);
        } else if (type === 'Light') {
          const newData = data as Light;
          const light = new Light();
          ecs.addComponent<Light>(entity, light);
        }
      }
    }
    return ecs;
  }

  static saveScene(ecs: Ecs) {
    const scene: any = {
      entities: [],
    };
    for (const entity of ecs.getEntities()) {
      const entityData: any = {
        id: entity,
        components: {},
      };
      const components = ecs.getComponents(entity);
      //Serialize data that is going in the scene.
      for (const component of components as any) {
        if (typeof component.serialize === 'function') {
          entityData.components[component.type] = component.serialize();
        }
      }
      scene.entities.push(entityData);
    }
    return scene;
  }

  static convertCoordsToImage(size: number, coords: Uint8ClampedArray) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < coords.length; i += 4) {
      imgData.data[i + 0] = coords[i + 0];
      imgData.data[i + 1] = coords[i + 1];
      imgData.data[i + 2] = coords[i + 2];
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = url;
    return img;
  }

  static convertImageToCoords(path: string): Promise<Uint8ClampedArray> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const coords = new Uint8ClampedArray(imgData.data.length);
        for (let i = 0; i < coords.length; i += 4) {
          coords[i + 0] = imgData.data[i + 0];
          coords[i + 1] = imgData.data[i + 1];
          coords[i + 2] = imgData.data[i + 2];
          coords[i + 3] = imgData.data[i + 3];
        }
        console.log(coords);
        resolve(coords);
      };
      //Really important
      img.src = path;
    });
  }
}
