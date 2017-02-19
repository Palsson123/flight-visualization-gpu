uniform sampler2D departurePositions;
uniform sampler2D positions;
varying vec2 vUv;

void main() {
    gl_FragColor = vec4( vec3(1.0, 1.0, 0.45), .001 );

    vec3 pos = texture2D( positions, vUv.xy ).xyz;
    if (pos.x == 0.0 && pos.y == 0.0 && pos.z == 0.0) {
        gl_FragColor.a = 0.0;
    }
}