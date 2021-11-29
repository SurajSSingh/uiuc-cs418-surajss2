// var frac_shader = glsl`#version 300 es
var frac_shader = `#version 300 es
#define PI 3.1415926535897932384626433832795

precision mediump float;
    
in vec2 vTexCoord;
in vec3 vNormal,vPosition;
in vec3 n,l,v;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

out vec4 outColor;
    
void main() {
  vec2 cylinderTexCoord = vec2(0.0,0.0);
  vec2 sphereTexCoord = vec2(0.0,0.0);
  cylinderTexCoord.s = (-atan(vPosition.z, vPosition.x)+0.5)/(2.0*PI);
  cylinderTexCoord.t = vPosition.y + 0.5;
  vec3 n2 = normalize(n);
  sphereTexCoord.s = (n2.x+1.0)/2.0;
  sphereTexCoord.t = (n2.y+1.0)/2.0;

  vec3 diffuse_texture = vec3(texture(uSampler, cylinderTexCoord));
  vec3 reflectence_texture = vec3(texture(uSampler2, sphereTexCoord));
  vec3 diffuse_color = diffuse_texture;
  vec3 specular_color = reflectence_texture;



  vec3 c = 0.5*diffuse_texture + 0.5*reflectence_texture;

  vec3 l2 = normalize(l);
  vec3 v2 = normalize(v);

  float diffuse_value = max(dot(n,l.yyy),0.0);
  vec3 r = (2.0 * max(dot(l2,n2),0.0) * n2 - l2);
  float specular_value = pow(max(dot(v2, r), 0.0), 9.0);

  vec3 diffuse = diffuse_value * diffuse_color * 0.5 * specular_value;
  vec3 specular = diffuse_value * specular_color * 1.0 * specular_value;
  vec3 ambient = vec3(1.0, 1.0, 1.0);
  c = specular_color; //+ diffuse_color + (ambient * diffuse_value) - 1.0;
  outColor = 1.0*vec4(c,1.0);
}
`