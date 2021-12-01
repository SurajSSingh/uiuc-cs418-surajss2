// var frac_shader = glsl`#version 300 es
var frac_shader = `#version 300 es
#define PI 3.1415926535897932384626433832795

precision mediump float;
    
in vec2 vTexCoord;
in vec3 vNormal,vPosition;
in vec3 n,l,v;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

out vec4 outColor;
    
void main() {
  
  // Calculate cylinder coordinate and apply diffuse
  vec2 cylinderTexCoord = vec2(0.0,0.0);
  cylinderTexCoord.s = clamp((-atan(vPosition.z, vPosition.x))/(2.0*PI)+0.5,0.05,0.95);
  cylinderTexCoord.t = smoothstep(0.15,0.85,vPosition.y + 0.5);
  vec3 diffuse_texture = vec3(texture(uSampler, cylinderTexCoord));
  vec3 diffuse_change = dFdx(diffuse_texture) + dFdy(diffuse_texture);
  
  vec3 n2 = normalize(n);
  vec3 l2 = normalize(l);
  vec3 v2 = normalize(v);
  // Calculate normal from bump map
  vec3 bump_texture = vec3(texture(uSampler3, cylinderTexCoord));
  
  vec3 ps = dFdx(cylinderTexCoord.sss);
  vec3 pt = dFdy(cylinderTexCoord.ttt);
  vec2 bumpMult = vec2(128.0, 256.0);
  float dBds = dFdx(bump_texture).x * bumpMult.x;
  float dBdt= dFdy(bump_texture).y * bumpMult.y;
  
  vec3 nprime = (n2 - dBds * cross(n2, pt) + dBdt * cross(n2, ps));
  vec3 r = reflect(l2,nprime);//(2.0 * max(dot(l2,n2),0.0) * nprime - l2);
  float specular_value = pow(max(dot(v2, r), 0.0), 10.0);
  float diffuse_value = max(dot(nprime,-l2)-0.5,0.0);
  
  // Calculate Reflectance
  vec2 sphereTexCoord = vec2(0.0,0.0);
  sphereTexCoord.s = (nprime.x+1.0)/2.0;
  sphereTexCoord.t = (nprime.y+1.0)/2.0;
  vec3 reflectence_texture = vec3(texture(uSampler2, sphereTexCoord));
  
  // Calculate color components for Phong shading
  vec4 color_mix_amount = vec4(0.25, 0.25, 0.25, 0.25);
  vec3 diffuse_color = diffuse_texture * (diffuse_value + color_mix_amount.x);
  vec3 specular_color = vec3(1.0,1.0,1.0) * specular_value * color_mix_amount.y;
  vec3 reflectence_color = reflectence_texture * color_mix_amount.z;
  vec3 ambient_color = vec3(1.0,1.0,1.0) * color_mix_amount.w;
  vec3 color = diffuse_color + reflectence_color + specular_color + ambient_color;
  outColor = 1.0*vec4(color,1.0);
}
`