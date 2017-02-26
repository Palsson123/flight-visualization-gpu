precision highp float;

uniform sampler2D planet;
uniform sampler2D planetGlow;
uniform sampler2D flights;
uniform sampler2D flightsGlow;
uniform sampler2D stars;
uniform sampler2D map;
uniform sampler2D sun;
uniform sampler2D countryBorders;
uniform vec2 size;

varying vec2 vUv;

void main(void) {
    vec3 planetColor = texture2D( planet, vUv ).xyz;
    vec3 planetGlowColor = texture2D( planetGlow, vUv ).xyz;
    vec3 flightsColor = texture2D( flights, vUv ).xyz;
    vec3 glowColor = texture2D( flightsGlow, vUv ).xyz;
    vec3 mapColor = texture2D( map, vUv ).xyz;
    vec3 sunColor = texture2D( sun, vUv ).xyz;
    vec3 borderColor = texture2D( countryBorders, vUv ).xyz;
    vec3 starsColor = texture2D( stars, vUv ).xyz;

    gl_FragColor = vec4(0.1 * planetGlowColor + planetColor + starsColor + flightsColor + glowColor + mapColor + sunColor + borderColor, 1.0);
}