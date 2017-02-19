import {IFeature, IGeometry} from "../data.service";
import {spheriticalToCartesian} from "../../models/spheritical-to-cartesian.model";
import RenderPass from "../../models/render-pass";
import ShaderLoader from "../../models/shader-loader";

export const MULTI_POLYGON = 'MultiPolygon';
export const POLYGON = 'Polygon';

export class MapRenderer extends RenderPass {
  private _group: THREE.Group;
  private _lines: THREE.Line[];
  private _lineMaterial: THREE.LineBasicMaterial;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera, shaderLoader: ShaderLoader) {
    super(renderer, new THREE.Scene(), camera);

    this._group = new THREE.Group();
    this._group.rotateX(-Math.PI / 1.4);
    this._scene.add(this._group);

    this._lines = [];
    this._lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });

    let geometry = new THREE.SphereGeometry(10, 64, 64);
    let earthMap = new THREE.TextureLoader().load('./assets/textures/world_map.png');
    earthMap.wrapS = THREE.RepeatWrapping;
    earthMap.wrapT = THREE.RepeatWrapping;

    let mapUniforms = {
      earthMap: { value: earthMap }
    };
    let earthShader = new THREE.ShaderMaterial({
      uniforms: mapUniforms,
      vertexShader: shaderLoader.get( 'earth_vs' ),
      fragmentShader: shaderLoader.get( 'earth_fs' ),
      blending: THREE.AdditiveBlending
    });

    let earthMesh = new THREE.Mesh(geometry, earthShader);
    earthMesh.rotation.set(Math.PI / 2.0, 0.0, Math.PI);
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