import { Bone } from 'src/components/bone';

type Animations = {
  name: string;
};

export class Loader {
  private static animations: Map<string, any> = new Map();

  public static async loadAllBones(): Promise<void> {
    try {
      // Vänta på att bonelist.json laddas
      const res = await fetch('/assets/json/bonelist.json');
      const files: Animations[] = await res.json();

      // Skapa en array av fetch-promises
      const fetchPromises = files.map(async (file: Animations) => {
        const response = await fetch(`/assets/json/bones/${file.name}.json`);
        const data = await response.json();
        Loader.animations.set(file.name, data);
        console.log(file.name);
        console.log(Loader.animations.get(file.name));
      });

      // Vänta på att alla fetch-anrop slutförs
      await Promise.all(fetchPromises);
      console.log('Alla animationer har laddats!');
    } catch (error) {
      console.error('Fel vid laddning av animationer:', error);
    }
  }

  public static getBones(bones: string): Bone[] {
    const bonesArray = this.animations.get(bones);
    if (!bonesArray) {
      console.log("Couldn't find bones " + bones);
      return [];
    }
    const parsedBones = JSON.parse(JSON.stringify(bonesArray)) as Bone[];
    return parsedBones;
  }
}
