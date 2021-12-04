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

vec3 ApplyBumpNormalMap(vec3 bump_texture, vec3 normal)
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

vec3 ProceduralTextureApply(vec3 vPosition)
{
  // Procedurally produce a texture
  // only on areas without decal
  vec3 proc_primary_color = vec3(0.22,0.55,0.77);
  vec3 proc_secondary_color = vec3(0.77,0.55,0.22);
  vec3 dist_threshold = vec3(0.25, 0.25, 0.25);
  vec3 dist_mult = vec3(128.0, 32.0,64.0);
  vec3 procPos = vPosition * dist_mult;
  
  vec3 dot_mix = vec3(
    max(1.0 - max(distance(floor(procPos.x), round(procPos.x)) - dist_threshold.x, 0.0), 0.0),
    max(1.0 - max(distance(procPos.y, round(procPos.y)) - dist_threshold.y, 0.0), 0.0),
    max(1.0 - max(distance(floor(procPos.z), round(procPos.z)) - dist_threshold.z, 0.0), 0.0)
  );
  float proc_strength = 10.0;
  // proc_primary_color =  mix(vec3(0.0,0.0,0.0), proc_primary_color, IsolateSpout(vPosition) * max((dot_mix - dot_mix.yyy).z * dot_mix.x, 0.0)) * proc_strength;
  // proc_secondary_color = mix(vec3(0.0,0.0,0.0), proc_secondary_color, IsolateHandle(vPosition) * max((dot_mix*2.0 - dot_mix.yyy).x * dot_mix.z, 0.0)) * proc_strength;
  return IsolateSpout(vPosition) * max((dot_mix - dot_mix.yyy).z * dot_mix.x, 0.0) * proc_strength +
         IsolateHandle(vPosition) * max((dot_mix*0.4 - dot_mix.zzz).y * dot_mix.y, 0.0) * proc_strength;//proc_secondary_color; //+ proc_secondary_color;
}


void main() {

  // Normalize passed in vec3
  vec3 n2 = normalize(n);
  vec3 l2 = normalize(l);
  vec3 v2 = normalize(v);
  
  // Calculate cylinder coordinate and apply diffuse
  vec2 cylinderTexCoord = GetCylinderTextureCoordinates(vPosition);
  vec3 diffuse_texture = vec3(texture(uSampler, cylinderTexCoord));  
  
  // Calculate updated normal from normal map
  vec3 bump_texture = vec3(texture(uSampler3, cylinderTexCoord));
  vec3 nprime = ApplyBumpNormalMap(bump_texture, n2);
  
  // Calculate the diffuse and specular values
  float diffuse_value = max(dot(nprime,-l2)-0.5,0.0);
  vec3 r = (2.0 * max(dot(-l2,nprime),0.0) * nprime - l2);
  float specular_power = 10.0;
  float specular_offset = 0.005;
  float specular_value = pow(max(dot(v2, r), 0.0), specular_power)/specular_power * specular_offset;
  
  // Calculate sphere coordinates and apply Reflectance
  vec2 sphereTexCoord = GetSphericalTextureCoordinates(nprime);
  vec3 reflectence_texture = vec3(texture(uSampler2, sphereTexCoord));

  
  // Calculate color components (extended Phong shading)
  
  vec4 color_mix_amount = vec4(0.25, 0.25, 0.25, 0.1);
  
  vec3 diffuse_color = diffuse_texture * (diffuse_value + color_mix_amount.x);
  vec3 procedural_color = vec3(1.0,0.5,0.25) * ProceduralTextureApply(vPosition) * (color_mix_amount.y);
  vec3 reflectence_color = reflectence_texture * color_mix_amount.z;
  vec3 ambient_color = vec3(1.0,1.0,1.0) * color_mix_amount.w;
  
  vec3 specular_color = vec3(1.0,1.0,0.75) * specular_value;
  
  // Combine all the colors
  vec3 color = diffuse_color + procedural_color + reflectence_color + specular_color + ambient_color;
  // color = procedural_color;//specular_color * specular_value;//vec3(1.0,0.0,0.0)*specular_value;//sin(procPos).rrr;//proc_main_color*((dot_mix.x+dot_mix.z)*0.5*dot_mix.y);//r * specular_value;//subsurf_color.rrr;

  outColor = 1.0*vec4(color,1.0);
}
`