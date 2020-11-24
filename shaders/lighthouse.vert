out vec3 pos_world;
out vec3 out_normal;

void main() {
    out_normal = normalize(normalMatrix * normal);
    pos_world = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
