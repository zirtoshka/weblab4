import {Component, EventEmitter, inject, Injectable, Output} from '@angular/core';
import {GeometryElement} from 'jsxgraph';
import * as JXG from 'jsxgraph';
import {NgIf} from "@angular/common";
import {AuthService} from "../../auth.service";
import {ShotService} from "../../shot.service";
import {InputNumberModule} from "primeng/inputnumber";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SliderModule} from "primeng/slider";
import {ShotFormComponent} from "../shot-form/shot-form.component";
import {ShotResponse} from "../../shot-response";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    NgIf,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    SliderModule
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})

export class GraphComponent {
  private shotService = inject(ShotService);
  private messageService = inject(MessageService)

  @Output() addShotEvent = new EventEmitter()

  board!: JXG.Board;

  figures: GeometryElement[] = [];
  labels: GeometryElement[] = [];
  dr_shots: GeometryElement[] = [];


  shotStore: ShotResponse[] = [];


  r!: number;

  rLabel = 0.3;


  constructor() {
  }

  ngOnInit() {
    this.r = Number(sessionStorage.getItem('r'));
    this.board = this.boardInit();
    this.refresh(this.r);
  }

  onClick(e: MouseEvent) {

    this.r = Number(sessionStorage.getItem('r'));
    if (this.r >= 0) {
      let coords = this.board.getUsrCoordsOfMouse(e);
      let x = coords[0].toFixed(2);
      let y = coords[1].toFixed(2);
      let r = this.r;


      let data = sessionStorage.getItem('shots');
      if (data) {
        this.shotStore = JSON.parse(data) as ShotResponse[];
      } else {
        this.shotStore = [];
      }

      this.shotService.addShot(Number(x), Number(y), Number(r)).subscribe((shot: ShotResponse) => {
        this.shotStore.push(shot);
        this.drawShots(this.r);
        sessionStorage.setItem('shots', JSON.stringify(this.shotStore));
        this.addShotEvent.emit()
      });
    } else {
      this.showError(' You have to choose correct R');
    }
  }

  refresh(r: number) {
    this.r = r;
    if (r >= 0) {
      this.r = r;
      this.clearBoard();
      this.drawFigures(r);
      this.createLabelsR(r);
      let data = sessionStorage.getItem('shots');
      if (data) {
        this.shotStore = JSON.parse(data) as ShotResponse[];
      } else {
        this.shotStore = [];
      }
      for (let shot of this.shotStore) {
        if (shot.r == this.r) {
          this.dr_shots.push(<GeometryElement>this.createPoint(shot));
        }
      }
    } else {
      this.clearBoard();

    }
  }

  drawShots(r: number) {
    for (const point of this.shotStore) {
      if (point.r === r) {
        this.dr_shots.push(<GeometryElement>this.createPoint(point));
      }
    }
  }

  drawFigures(r: number) {
    this.figures.push(this.createRectangle(r));
    this.figures.push(this.createTriangle(r));
    this.figures.push(this.createCircle(r));
  }


  createPoint(shot: ShotResponse) {
    let color = (shot.kill ? "#7ce57c" : "#dc4a4a");
    return this.board.create('point', [shot.x, shot.y], {
      name: '', fixed: true, color: color, fillOpacity: 1, visible: true,
      strokewidth: 1
    });

  }

