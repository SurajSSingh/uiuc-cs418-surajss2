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

  // Normalize passed in vec3
  vec3 n2 = normalize(n);
  vec3 l2 = normalize(l);
  vec3 v2 = normalize(v);
  
  // Calculate cylinder coordinate and apply diffuse
  vec2 cylinderTexCoord = vec2(0.0,0.0);
  cylinderTexCoord.s = clamp((-atan(vPosition.z, vPosition.x))/(2.0*PI)+0.5,0.05,0.95);
  cylinderTexCoord.t = smoothstep(0.15,0.85,vPosition.y + 0.5);
  vec3 diffuse_texture = vec3(texture(uSampler, cylinderTexCoord));  
  
  // Calculate normal from bump map
  vec3 bump_texture = vec3(texture(uSampler3, cylinderTexCoord));
  
  float bumpMult = bump_texture.x;
  vec3 up = vec3(1.0, 0.0, 0.0);
  vec3 ps = (cross(up, n2)) * bumpMult;
  vec3 pt = (cross(ps, n2)) * bumpMult;
  float dBds = bump_texture.y;
  float dBdt = bump_texture.z;
  
  vec3 nprime = n2 - dBds * cross(n2, pt) + dBdt * cross(n2, ps);
  // nprime = n2;
  // nprime = mix(nprime,nprime*bumpMult,bump_texture.x);
  
  // Calculate the reflection and specular values
  float diffuse_value = max(dot(nprime,-l2)-0.5,0.0);
  vec3 r = reflect(l2,nprime);//(2.0 * max(dot(l2,nprime),0.0) * nprime - l2);
  float specular_value = pow(max(dot(v2, r), 0.0), 5.0);
  
  // Calculate sphere coordinates and apply Reflectance
  vec2 sphereTexCoord = vec2(1.0,1.0);
  sphereTexCoord.s = (nprime.x+1.0)/2.0;
  sphereTexCoord.t = (nprime.y+1.0)/2.0;
  vec3 reflectence_texture = vec3(texture(uSampler2, sphereTexCoord));
  
  // Calculate color components for Phong shading
  vec4 color_mix_amount = vec4(0.25, 0.2, 0.25, 0.3);
  vec3 diffuse_color = diffuse_texture * (diffuse_value + color_mix_amount.x);
  vec3 specular_color = vec3(1.0,1.0,1.0) * (specular_value * color_mix_amount.y);
  vec3 reflectence_color = reflectence_texture * color_mix_amount.z;
  vec3 ambient_color = vec3(1.0,1.0,1.0) * color_mix_amount.w;
  vec3 color = diffuse_color + reflectence_color + specular_color + ambient_color;

  // color = diffuse_color;//r.zzz;

  outColor = 1.0*vec4(color,1.0);
}
`