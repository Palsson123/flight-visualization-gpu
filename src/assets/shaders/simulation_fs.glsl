//basic simulation: displays the particles in place.
uniform sampler2D positions;
uniform sampler2D departurePositions;
uniform sampler2D midPointPositions;
uniform sampler2D arrivalPositions;

varying vec2 vUv;
void main() {
    vec3 pos = texture2D( departurePositions, vUv ).rgb;
    gl_FragColor = vec4( pos, 1.0 );
}