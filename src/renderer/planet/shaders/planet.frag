#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

uniform sampler2D earthMaskMap;
uniform sampler2D earthHeightMap;
uniform sampler2D earthNormalMap;
uniform sampler2D earthColorMap;
uniform vec3 sunPosition;
uniform float time;

varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vNormal;
varying vec3 vPosition;



vec3 phong(vec3 ka, vec3 kd, vec3 ks, float alpha, vec3 normal) {
    vec3 n = normalize( normal );
    vec3 s = normalize( vPosition - sunPosition );
    vec3 v = normalize( vPosition - cameraPosition );
    vec3 r = reflect( -s, n );

    vec3 ambient = ka;
    vec3 diffuse = max(0.0, dot(normalize(sunPosition), normal)) * kd;
    vec3 specular = pow(max(dot(r,v), 0.0), alpha) * ks;

    return ambient + diffuse + specular;
}

vec3 water() {
    vec3 ambient = vec3(0.0);
    vec3 diffuse = vec3(0.0, 0.05, 0.1);
    vec3 specular = vec3(0.5, 0.5, 0.5);

    float offset = 1.0 / 2048.0;
    float waterFreq = 6.0;
    float waterSpeed = 0.2;

    float ds1 = snoise3(vPosition * waterFreq + vec3(time * waterSpeed) + offset * vTangent) - snoise3(vPosition * waterFreq + vec3(time * waterSpeed) - offset * vTangent);
    float dt1 = snoise3(vPosition * waterFreq + vec3(time * waterSpeed) + offset * vBitangent) - snoise3(vPosition * waterFreq + vec3(time * waterSpeed) - offset * vBitangent);

    float mediumWaterFreq = 3.0;
    float mediumWaterSpeed = 0.4;

    float ds2 = snoise3(vPosition * mediumWaterFreq - vec3(time * mediumWaterSpeed) + offset * vTangent) - snoise3(vPosition * mediumWaterFreq - vec3(time * mediumWaterSpeed) - offset * vTangent);
    float dt2 = snoise3(vPosition * mediumWaterFreq - vec3(time * mediumWaterSpeed) + offset * vBitangent) - snoise3(vPosition * mediumWaterFreq - vec3(time * mediumWaterSpeed) - offset * vBitangent);

    float largeOffset = 1.0 / 1500.0;
    float largeWaterFreq = 0.5;
    float largeWaterSpeed = 0.1;

    float ds3 = snoise3(vPosition * largeWaterFreq - vec3(time * largeWaterSpeed) + largeOffset * vTangent) - snoise3(vPosition * largeWaterFreq - vec3(time * largeWaterSpeed) - largeOffset * vTangent);
    float dt3 = snoise3(vPosition * largeWaterFreq - vec3(time * largeWaterSpeed) + largeOffset * vBitangent) - snoise3(vPosition * largeWaterFreq - vec3(time * largeWaterSpeed) - largeOffset * vBitangent);

    vec3 newNormal = normalize(vNormal + 5.0 * (ds1 + ds2 + ds3) * vTangent + 5.0 * (dt1 + dt2 + dt3) * vBitangent);

    return phong(ambient, diffuse, specular, 6.0, newNormal);
}

vec3 land() {
    vec3 ambient = texture2D(earthColorMap, vUv).rgb * 0.1;
    vec3 diffuse = texture2D(earthColorMap, vUv).rgb * 0.5;
    vec3 specular = vec3(0.05);

    float offset = 1.0 / 4096.0;
    vec4 ds = texture2D(earthHeightMap, vUv + vec2(offset, 0)) - texture2D(earthHeightMap, vUv + vec2(-offset,0));
    vec4 dt = texture2D(earthHeightMap, vUv + vec2(0, offset)) - texture2D(earthHeightMap, vUv + vec2(0,-offset));

    vec3 newNormal = normalize(vNormal + ds.x * vTangent + dt.x * vBitangent);

    return phong(ambient, diffuse, specular, 6.0, newNormal);
}

void main() {
    vec3 earthMaskMapClr = texture2D(earthMaskMap, vUv).xyz;

    //gl_FragColor = vec4(normalize(vTangent), 1.0);

    // Water
    if (length(earthMaskMapClr) < 0.2) {
        gl_FragColor = vec4(land(), 1.0);
    }
    // Land
    else {
        gl_FragColor = vec4(water(), 1.0);
    }


}