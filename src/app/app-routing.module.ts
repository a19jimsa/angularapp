import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChessComponent } from './chess/chess.component';
import { HomeComponent } from './home/home.component';
import { OthelloComponent } from './othello/othello.component';
import { MemoryComponent } from './memory/memory.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chess', component: ChessComponent },
  { path: 'othello', component: OthelloComponent },
  { path: 'memory', component: MemoryComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
