precision highp float;

uniform sampler2D currentLine;
uniform sampler2D accumulatedLineTrail;
uniform vec2 size;
uniform float cameraUpdated;

varying vec2 vUv;

void main(void) {
    vec3 currentLineClr = texture2D(currentLine, vUv).xyz;
    vec3 lineTrail = texture2D(accumulatedLineTrail, vUv).xyz * vec3(0.99, 0.98, 0.97) * 1.0;

    gl_FragColor = vec4(currentLineClr + lineTrail, 1.0) * (1.0 - cameraUpdated);
}