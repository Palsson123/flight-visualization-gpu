uniform sampler2D earthMaskMap;
uniform sampler2D earthHeightMap;
uniform sampler2D earthNormalMap;
uniform vec3 sunPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vSunPosition;

//vec3 mod289(vec3 x) {
//  return x - floor(x * (1.0 / 289.0)) * 289.0;
//}
//
//vec2 mod289(vec2 x) {
//  return x - floor(x * (1.0 / 289.0)) * 289.0;
//}
//
//vec3 permute(vec3 x) {
//  return mod289(((x*34.0)+1.0)*x);
//}
//
//float snoise(vec2 v)
//  {
//  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
//                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
//                     -0.577350269189626,  // -1.0 + 2.0 * C.x
//                      0.024390243902439); // 1.0 / 41.0
//// First corner
//  vec2 i  = floor(v + dot(v, C.yy) );
//  vec2 x0 = v -   i + dot(i, C.xx);
//
//// Other corners
//  vec2 i1;
//  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
//  //i1.y = 1.0 - i1.x;
//  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//  // x0 = x0 - 0.0 + 0.0 * C.xx ;
//  // x1 = x0 - i1 + 1.0 * C.xx ;
//  // x2 = x0 - 1.0 + 2.0 * C.xx ;
//  vec4 x12 = x0.xyxy + C.xxzz;
//  x12.xy -= i1;
//
//// Permutations
//  i = mod289(i); // Avoid truncation effects in permutation
//  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//		+ i.x + vec3(0.0, i1.x, 1.0 ));
//
//  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
//  m = m*m ;
//  m = m*m ;
//
//  vec3 x = 2.0 * fract(p * C.www) - 1.0;
//  vec3 h = abs(x) - 0.5;
//  vec3 ox = floor(x + 0.5);
//  vec3 a0 = x - ox;
//  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//
//  vec3 g;
//  g.x  = a0.x  * x0.x  + h.x  * x0.y;
//  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//  return 130.0 * dot(m, g);
//}

vec3 phong(vec3 ka, vec3 kd, vec3 ks, float alpha, vec3 normal) {
    vec3 n = normalize( normal );
    vec3 s = normalize( vPosition - vSunPosition );
    vec3 v = normalize( vPosition - cameraPosition );
    vec3 r = reflect( -s, n );

    vec3 ambient = ka;
    vec3 diffuse = max(0.0, dot(normalize(vSunPosition), normal)) * kd;
    vec3 specular = pow(max(dot(r,v), 0.0), alpha) * ks;

    return ambient + diffuse + specular;
}

vec3 water() {
    vec3 ambient = vec3(0.05);
    vec3 diffuse = vec3(0.0, 0.1, 0.2);
    vec3 specular = vec3(0.2, 0.2, 0.1);
    vec3 newNormal = normalize((texture2D(earthNormalMap, vUv).xyz - 0.5) * 2.0);

    return phong(ambient, diffuse, specular, 30.0, vNormal);
}

vec3 land() {
    vec3 newNormal = (texture2D(earthNormalMap, vUv).xyz - 0.5) * 2.0;
    vec3 diffuse = max(0.0, dot(normalize(vSunPosition), vNormal)) * vec3(0.0, 0.05, 0.05);

    return diffuse;
}

void main() {
    vec3 earthMaskMapClr = texture2D(earthMaskMap, vUv).xyz;

    // Water
    if (length(earthMaskMapClr) < 0.2) {
        gl_FragColor = vec4(land(), 1.0);
    }
    // Land
    else {
        gl_FragColor = vec4(water(), 1.0);
    }
}