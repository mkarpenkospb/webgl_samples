
uniform mat4 shadowProjView;
uniform mat4 shadowNearProjView;

out vec3 shadowTexPos;
out vec3 shadowNearTexPos;

out vec3 pos_world;
out vec2 vUV;

uniform vec3 min_point;
uniform float water_level;
uniform float x_pos;
uniform float z_pos;


varying float distToCamera;
void main() {

    pos_world = (modelMatrix * vec4(position - vec3(0.0, min_point.y, 0.0), 1.0)).xyz;
    vUV = uv;
    pos_world = pos_world + vec3(0.0, 1.0, 0.0) * water_level + vec3(x_pos, 0, z_pos);
    gl_Position = projectionMatrix * viewMatrix * vec4(pos_world, 1.0);
    distToCamera = gl_Position.w;

    vec4 tmp = shadowProjView * vec4(pos_world, 1);
    shadowTexPos = ((tmp.xyz / tmp.w) * vec3(0.5)) + vec3(0.5);

    tmp = shadowNearProjView * vec4(pos_world, 1.0);
    shadowNearTexPos = (tmp.xyz / tmp.w) * 0.5 + 0.5;
}
