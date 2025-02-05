import { Component, inject, Input, signal } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: false,
})
export class NavbarComponent {
  protected readonly fillerNav = [
    { path: '/', label: 'Jimmydev.se' },
    { path: '/chess', label: 'Chess' },
    { path: '/othello', label: 'Othello' },
    { path: '/memory', label: 'Memory' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/mine', label: 'Minesweeper' },
    { path: '/sudoku', label: 'Sudoku' },
    { path: '/killersudoku', label: 'Killer Sudoku' },
    { path: '/slidingpuzzle', label: 'Sliding puzzle' },
    { path: '/snake', label: 'Snake' },
    { path: '/particles', label: 'Particles' },
    { path: '/sidescroller', label: 'Sidescroller' },
    { path: '/sand', label: 'Falling Sand' },
    { path: '/collision', label: 'Collision detection' },
    { path: '/curling', label: 'Curling' },
    { path: '/animation', label: 'Game Engine' },
    { path: '/creator', label: 'Animation Creator' },
  ];

  protected readonly isMobile = signal(true);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 1400px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
