//#include <clipping_planes_pars_vertex>
//#include <clipping_planes_vertex>
#include <clipping_planes_pars_fragment>

uniform sampler2D shadowsTexture;
uniform sampler2D shadowsNearTexture;
uniform float nearThreshold;



in vec3 shadowTexPos;
in vec3 shadowNearTexPos;

in vec3 pos_world;
uniform vec3 u_color;
uniform float shadowIntensity;

uniform sampler2D u_upper_tex;
uniform sampler2D u_lower_tex;
uniform sampler2D u_middle_tex;
uniform sampler2D details_tex;
uniform sampler2D details_tex_snow;
uniform sampler2D details_tex_grass;



uniform float threshold;
uniform float snow_details_intensive;
uniform float stone_details_intensive;
uniform float grass_details_intensive;
uniform float snow_details_freq;
uniform float stone_details_freq;
uniform float grass_details_freq;


varying float brightness;
varying vec2 vUV;

varying float distToCamera;

void main()
{
  #include <clipping_planes_fragment>

  vec4 stone_details = vec4(1.0, 1.0, 1.0, 1.0);
  vec4 snow_details = vec4(1.0, 1.0, 1.0, 1.0);
  vec4 grass_details = vec4(1.0, 1.0, 1.0, 1.0);

  if (distToCamera < threshold) {
    stone_details = stone_details_intensive * texture2D(details_tex, vUV * stone_details_freq);
    snow_details = snow_details_intensive * texture2D(details_tex_snow, vUV * snow_details_freq);
    grass_details = grass_details_intensive * texture2D(details_tex_grass, vUV * grass_details_freq);
  }

  vec4 lower = (smoothstep(-1.0, 0.27, brightness) - smoothstep(0.28, 0.31, brightness)) * texture2D( u_lower_tex, vUV * 10.0 ) * grass_details;
  vec4 middle = (smoothstep(0.30, 0.50, brightness) - smoothstep(0.40, 0.70, brightness)) * texture2D( u_middle_tex, vUV * 20.0 ) * stone_details;
  vec4 upper = (smoothstep(0.50, 0.65, brightness)) * texture2D( u_upper_tex, vUV * 10.0 ) * snow_details;

  float shadowCoeff = 1.0;

  gl_FragColor = (vec4(0.0, 0.0, 0.0, 1.0) + lower  + middle + upper);

  vec3 texCoords = distToCamera < nearThreshold ? shadowNearTexPos : shadowTexPos;
//  vec3 texCoords = shadowTexPos;
  if (texCoords.x >= 0.0 && texCoords.x <= 1.0 && texCoords.y >= 0.0 && texCoords.y <= 1.0) {

    float res = distToCamera < nearThreshold ?
    texture2D(shadowsNearTexture, texCoords.xy).x : texture2D(shadowsTexture, texCoords.xy).x;
//    float res = texture2D(shadowsTexture, texCoords.xy).x;

    if (res < (texCoords.z - 0.01)) {
      gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), gl_FragColor, 0.4);
    }
    //    else if (res - shadowTexPos.z < 0.0001 || res - shadowTexPos.z > 0.0001) {
    //      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    //    }
  }


}