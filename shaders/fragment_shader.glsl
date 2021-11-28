#version 300 es

precision mediump float;
    
in vec3 vNormal;
in vec2 vTexCoord;
in vec3 n,l,v;
uniform sampler2D uSampler;
uniform sampler2D uSampler2;

out vec4 outColor;
    
void main() {
  vec3 illinois = vec3(texture(uSampler, vTexCoord));
  vec3 stadium = vec3(texture(uSampler2, vTexCoord));
  vec3 c = 0.5*illinois + 0.5*stadium;

  vec3 n2 = normalize(n);
  vec3 l2 = normalize(l);
  vec3 v2 = normalize(v);

  vec3 diffuse_color = illinois;//vec3(1.0, 0.0, 0.0);
  vec3 specular_color = stadium;//vec3(1.0, 1.0, 1.0);

  float diffuse_value = max(dot(n2,l2),0.0);
  vec3 r = (2.0 * max(dot(l2,n2),0.0) * n2 - l2);
  float specular_value = pow(max(dot(v2, r), 0.0), 9.0);

  vec3 diffuse = diffuse_value*diffuse_color * 0.5 * specular_color;
  vec3 specular = diffuse_value * specular_color * 1.0 * specular_color;
  vec3 ambient = vec3(1.0, 1.0, 1.0);
  c = 0.5*diffuse+0.2*specular+0.3*ambient;

  outColor = 1.0*vec4(c,1.0);
}