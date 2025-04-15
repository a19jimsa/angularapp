import { Bone } from 'src/components/bone';
import { Vec } from './vec';

type Bones = {
  name: string;
};

export class Loader {
  private static bones: Map<string, any> = new Map();

  public static async loadAllBones(): Promise<void> {
    try {
      // Vänta på att bonelist.json laddas
      const res = await fetch('/assets/json/bonelist.json');
      const files: Bones[] = await res.json();

      // Skapa en array av fetch-promises
      const fetchPromises = files.map(async (file: Bones) => {
        const response = await fetch(`/assets/json/bones/${file.name}.json`);
        const data = await response.json();
        Loader.bones.set(file.name, data);
      });

      // Vänta på att alla fetch-anrop slutförs
      await Promise.all(fetchPromises);
      console.log('Alla skelett har laddats!');
    } catch (error) {
      console.error('Fel vid laddning av skelett:', error);
    }
  }

  public static getBonesFiles() {
    return this.bones;
  }

  public static getBones(bones: string): Bone[] {
    const bonesArray = this.bones.get(bones);
    if (!bonesArray) {
      console.log("Couldn't find skeleton " + bones);
      return [];
    }
    const parsedBones = JSON.parse(JSON.stringify(bonesArray)) as Bone[];
    console.log(parsedBones);
    for (const bone of parsedBones) {
      bone.position = new Vec(bone.position.x, bone.position.y);
      bone.pivot = new Vec(bone.pivot.x, bone.pivot.y);
      bone.scale = new Vec(bone.scale.x, bone.scale.y);
    }
    return parsedBones;
  }
}
