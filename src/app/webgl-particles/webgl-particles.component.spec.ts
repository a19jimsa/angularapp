import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebglParticlesComponent } from './webgl-particles.component';

describe('WebglParticlesComponent', () => {
  let component: WebglParticlesComponent;
  let fixture: ComponentFixture<WebglParticlesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebglParticlesComponent]
    });
    fixture = TestBed.createComponent(WebglParticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
