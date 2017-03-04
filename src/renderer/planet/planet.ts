/*
  Shader imports
 */
import {Settings} from "../settings";
import {generateCircleLine} from "../utils/circleLine";
const planetVert = require('raw-loader!glslify-loader!./shaders/planet.vert');
const planetFrag = require('raw-loader!glslify-loader!./shaders/planet.frag');

export default class Planet {
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;
  private _geometry: THREE.BufferGeometry;
  private _uniforms: any;
  private _renderTarget: THREE.WebGLRenderTarget;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this._renderer = renderer;
    this._camera = camera;
    this._scene = new THREE.Scene();
    this._scene.rotateX(-Math.PI / 1.4);

    this._geometry = new THREE.SphereBufferGeometry(10, 64, 64);
    this.computeTangents();

    let earthColorMap = new THREE.TextureLoader().load('./assets/textures/world_clr_map.jpg');
    earthColorMap.wrapS = THREE.RepeatWrapping;
    earthColorMap.wrapT = THREE.RepeatWrapping;

    let earthMaskMap = new THREE.TextureLoader().load('./assets/textures/world_map_mask.png');
    earthMaskMap.wrapS = THREE.RepeatWrapping;
    earthMaskMap.wrapT = THREE.RepeatWrapping;

    let earthHeightMap = new THREE.TextureLoader().load('./assets/textures/world_height_map.jpg');
    earthHeightMap.wrapS = THREE.RepeatWrapping;
    earthHeightMap.wrapT = THREE.RepeatWrapping;

    this._uniforms = {
      earthColorMap: { value: earthColorMap },
      earthMaskMap: { value: earthMaskMap },
      earthHeightMap: { value: earthHeightMap },
      sunPosition: { type: 'v3', value: new THREE.Vector3(0,0,0) },
      time: { type: 'f', value: 0.0 }
    };
    let earthShader = new THREE.ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: planetVert,
      fragmentShader: planetFrag,
      blending: THREE.AdditiveBlending
    });
    earthShader.needsUpdate = true;

    let earthMesh = new THREE.Mesh(this._geometry, earthShader);
    earthMesh.rotation.set(Math.PI / 2.0, 0.0, Math.PI);
    this._scene.add(earthMesh);

    this._renderTarget = new THREE.WebGLRenderTarget(Settings.width, Settings.height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
    });

  }

  public render(time: number, sunPosition: THREE.Vector3) {
    this._uniforms.sunPosition.value = sunPosition;
    this._uniforms.time.value = time;

    this._renderer.render(this._scene, this._camera, this._renderTarget);
  }

  private computeTangents() {
    let positions = this._geometry.getAttribute('position');
    let uv = this._geometry.getAttribute('uv');
    let indices = this._geometry.getIndex();

    let vertices: THREE.Vector3[] = [];
    let uvs: THREE.Vector2[] = [];
    let tangents = new Float32Array(positions.count * 3);
    let bitangents = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      vertices.push(new THREE.Vector3(
        positions.array[i * 3],
        positions.array[i * 3 + 1],
        positions.array[i * 3 + 2],
      ));

      uvs.push(new THREE.Vector2(
        uv.array[i * 2],
        uv.array[i * 2 + 1],
      ));
    }

    for (let i = 0; i < indices.count; i += 3) {
      let a = indices.array[i];
      let b = indices.array[i + 1];
      let c = indices.array[i + 2];

      let v0 = vertices[a];
      let v1 = vertices[b];
      let v2 = vertices[c];

      let uv0 = uvs[a];
      let uv1 = uvs[b];
      let uv2 = uvs[c];


      let deltaPos1 = v1.clone().sub(v0);
      let deltaPos2 = v2.clone().sub(v0);

      let deltaUV1 = uv1.clone().sub(uv0);
      let deltaUV2 = uv2.clone().sub(uv0);

      let r = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);
      let tangent = deltaPos1.clone().multiplyScalar(deltaUV2.y).sub(deltaPos2.clone().multiplyScalar(deltaUV1.y));
      let bitangent = deltaPos2.clone().multiplyScalar(deltaUV1.x).sub(deltaPos1.clone().multiplyScalar(deltaUV2.x));

      tangent.multiplyScalar(r);
      bitangent.multiplyScalar(r);

      tangents[a * 3] = tangent.x;
      tangents[a * 3 + 1] = tangent.y;
      tangents[a * 3 + 2] = tangent.z;

      tangents[b] = tangent.x;
      tangents[b * 3 + 1] = tangent.y;
      tangents[b * 3 + 2] = tangent.z;

      tangents[c * 3] = tangent.x;
      tangents[c * 3 + 1] = tangent.y;
      tangents[c * 3 + 2] = tangent.z;

      bitangents[a * 3] = bitangent.x;
      bitangents[a * 3 + 1] = bitangent.y;
      bitangents[a * 3 + 2] = bitangent.z;

      bitangents[b * 3] = bitangent.x;
      bitangents[b * 3 + 1] = bitangent.y;
      bitangents[b * 3 + 2] = bitangent.z;

      bitangents[c * 3] = bitangent.x;
      bitangents[c * 3 + 1] = bitangent.y;
      bitangents[c * 3 + 2] = bitangent.z;
    }

    this._geometry.addAttribute('tangent', new THREE.BufferAttribute(tangents, 3));
    this._geometry.addAttribute('bitangent', new THREE.BufferAttribute(bitangents, 3));
  }

  get texture() { return this._renderTarget.texture; }
}