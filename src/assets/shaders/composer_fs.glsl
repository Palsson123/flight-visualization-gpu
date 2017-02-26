precision highp float;

uniform sampler2D planet;
uniform sampler2D flights;
uniform sampler2D flightsGlow;
uniform sampler2D map;
uniform sampler2D sun;
uniform sampler2D countryBorders;
uniform vec2 size;

varying vec2 vUv;

void main(void) {
//    vec3 flightsColor =
//    texture2D( flights, vUv + vec2(4,0) / size ).xyz +
//    texture2D( flights, vUv ).xyz +
//    texture2D( flights, vUv + vec2(-4,0) / size ).xyz;

    vec3 planetColor = texture2D( planet, vUv ).xyz;
    vec3 flightsColor = texture2D( flights, vUv ).xyz;
    vec3 glowColor = texture2D( flightsGlow, vUv ).xyz;
    vec3 mapColor = texture2D( map, vUv ).xyz;
    vec3 sunColor = texture2D( sun, vUv ).xyz;
    vec3 borderColor = texture2D( countryBorders, vUv ).xyz;

    gl_FragColor = vec4(planetColor + flightsColor + glowColor + mapColor + sunColor + borderColor, 1.0);
}