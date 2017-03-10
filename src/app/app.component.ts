import {Component, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import {RenderService} from "../renderer/render.service";
import {MdSlider} from "@angular/material/slider";
import {TimeService} from "../services/time.service";
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderContainer') renderContainer: ElementRef;
  @ViewChild('timeSlider') timeSlider: MdSlider;

  constructor(
    public dataService: DataService,
    public renderService: RenderService,
    public timeService: TimeService
  ) {}

  delaySwitch(event) {
    this.renderService.enableDelayVisualization(event.checked);
  }

  ngAfterViewInit(): void {
    this.renderService.initRenderer(this.renderContainer);
    this.timeService.timeSlider = this.timeSlider;
  }
}
