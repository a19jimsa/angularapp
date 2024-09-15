import { Component, HostListener, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-form',
  templateUrl: './three-form.component.html',
  styleUrls: ['./three-form.component.css'],
})
export class ThreeFormComponent implements OnInit {
  rayCaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  camera!: THREE.PerspectiveCamera;
  cubes: THREE.Mesh[] = new Array();
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  ngOnInit(): void {
    this.createScene();
  }

  createScene() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 20); // Placera kameran så att du ser kuberna snett ovanifrån

    window.addEventListener('click', this.onMouseClick.bind(this));

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5); // Placera ljuset snett ovanifrån
    this.scene.add(directionalLight);

    // Ladda en bakgrundsbild och sätt den som bakgrund till scenen
    const loader = new THREE.TextureLoader();
    loader.load('assets/curocell/thumbnail_420 Montering.jpg', (texture) => {
      this.scene.background = texture; // Sätt bakgrundsbilden till scenen
    });

    // Skapa kuber i ett rutnät (liknande cellstrukturen på bilden)
    const rows = 10; // Antal rader
    const cols = 2; // Antal kolumner
    const spacing = 1.1; // Avstånd mellan kuberna

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const geometry = new THREE.BoxGeometry(0.5, 1, 3); // Skapa en avlång kub liknande battericellerna

        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);

        // Placera kuberna i ett rutnät
        cube.position.x = i * (spacing - 0.5);
        cube.position.y = j * spacing;

        // Lägg till varje kub i scenen
        this.scene.add(cube);
        this.cubes.push(cube);
      }
    }

    // Animeringsloop
    const animate = () => {
      requestAnimationFrame(animate);

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  // Lyssna på musens klick och kasta en stråle
  onMouseClick(event: MouseEvent) {
    // Beräkna musposition relativt renderarens storlek
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Uppdatera raycaster med musens position och kamerans nuvarande vy
    this.rayCaster.setFromCamera(this.mouse, this.camera);

    for (let i = 0; i < this.cubes.length; i++) {
      const intersects = this.rayCaster.intersectObject(this.cubes[i]);
      if (intersects.length > 0) {
        // Om det finns en träff, ändra objektets färg eller gör något annat
        const intersectedObject = intersects[0].object as any;
        intersectedObject.material.color.set(0xff0000); // Byt färg till röd
        console.log('Klickade på kub:', intersectedObject);
      }
    }
    // Kolla om musen träffar några av objekten
  }
}
