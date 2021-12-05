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

vec3 GetBumpNormalMap(vec3 bump_texture, vec3 normal)
{
  float normalPower = bump_texture.z;
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 pt = (cross(up, normal));
  vec3 ps = (cross(pt, normal));
  float dBds = bump_texture.x-0.5;
  float dBdt = bump_texture.y-0.5;

  return (normal - dBds * cross(normal, pt) + dBdt * cross(normal, ps)) * normalPower;
}

vec3 IsolateSpout(vec3 vPosition)
{
  return vec3(1.0, 1.0, 1.0) * clamp((vPosition.xxx - 0.263) * 100.0, 0.0, 1.0);
}

vec3 IsolateHandle(vec3 vPosition)
{
  return vec3(1.0, 1.0, 1.0) * clamp((-vPosition.xxx - 0.3) * 8.0, 0.0, 1.0);
}

vec2 GetCylinderTextureCoordinates(vec3 pos)
{
  return vec2(
    clamp((-atan(pos.z, pos.x))/(2.0*PI)+0.5,0.05,0.95),
    smoothstep(0.15,0.85,pos.y + 0.5)
  );
}

vec2 GetSphericalTextureCoordinates(vec3 pos)
{
  return vec2(
    (pos.x+1.0)/2.0,
    (pos.y+1.0)/2.0
  );
}

vec3 ProceduralTextureApply(vec3 vPosition, vec3 proc_primary_color, vec3 proc_secondary_color)
{
  // Procedurally produce a texture
  // only on areas without decal
  vec3 dist_threshold = vec3(0.25, 0.25, 0.25);
  vec3 dist_mult = vec3(128.0, 32.0,64.0);
  vec3 procPos = vPosition * dist_mult;
  
  vec3 dot_mix = vec3(
    max(1.0 - max(distance(floor(procPos.x), round(procPos.x)) - dist_threshold.x, 0.0), 0.0),
    max(1.0 - max(distance(procPos.y, round(procPos.y)) - dist_threshold.y, 0.0), 0.0),
    max(1.0 - max(distance(floor(procPos.z), round(procPos.z)) - dist_threshold.z, 0.0), 0.0)
  );
  float proc_strength = 10.0;

  // Apply procedural color to spout area only
  vec3 spout_area = IsolateSpout(vPosition);
  vec3 spout_area_main = spout_area * max((dot_mix - dot_mix.yyy).z * dot_mix.x, 0.0) * proc_strength;
  vec3 spout_area_scnd = (1.0-spout_area_main) * spout_area;
  vec3 spoutColor = proc_primary_color * spout_area_main + proc_secondary_color * spout_area_scnd;
  
  // Apply different procedural color to handle area only
  vec3 handle_area = IsolateHandle(vPosition);
  vec3 handle_area_main = handle_area * max((dot_mix*0.4 - dot_mix.zzz).y * dot_mix.y, 0.0) * proc_strength;
  vec3 handle_area_scnd = (1.0-handle_area_main) * handle_area;
  vec3 handleColor = proc_primary_color * handle_area_main + proc_secondary_color * handle_area_scnd;

  // Return combined colors
  return spoutColor + handleColor;
}


void main() {

  // Normalize passed in vec3
  vec3 n2 =  normalize(n);
  vec3 l2 = -normalize(l);
  vec3 v2 =  normalize(v);
  
  // Calculate cylinder coordinate and apply diffuse
  vec2 cylinderTexCoord = GetCylinderTextureCoordinates(vPosition);
  vec3 diffuse_texture = vec3(texture(uSampler, cylinderTexCoord));  
  
  // Calculate updated normal from normal map
  vec3 bump_texture = vec3(texture(uSampler3, cylinderTexCoord));
  vec3 nprime = GetBumpNormalMap(bump_texture, n2);
  
  // Calculate the diffuse and specular values
  float diffuse_value = max(dot(nprime,l2)-0.5,0.0);
  vec3 r = (2.0 * max(dot(l2,nprime),0.0) * nprime + l2);
  float specular_power = 10.0;
  float specular_offset = 0.005;
  float specular_value = pow(max(dot(v2, r), 0.0), specular_power)/specular_power * specular_offset;
  
  // Calculate sphere coordinates and apply Reflectance
  vec2 sphereTexCoord = GetSphericalTextureCoordinates(nprime);
  vec3 reflectence_texture = vec3(texture(uSampler2, sphereTexCoord));
  
  
  // Calculate color components (extended Phong shading)
  
  vec4 color_mix_amount = vec4(0.25, 0.25, 0.25, 0.1);
  
  vec3 diffuse_color = diffuse_texture * (diffuse_value + color_mix_amount.x);
  vec3 procedural_color = ProceduralTextureApply(vPosition, vec3(1.0,0.5,0.25), vec3(0.25,0.5,1.0)) * (color_mix_amount.y);
  vec3 reflectence_color = reflectence_texture * color_mix_amount.z;
  vec3 ambient_color = vec3(1.0,1.0,1.0) * color_mix_amount.w;
  
  vec3 specular_color = vec3(1.0,1.0,0.75) * specular_value;
  
  // Combine all the colors
  vec3 color = diffuse_color + procedural_color + reflectence_color + specular_color + ambient_color;

  outColor = 1.0*vec4(color,1.0);
}
`