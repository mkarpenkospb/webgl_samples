//#include <clipping_planes_pars_vertex>
//#include <clipping_planes_vertex>
#include <clipping_planes_pars_fragment>

uniform sampler2D shadowsTexture;
in vec3 pos_world;
in vec3 out_normal;
in vec2 vUV;
in vec3 shadowTexPos;

uniform sampler2D u_color;


void main()
{
    #include <clipping_planes_fragment>
    gl_FragColor = vec4(texture2D(u_color, vUV).rgb, 1.0);
    if (shadowTexPos.x >= 0.0 && shadowTexPos.x <= 1.0 && shadowTexPos.y >= 0.0 && shadowTexPos.y <= 1.0) {
        float res = texture2D(shadowsTexture, shadowTexPos.xy).r;
        if (res < (shadowTexPos.z - 0.001)) {
            gl_FragColor = mix(vec4(res, res, res, 1.0), gl_FragColor, 0.4);
        }
    }
}