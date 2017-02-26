/**
 * Created by fille on 2017-02-16.
 */
const glsl = require('glslify');

export default class ShaderLoader {
  private _baseUrl: string;
  private _callback: () => any;
  private _shaders: {[id: string]: string};

  constructor() {
    this._shaders = {};
  }

  public loadShaders(shaders: {[id: string]: string}, baseUrl: string, callback: () => any) {
    this._shaders = shaders;
    this._baseUrl = baseUrl;
    this._callback = callback;

    let batchLoad = () => {
      let queue = 0;

      let loadHandler = ( name, req ) => {
        return () => {
          this._shaders[name] = glsl(req.responseText);
          if ( --queue <= 0 ) this._callback();
        };
      };

      for (let shaderName in this._shaders) {
        queue++;
        let req = new XMLHttpRequest();
        req.onload = loadHandler(shaderName, req);
        req.open('get', this._baseUrl + shaderName + '.glsl', true);
        req.send();
      }
    };

    batchLoad();
  }

  private onShadersReady() {
    if (this._callback) this._callback();
  }

  public get(id: string): string {
    return this._shaders[id];
  }
}