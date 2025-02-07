import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCaptComponent } from './form-capt.component';

describe('FormCaptComponent', () => {
  let component: FormCaptComponent;
  let fixture: ComponentFixture<FormCaptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormCaptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCaptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
