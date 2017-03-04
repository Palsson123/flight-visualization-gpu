import {Component, AfterViewInit} from "@angular/core";
import {DataService} from "../services/data.service";
import {RenderService} from "../renderer/render.service";
import {Flight} from "../services/flights/flight.model";
import {Airport} from "../models/airport.model";
import {MdDialog} from '@angular/material';
import {TimeService} from "../services/time.service";

@Component({
  selector: 'start-page',
  templateUrl: './start-page.html',
  styleUrls: ['./start-page.css']
})
export class StartPageComponent implements AfterViewInit {
  advancedGraphics: boolean = true;

  constructor(
    private dataService: DataService,
    private timeService: TimeService,
    private renderService: RenderService,
    private dialog: MdDialog
  ) {}

  start() {
    this.dialog.open(LoadingDialog);

    this.dataService.flights.subscribe((flights: Flight[]) => {
      this.dataService.airports.subscribe((airports: { [id: string]: Airport } ) => {
        this.renderService.init(flights, airports, this.advancedGraphics);
        setTimeout(() => {
          this.renderService.started = true;
          this.timeService.togglePlay();
          this.dialog.closeAll();
        }, 500);
      });
    });
  }

  ngAfterViewInit(): void {}
}

@Component({
  selector: 'loading-dialog',
  templateUrl: './loading-dialog.html',
})
export class LoadingDialog {}