  createLabelsR(r: number) {
    if (r > 0.5) {

      this.labels.push(this.board.create('text', [this.r - 0.1, 0 + this.rLabel, 'R'], {
        fixed: true,
        color: '#000000',
        fontSize: 11
      }));
      this.labels.push(this.board.create('text', [0 + 0.1, this.r, 'R'], {
        fixed: true,
        color: '#000000',
        fontSize: 11
      }));

      this.labels.push(this.board.create('text', [-this.r - 0.1, 0 + this.rLabel, '-R'], {
        fixed: true,
        color: '#000000',
        fontSize: 11
      }));
      this.labels.push(this.board.create('text', [0 + 0.1, -this.r, '-R'], {
        fixed: true,
        color: '#000000',
        fontSize: 11
      }));

      if (r >= 1.5) {
        this.labels.push(this.board.create('text', [this.r / 2 - 0.25, 0 + this.rLabel, 'R/2'], {
          fixed: true,
          color: '#000000',
          fontSize: 11
        }));
        this.labels.push(this.board.create('text', [0 + 0.1, this.r / 2, 'R/2'], {
          fixed: true,
          color: '#000000',
          fontSize: 11
        }));

        this.labels.push(this.board.create('text', [-this.r / 2 - 0.3, 0 + this.rLabel, '-R/2'], {
          fixed: true,
          color: '#000000',
          fontSize: 11
        }));
        this.labels.push(this.board.create('text', [0 + 0.1, -this.r / 2, '-R/2'], {
          fixed: true,
          color: '#000000',
          fontSize: 11
        }));
      }
    }

  }

  createRectangle(r: number) {

    let rectanglePoint1 = this.board.create('point', [0, 0], {name: '', fixed: true, visible: false});
    let rectanglePoint2 = this.board.create('point', [-r / 2, 0], {name: '', fixed: true, visible: false});
    let rectanglePoint3 = this.board.create('point', [-r / 2, r], {name: '', fixed: true, visible: false});
    let rectanglePoint4 = this.board.create('point', [0, r], {name: '', fixed: true, visible: false});
    return this.board.create('polygon', [rectanglePoint1, rectanglePoint2, rectanglePoint3, rectanglePoint4],
      {fillColor: '#9E6ED4', fillOpacity: 1});
  }

  createTriangle(r: number) {

    let trianglePoint1 = this.board.create('point', [0, 0], {name: '', fixed: true, visible: false});
    let trianglePoint2 = this.board.create('point', [-r / 2, 0], {name: '', fixed: true, visible: false});
    let trianglePoint3 = this.board.create('point', [0, -r], {name: '', fixed: true, visible: false});
    return this.board.create('polygon', [trianglePoint1, trianglePoint2, trianglePoint3], {
      fillColor: '#9E6ED4',
      fillOpacity: 1
    });
  }

  createCircle(r: number) {

    let circlePoint1 = this.board.create('point', [r / 2, 0], {name: '', fixed: true, visible: false});
    let circlePoint2 = this.board.create('point', [0, r / 2], {name: '', fixed: true, visible: false});
    let centerPoint = this.board.create('point', [0, 0], {name: '', fixed: true, visible: false});

    return this.board.create('sector', [centerPoint, circlePoint1, circlePoint2],
      {fillColor: '#9E6ED4', fillOpacity: 1});
  }

  clearBoard() {
    for (const object of this.figures) {
      this.board.removeObject(object);
    }
    for (const label of this.labels) {
      this.board.removeObject(label);
    }
    for (const shot of this.dr_shots) {
      this.board.removeObject(shot);
    }
  }

  boardInit() {
    return JXG.JSXGraph.initBoard('jxgbox', {
      boundingbox: [-4, 4, 4, -4],
      grid: true,
      showCopyright: false,
      axis: true,
      defaultAxes: {
        x: {
          ticks: {
            drawZero: true,
            majorHeight: 5,
            minTicksDistance: 1,
            strokeColor: 'black',
          },
          name: 'X',
          withLabel: true,
          color: 'black',
          label: {
            position: 'rt',
            offset: [7, 10],
            anchorX: 'right',
            color: 'black'
          }
        },
        y: {
          ticks: {
            majorHeight: 5,
            minTicksDistance: 1,
            strokeColor: 'black',
          },
          color: 'black',
          withLabel: true,
          name: 'Y',
          label: {
            position: 'rt',
            offset: [-15, 10],
            anchorY: 'top',
            color: "black",

          }
        }
      },
      description: 'super-puper graph',


    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    })
  }


}
