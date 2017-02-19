import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from "rxjs";

@Injectable()
export class MapService {

  private _mapScaleFactor: number;
  private _mapOffset: number[];

  constructor(private http: Http) {

  }
}