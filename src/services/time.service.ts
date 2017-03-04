import {Injectable} from "@angular/core";
import {Flight} from "./flights/flight.model";
import {Airport} from "../models/airport.model";
import {BehaviorSubject, Observable} from "rxjs";
import {MdSlider, MdSliderChange} from "@angular/material/slider"

@Injectable()
export class TimeService {
  private _startTime: BehaviorSubject<number>;
  private _endTime: BehaviorSubject<number>;
  private _currentTime: BehaviorSubject<number>;
  private _isPlaying: BehaviorSubject<boolean>;
  private _timeSlider: MdSlider;

  constructor() {
    this._startTime = new BehaviorSubject(0);
    this._endTime = new BehaviorSubject(0);
    this._currentTime = new BehaviorSubject(0);
    this._isPlaying = new BehaviorSubject(false);
  }

  public init(flights: Flight[], airports: { [id: string]: Airport }): void {
    let startTime: number = 900000000000;
    let endTime: number = -900000000000;

    for (let flight of flights) {
      let departureAirport = airports[flight.departureAirportId];
      let arrivalAirport = airports[flight.arrivalAirportId];

      if (departureAirport && arrivalAirport) {
        startTime = flight.departureTime < startTime ? flight.departureTime : startTime;
        endTime = flight.arrivalTime > endTime ? flight.arrivalTime : endTime;
      }
    }

    this._startTime.next(startTime);
    this._endTime.next(endTime);
    this._currentTime.next(this._startTime.value);
  }

  public incrementTime() {
    this._timeSlider.writeValue(this._timeSlider.value + 0.00005);
  }

  public togglePlay() {
    this._isPlaying.next(!this._isPlaying.getValue())
  }

  get currentTime(): number {
    if (this._timeSlider) {
      return this._timeSlider.value * (this._endTime.value - this._startTime.value);
      //return this._timeSlider.percent;
    }
  }

  get startTime(): number { return this._startTime.value; }
  get endTime(): number { return this._endTime.value; }
  get isPlaying(): boolean { return this._isPlaying.getValue(); }
  set timeSlider(timeSlider: MdSlider) { this._timeSlider = timeSlider; }

  get startTimeObservable(): Observable<number> { return this._startTime.asObservable(); }
  get endTimeObservable(): Observable<number> { return this._endTime.asObservable(); }
  get isPlayingObservable(): Observable<boolean> { return this._isPlaying.asObservable(); }
}