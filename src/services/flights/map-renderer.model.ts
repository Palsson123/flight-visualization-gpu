import {IFeature, IGeometry} from "../data.service";
import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";
import RenderPass from "../../models/render-pass";

export const MULTI_POLYGON = 'MultiPolygon';
export const POLYGON = 'Polygon';

export class MapRenderer extends RenderPass {
  private _group: THREE.Group;
  private _lines: THREE.Line[];
  private _lineMaterial: THREE.LineBasicMaterial;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    super(renderer, new THREE.Scene(), camera);

    this._group = new THREE.Group();
    this._group.rotateX(-Math.PI / 1.4);
    this._scene.add(this._group);

    this._lines = [];
    this._lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    let geometry = new THREE.SphereGeometry(10, 32, 32);
    let material = new THREE.MeshPhongMaterial();
    let earthMesh = new THREE.Mesh(geometry, material);
    this._group.add(earthMesh);
  }

  public drawMap(features: IFeature[]) {
    for (let feature of features) {
      switch (feature.geometry.type) {
        case MULTI_POLYGON:
          this.createMapFromMultiPolygon(feature.geometry);
          break;
        case POLYGON:
          this.createMapFromPolygon(feature.geometry);
          break;
      }
    }
  }

  private createMapFromPolygon(geometry: IGeometry) {
    let borderGeometry = new THREE.Geometry();

    for (let coordObject of geometry.coordinates) {
      for (let coord of coordObject) {
        borderGeometry.vertices.push(spheriticalToCartesian(coord[0], coord[1], 10));
      }
    }

    let line = new THREE.Line(borderGeometry, this._lineMaterial);
    this._lines.push(line);
    this._group.add(line);
  }

  private createMapFromMultiPolygon(geometry: IGeometry) {
    for (let polygon of geometry.coordinates) {
      let borderGeometry = new THREE.Geometry();

      for (let coordObject of polygon) {
        for (let coord of coordObject) {
          if (coord.length != 2) {
            console.log(coord);
          }

          borderGeometry.vertices.push(spheriticalToCartesian(coord[0], coord[1], 10));
        }
      }

      let line = new THREE.Line(borderGeometry, this._lineMaterial);
      this._lines.push(line);
      this._group.add(line);
    }
  }

}