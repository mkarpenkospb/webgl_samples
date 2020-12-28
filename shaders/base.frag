//#include <clipping_planes_pars_vertex>
//#include <clipping_planes_vertex>
#include <clipping_planes_pars_fragment>

uniform sampler2D shadowsTexture;
uniform sampler2D shadowsNearTexture;
uniform float nearThreshold;

in vec3 pos_world;
in vec3 out_normal;
in vec2 vUV;
in vec3 shadowTexPos;
in vec3 shadowNearTexPos;

uniform sampler2D u_color;

varying float distToCamera;
void main()
{
    #include <clipping_planes_fragment>
    gl_FragColor = vec4(texture2D(u_color, vUV).rgb, 1.0);

    vec3 texCoords = distToCamera < nearThreshold ? shadowNearTexPos : shadowTexPos;
    //  vec3 texCoords = shadowTexPos;

    if (texCoords.x >= 0.0 && texCoords.x <= 1.0 && texCoords.y >= 0.0 && texCoords.y <= 1.0) {

        float res = distToCamera < nearThreshold ?
        texture2D(shadowsNearTexture, texCoords.xy).x : texture2D(shadowsTexture, texCoords.xy).x;

        if (res < (texCoords.z - 0.01)) {
            gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), gl_FragColor, 0.4);
        }
        //    else if (res - shadowTexPos.z < 0.0001 || res - shadowTexPos.z > 0.0001) {
        //      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        //    }
    }
}