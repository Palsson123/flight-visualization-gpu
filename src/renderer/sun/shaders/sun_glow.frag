#pragma glslify: blur = require("glsl-fast-gaussian-blur/13")

uniform vec2 resolution;
uniform sampler2D inputTexture;
uniform vec2 direction;

varying vec2 vUv;

void main() {
  vec2 uv = vec2(gl_FragCoord.xy / resolution.xy);
  gl_FragColor = blur(inputTexture, uv, resolution.xy, direction);
}