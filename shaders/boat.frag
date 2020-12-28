in vec3 pos_world;
in vec2 vUV;

uniform vec3 u_color;
uniform sampler2D colors;
uniform float nearThreshold;

uniform float epsilon;
uniform sampler2D shadowsTexture;
uniform sampler2D shadowsNearTexture;
in vec3 shadowTexPos;
in vec3 shadowNearTexPos;
varying float distToCamera;

void main()
{
    gl_FragColor = vec4(texture2D(colors, vUV).rgb, 1.0);

    vec3 texCoords = distToCamera < nearThreshold ? shadowNearTexPos : shadowTexPos;
    //  vec3 texCoords = shadowTexPos;
    if (texCoords.x >= 0.0 && texCoords.x <= 1.0 && texCoords.y >= 0.0 && texCoords.y <= 1.0) {

        float res = distToCamera < nearThreshold ?
        texture2D(shadowsNearTexture, texCoords.xy).x : texture2D(shadowsTexture, texCoords.xy).x;
        //    float res = texture2D(shadowsTexture, texCoords.xy).x;

        if (res < (texCoords.z - epsilon)) {
            gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), gl_FragColor, 0.4);
        }
        //    else if (res - shadowTexPos.z < 0.0001 || res - shadowTexPos.z > 0.0001) {
        //      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        //    }
    }
}