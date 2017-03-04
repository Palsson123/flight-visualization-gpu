uniform sampler2D planet;
uniform sampler2D flights;
uniform sampler2D stars;
uniform sampler2D map;
uniform sampler2D sun;
uniform sampler2D countryBorders;
uniform sampler2D timeline;
uniform sampler2D glow;
uniform vec2 size;

varying vec2 vUv;

void main(void) {
    vec3 planetColor = texture2D( planet, vUv ).xyz;
    vec3 flightsColor = texture2D( flights, vUv ).xyz;
    vec3 mapColor = texture2D( map, vUv ).xyz;
    vec3 sunColor = texture2D( sun, vUv ).xyz;
    vec3 borderColor = texture2D( countryBorders, vUv ).xyz;
    vec3 starsColor = texture2D( stars, vUv ).xyz;
    vec3 glowColor = texture2D( glow, vUv ).xyz;
    vec3 timelineColor = texture2D( timeline, vUv ).xyz;

    gl_FragColor = vec4(glowColor + 0.1 * timelineColor + planetColor + starsColor + flightsColor + mapColor + sunColor + borderColor, 1.0);
}