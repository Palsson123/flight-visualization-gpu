#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

varying vec2 vUv;
varying vec3 vPosition;

uniform float time;

void main() {
    float height = abs(snoise3(0.3 * vPosition + vec3(time * 1.0)));
    gl_FragColor = vec4(height * vec3(3.0, 3.0, 2.0) + vec3(1.0, 0.7, 0.5), 1.0);
}