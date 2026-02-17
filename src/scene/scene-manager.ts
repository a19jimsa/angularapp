import { Ecs } from 'src/core/ecs';

type Scene = {
  entities: [];
};

export class SceneManager {
  static loadScene(json: any) {
    console.log(json);
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
    return JSON.stringify(scene, null, 2);
  }

  static convertCoordsToImage(size: number, coords: Uint8ClampedArray) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const imgData = ctx.createImageData(size, size);

    for (let i = 0; i < coords.length; i++) {
      imgData.data[i] = coords[i];
    }
    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'splatmap.png';
    a.click();
    return 'assets/splatmap.png';
  }

  static convertImageToCoords(path: string) {
    const image = new Image();
    image.src = path;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    //Get all imagedata of image on canvas
    return ctx.getImageData(0, 0, image.width, image.height);
  }
}
