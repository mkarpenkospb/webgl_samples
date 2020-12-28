
out vec3 pos_world;
out vec2 vUV;

uniform vec3 min_point;
uniform float water_level;
uniform float x_pos;
uniform float z_pos;


void main() {

    pos_world = (modelMatrix * vec4(position - vec3(0.0, min_point.y, 0.0), 1.0)).xyz;
    vUV = uv;
    pos_world = pos_world + vec3(0.0, 1.0, 0.0) * water_level + vec3(x_pos, 0, z_pos);
    gl_Position = projectionMatrix * viewMatrix * vec4(pos_world, 1.0);

}
