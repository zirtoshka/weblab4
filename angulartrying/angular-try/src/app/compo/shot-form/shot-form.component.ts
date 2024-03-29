import {AfterViewInit, Component, EventEmitter, inject, Output} from '@angular/core';
import {SliderChangeEvent, SliderModule} from "primeng/slider";
import {FormArray, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators} from "@angular/forms";
import {TreeSelectModule} from "primeng/treeselect";
import {PaginatorModule} from "primeng/paginator";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {ButtonModule} from "primeng/button";
import {FormBuilder} from "@angular/forms";
import {NgIf} from "@angular/common";
import {MessageService} from "primeng/api";
import {ShotService} from "../../shot.service";
import {GraphComponent} from "../graph/graph.component";
import {HomeComponent} from "../home/home.component";
import {ShotResponse} from "../../shot-response";


@Component({
  selector: 'app-shot-form',
  standalone: true,
  imports: [
    SliderModule,
    FormsModule,
    TreeSelectModule,
    PaginatorModule,
    InputGroupAddonModule,
    InputGroupModule,
    ButtonModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './shot-form.component.html',
  styleUrl: './shot-form.component.css'
})
export class ShotFormComponent {

  shotForm: FormGroup;
  displayValueX = 0;
  displayValueR = 0;
  private shotService = inject(ShotService);
  // graphComponent = inject(GraphComponent);

  @Output() rChangeEvent = new EventEmitter<number>()
  @Output() addShotEvent = new EventEmitter()

  constructor(private formBuilder: FormBuilder) {
    this.shotForm = formBuilder.group({
      "x": ["0", [Validators.required,
        Validators.min(-5),
        Validators.max(3),
        Validators.pattern('-?\\d+(\\.\\d+)?')]],
      "y": ["0", [Validators.required,
        Validators.min(-5),
        Validators.max(3),
        Validators.pattern('-?\\d+([\\.,]\\d+)?')]], //'\\d+(\\.|,\\d+)?'
      "r": ["0", [Validators.required,
        Validators.min(0),
        Validators.max(3),
        Validators.pattern('-?\\d+(\\.\\d+)?')]]
    });
    sessionStorage.setItem('r', '0');
  }

  clearShots() {
    sessionStorage.setItem('shots', '[]')
    this.shotService.clearShots().subscribe()
    this.addShotEvent.emit()
    this.rChangeEvent.emit(this.displayValueR)
  }

  submit() {
    this.shotService.addShot(Number(this.shotForm.value.x), Number(this.shotForm.value.y), Number(this.shotForm.value.r)).subscribe((shot: ShotResponse) => {
      const data = sessionStorage.getItem('shots');
      sessionStorage.setItem('shots', JSON.stringify([...JSON.parse(data ?? "[]"), shot]));
      this.rChangeEvent.emit(shot.r);
      this.addShotEvent.emit();
    });

  }

  onSliderChangeX(event: any) {
    this.displayValueX = event.value;
  }

  onSliderChangeR(event: SliderChangeEvent) {
    this.displayValueR = event.value!!;
    this.rChangeEvent.emit(event.value);
    sessionStorage.setItem('r', String(this.displayValueR));
    // this.graphComponent.refresh(Number(this.displayValueR));
  }


  protected readonly Number = Number;
  protected readonly document = document;
  protected readonly window = window;
}
