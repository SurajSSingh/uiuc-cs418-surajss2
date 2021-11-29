// var vert_shader = glsl`#version 300 es
var vert_shader = `#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;
out vec3 vNormal, vPosition;
out vec3 n,l,v;

void main() {
  vPosition = aVertexPosition;
  vNormal = aVertexNormal;
  vTexCoord.s = aVertexPosition.x + 0.5;
  vTexCoord.t = aVertexPosition.y + 0.5;

  n = normalize(uNormalMatrix*aVertexNormal);
  l = normalize(uNormalMatrix*vec3(1.0,0.25,0.0));
  vec4 p = uModelViewMatrix*vec4(aVertexPosition, 1.0);
  v = normalize(-p.xyz);
  
  gl_Position = uProjectionMatrix*p;
}
`