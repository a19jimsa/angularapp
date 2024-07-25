import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollisionComponent } from './collision.component';

describe('CollisionComponent', () => {
  let component: CollisionComponent;
  let fixture: ComponentFixture<CollisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollisionComponent]
    });
    fixture = TestBed.createComponent(CollisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
