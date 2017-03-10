uniform sampler2D departurePositions;
uniform sampler2D delayTimes;
uniform sampler2D positions;
uniform float visualizeDelay;
varying vec2 vUv;
varying float alpha;

void main() {
    vec3 delay = texture2D(delayTimes, vUv).xyz;

    if (visualizeDelay == 1.0) {
        float arrivalDelay = delay.y;
        float arrivalColor = 0.5 + clamp(arrivalDelay / 60.0, -0.5, 0.5);
        gl_FragColor = vec4( vec3(arrivalColor, 0.6 * (1.0 - arrivalColor), 0.1), .9 );
    }
    else {
        gl_FragColor = vec4(1.0,1.0,0.6,0.5);
    }


}