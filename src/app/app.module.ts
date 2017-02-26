import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import { MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';
import {RenderService} from "../services/render.service";
import {LoaderService} from "../services/loader/loader.service";
import {DataService} from "../services/data.service";
import {MapService} from "../services/map.service";
import {FlightsService} from "../services/flights/flights.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule
  ],
  providers: [
    DataService,
    RenderService,
    LoaderService,
    MapService,
    FlightsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


// module.exports = {
//   module: {
//     loaders: [
//       { test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
//       { test: /\.(glsl|frag|vert)$/, loader: 'glslify', exclude: /node_modules/ }
//     ]
//   }
// }