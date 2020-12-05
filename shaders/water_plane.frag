in vec3 out_normal;
in vec3 pos_world;
in vec2 vUV;
uniform samplerCube u_scene_reflect;
uniform samplerCube u_scene_refract;

uniform sampler2D normal_map;

uniform float n_water;
uniform float n_air;

void main()
{

  vec3 sampleNormal = texture(normal_map, vUV * 20.0).rgb;
//  vec3 Normal = normalize(vec3(sampleNormal.r * 2.0 - 1.0, sampleNormal.b, sampleNormal.g * 2.0 - 1.0));
  vec3 Normal = normalize(vec3(sampleNormal.r * 2.0 - 1.0, sampleNormal.b, sampleNormal.g * 2.0 - 1.0));
  vec3 i = normalize(pos_world - cameraPosition);
  vec3 r = reflect(i, Normal);
  vec3 t = refract(i, Normal, n_air / n_water);
  float refractiveFactor = dot(-i, Normal);

//  float cosi = dot(-i, out_normal); // = |n| * |i| * cos = 1 * 1 * cos = cos, с -i он хотя бы не должен стать отрицательным
//  float sin2t = pow(n_air / n_water, 2.0) * (1.0 - pow(cosi, 2.0));
//  float cost = pow(1.0 - sin2t, 0.5);
//
//  float R1 = pow((n_air * cosi - n_water * cost) / (n_air * cosi + n_water * cost), 2.0);
//  float R2 = pow((n_water * cosi - n_air * cost) / (n_water * cosi + n_air * cost), 2.0);
//  float R = (R1 + R2) / 2.0;
//  bool TIR = sin2t > 1.0;
//  if (TIR) { R = 1.0;}
//  float T = 1.0 - R;
//
//
  
  gl_FragColor = vec4(mix(texture(u_scene_reflect, r).rgb, texture(u_scene_refract, t).rgb, refractiveFactor), 1.0);
  gl_FragColor = mix(gl_FragColor,  vec4(0.0, 0.3, 0.7, 1.0), 0.2);
//  gl_FragColor = vev4(texture(normal_map, ))
}