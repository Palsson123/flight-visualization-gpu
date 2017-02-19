import {Component, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {RenderService} from "../services/render.service";
import {MapService} from "../services/map.service";
import {FlightsService} from "../services/flights/flights.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderContainer') renderContainer: ElementRef;

  constructor(
    public mapService: MapService,
    public flightsService: FlightsService,
    public renderService: RenderService
  ) {}

  ngAfterViewInit(): void {
    this.renderService.init(this.renderContainer)
  }
}
