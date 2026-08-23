import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GradientService {
  public gradients = new Map<string, Uint8ClampedArray>();
}
