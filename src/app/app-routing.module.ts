import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChessComponent } from './chess/chess.component';
import { HomeComponent } from './home/home.component';
import { OthelloComponent } from './othello/othello.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chess', component: ChessComponent },
  { path: 'othello', component: OthelloComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
