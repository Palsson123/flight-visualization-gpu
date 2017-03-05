uniform sampler2D departurePositions;
uniform sampler2D positions;
varying vec2 vUv;
varying float alpha;

void main() {
    gl_FragColor = vec4( vec3(1.0, 1.0, 0.6), .4 ) * alpha;
}