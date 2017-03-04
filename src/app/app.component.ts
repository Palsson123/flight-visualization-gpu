import {Component, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {RenderService} from "../renderer/render.service";
import {MapService} from "../services/map.service";
import {FlightsService} from "../services/flights/flights.service";
import {MdSlider, MdSliderChange} from "@angular/material/slider"
import {TimeService} from "../services/time.service";
import {DataService} from "../services/data.service";
import {Http} from "@angular/http";
import * as d3 from 'd3-dsv';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderContainer') renderContainer: ElementRef;
  @ViewChild('timeSlider') timeSlider: MdSlider;

  constructor(
    public mapService: MapService,
    public flightsService: FlightsService,
    public renderService: RenderService,
    public timeService: TimeService,
    public dataService: DataService,
    private http: Http
  ) {
  }

  ngAfterViewInit(): void {
    this.renderService.initRenderer(this.renderContainer);
    this.timeService.timeSlider = this.timeSlider;
    // this.timeSlider.change.subscribe((change: MdSliderChange) => {
    //   this.timeService.updateFromSlider(change.value)
    // });
  }
}
