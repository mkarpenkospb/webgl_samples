//#include <clipping_planes_pars_vertex>
//#include <clipping_planes_vertex>
#include <clipping_planes_pars_fragment>

uniform sampler2D shadowsTexture;
in vec3 pos_world;
in vec3 out_normal;
in vec2 vUV;
in vec3 shadowTexPos;

uniform sampler2D u_color;

uniform int shadowRender;

void main()
{
    #include <clipping_planes_fragment>
    gl_FragColor = vec4(texture2D(u_color, vUV).rgb, 1.0);
}