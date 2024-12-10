import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { FormComponent } from './form/form.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChessComponent } from './chess/chess.component';
import { SquareComponent } from './square/square.component';
import { OthelloComponent } from './othello/othello.component';
import { CircleComponent } from './circle/circle.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { MemoryComponent } from './memory/memory.component';
import { CardComponent } from './card/card.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { MinesweeperComponent } from './minesweeper/minesweeper.component';
import { MineComponent } from './mine/mine.component';
import { SudokuComponent } from './sudoku/sudoku.component';
import { SudokuNumberComponent } from './sudoku-number/sudoku-number.component';
import { SudokumenuComponent } from './sudokumenu/sudokumenu.component';
import { KillersudokuComponent } from './killersudoku/killersudoku.component';
import { SlidingpuzzleComponent } from './slidingpuzzle/slidingpuzzle.component';
import { PuzzlepieceComponent } from './puzzlepiece/puzzlepiece.component';
import { SnakeComponent } from './snake/snake.component';
import { SnakeTileComponent } from './snake-tile/snake-tile.component';
import { WebglParticlesComponent } from './webgl-particles/webgl-particles.component';
import { SidescrollerGameComponent } from './sidescroller-game/sidescroller-game.component';
import { FallingSandComponent } from './falling-sand/falling-sand.component';
import { SandTileComponent } from './sand-tile/sand-tile.component';
import { CollisionComponent } from './collision/collision.component';
import { CurlingComponent } from './curling/curling.component';
import { BoneAnimationComponent } from './bone-animation/bone-animation.component';
import { AnimationCreatorComponent } from './animation-creator/animation-creator.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FormComponent,
    ChessComponent,
    SquareComponent,
    OthelloComponent,
    CircleComponent,
    NavbarComponent,
    HomeComponent,
    MemoryComponent,
    CardComponent,
    CalculatorComponent,
    MinesweeperComponent,
    MineComponent,
    SudokuComponent,
    SudokuNumberComponent,
    SudokumenuComponent,
    KillersudokuComponent,
    SlidingpuzzleComponent,
    PuzzlepieceComponent,
    SnakeComponent,
    SnakeTileComponent,
    WebglParticlesComponent,
    SidescrollerGameComponent,
    FallingSandComponent,
    SandTileComponent,
    CollisionComponent,
    CurlingComponent,
    BoneAnimationComponent,
    AnimationCreatorComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatSliderModule,
    MatIconModule,
    CommonModule,
    MatListModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
