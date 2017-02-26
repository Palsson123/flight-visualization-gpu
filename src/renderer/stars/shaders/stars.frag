#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    float noise = pow(snoise3(vPosition), 15.0);
    gl_FragColor = vec4(vec3(1.0 * noise), 1.0);
}