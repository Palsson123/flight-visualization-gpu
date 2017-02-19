precision highp float;

uniform sampler2D flights;
uniform sampler2D flightsGlow;
uniform sampler2D map;
uniform vec2 size;

varying vec2 vUv;

void main(void) {
//    vec3 flightsColor =
//    texture2D( flights, vUv + vec2(4,0) / size ).xyz +
//    texture2D( flights, vUv ).xyz +
//    texture2D( flights, vUv + vec2(-4,0) / size ).xyz;

    vec3 flightsColor = texture2D( flights, vUv ).xyz;
    vec3 glowColor = texture2D( flightsGlow, vUv ).xyz;
    vec3 mapColor = texture2D( map, vUv ).xyz;

    gl_FragColor = vec4(flightsColor + glowColor + mapColor, 1.0);
}