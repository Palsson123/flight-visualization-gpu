precision highp float;

uniform sampler2D flightTrail;
uniform sampler2D accumulatedFlightTrail;
uniform vec2 size;
uniform float cameraHasUpdated;

varying vec2 vUv;

void main(void) {
    vec3 currentFlights = texture2D(flightTrail, vUv).xyz;
    vec3 flightTrail = texture2D(accumulatedFlightTrail, vUv).xyz * vec3(0.99, 0.98, 0.97);

    if (cameraHasUpdated == 1.0) {
        flightTrail = vec3(0,0,0);
    }

    gl_FragColor = vec4(currentFlights + flightTrail, 1.0);
}