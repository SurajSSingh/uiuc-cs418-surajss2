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
// n = normal
// l = light
// v = view 

void main() {
  vPosition = aVertexPosition;
  vNormal = aVertexNormal;
  vTexCoord.s = aVertexPosition.x + 0.5;
  vTexCoord.t = aVertexPosition.y + 0.5;

  float lightXPos = 1.5;
  float lightYPos = 2.0;
  float lightZPos = 1.5;


  n = uNormalMatrix*aVertexNormal;
  l = -vec3(lightXPos,lightYPos,lightZPos);
  vec4 p = uModelViewMatrix*vec4(aVertexPosition, 1.0);
  v = -p.xyz;
  
  gl_Position = uProjectionMatrix*p;
}
`