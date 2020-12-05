import React, {Component} from "react";

import * as THREE from 'three';

// ----------------------------- terra imports -------------------------------------------

//shaders
import vxShaderTerra from '../shaders/terra.vert';
import fragShaderTerra from '../shaders/terra.frag';
//model
import terra from '../resources/terra/terra6.png';

import terra_bed from '../resources/terra/terra7cropped.jpg';
import upper from '../resources/tiles/tile_snow.jpg';
import lower from '../resources/tiles/tile_grass.jpg';
import middle from '../resources/tiles/tile_rock.png';
import details_stone from '../resources/tiles/details1.jpg';
import details_snow from '../resources/tiles/details_snow_0.jpg';
import details_grass from '../resources/tiles/tekstura-travy21_bw.jpg';


// ----------------------------- loads for lighthouse ---------------------------

import vxShaderBase from '../shaders/base.vert';
import fragShaderBase from '../shaders/base.frag';

//------------------------------------------------------------------------
import lighthouse_model from "../resources/lighthouse/Mayak_3.obj";

import base_color from '../resources/lighthouse/textures/Base_color_7.jpeg';
import body_color from '../resources/lighthouse/textures/Body_color_4.jpeg';
import door_color from '../resources/lighthouse/textures/Door_color_9.jpeg';
import top_color from '../resources/lighthouse/textures/Top_color_1.jpeg';


// -------------------------------------------- water shaders --------------------

import vxShaderPlane from '../shaders/water_plane.vert';
import fragShaderPlane from '../shaders/water_plane.frag';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import water_normals from '../resources/water/6185-normal.jpg'

let allView = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
// let allView = new THREE.Plane(new THREE.Vector3(0, 1, 0), -10000);

function create_tb(material) {
    // https://habr.com/ru/post/415579/
    let pos1  = new THREE.Vector3(-1.0,  1.0, 100.0);
    let pos2  = new THREE.Vector3(-1.0, -1.0, 100.0);
    let pos3  = new THREE.Vector3( 1.0, -1.0, 100.0);
    let pos4  = new THREE.Vector3( 1.0,  1.0, 100.0);

    let uv1  = new THREE.Vector2(0.0, 1.0);
    let uv2  = new THREE.Vector2(0.0, 0.0);
    let uv3  = new THREE.Vector2(1.0, 0.0);
    let uv4  = new THREE.Vector2(1.0, 1.0);

    let nm = new THREE.Vector3(0.0, 0.0, 1.0);

    let edge1 = pos2.sub(pos1);
    let edge2 = pos3.sub(pos1);
    let deltaUV1 = uv2.sub(uv1);
    let deltaUV2 = uv3.sub(uv1);

    let f = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);

    let tangent = new THREE.Vector3(0.0, 0.0, 0.0);
    let bitangent = new THREE.Vector3(0.0, 0.0, 0.0);


    tangent.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
    tangent.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
    tangent.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
    // tangent.normalize();

    bitangent.x = f * (-deltaUV2.x * edge1.x + deltaUV1.x * edge2.x);
    bitangent.y = f * (-deltaUV2.x * edge1.y + deltaUV1.x * edge2.y);
    bitangent.z = f * (-deltaUV2.x * edge1.z + deltaUV1.x * edge2.z);
    // bitangent.normalize();

    material.uniforms.tangent.value = tangent.normalize();
    material.uniforms.bitangent.value =  bitangent.normalize();
}



export function water_plane(area) {
    // area.water_level = 100.0;

    const vScale = 1000.0;
    let vertices = [
        -vScale,  0.0, -vScale,
        -vScale, 0.0, vScale,
        vScale,  0.0, vScale,
        vScale,  0.0, -vScale
    ];

    let normal = Array(4).fill([0,1,0]).flat();
    let uv = [
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.1,
        1.0, 0.0
    ];

    const geometry = new THREE.BufferGeometry();
    const indices = [0, 1, 2, 0, 2, 3];

    geometry.setIndex(indices);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("normal", new THREE.Int8BufferAttribute(normal, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));


    let tex_loader = new THREE.TextureLoader();
    let waterNormalMap = tex_loader.load(water_normals);
    waterNormalMap.wrapS = THREE.RepeatWrapping;
    waterNormalMap.wrapT = THREE.RepeatWrapping;

    area.waterMaterial = new THREE.ShaderMaterial({
        uniforms : {
            water_level: {value: 100.0},
            u_scene_reflect : {value: null},
            u_scene_refract : {value: null},
            n_water: {value: 1.0},
            n_air: {value: 1.0},
            normal_map_fst: {value: waterNormalMap},
            ripple: {value: 60.0},
            time: {value: 0.0},
            tangent: {value:  new THREE.Vector3(0.0, 0.0, 0.0)},
            bitangent: {value:  new THREE.Vector3(0.0, 0.0, 0.0)},
        },
        vertexShader: vxShaderPlane,
        fragmentShader: fragShaderPlane,
        clippingPlanes: [allView]
    });

    create_tb(area.waterMaterial);

    area.water = new THREE.Mesh(geometry, area.waterMaterial);
    area.scene.add(area.water);
}


export function setUpTerra(area) {
    area.reflectivePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), .8);
    area.refractivePlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100.0);

    let tex_loader = new THREE.TextureLoader();

    let heightMap = tex_loader.load(terra);
    heightMap.wrapS = THREE.RepeatWrapping;
    heightMap.wrapT = THREE.RepeatWrapping;

    let heightMapBed = tex_loader.load(terra_bed);
    heightMapBed.wrapS = THREE.RepeatWrapping;
    heightMapBed.wrapT = THREE.RepeatWrapping;

    let upper_tex = tex_loader.load(upper);
    upper_tex.wrapS = THREE.RepeatWrapping;
    upper_tex.wrapT = THREE.RepeatWrapping;

    let lower_tex = tex_loader.load(lower);
    lower_tex.wrapS = THREE.RepeatWrapping;
    lower_tex.wrapT = THREE.RepeatWrapping;

    let middle_tex = tex_loader.load(middle);
    middle_tex.wrapS = THREE.RepeatWrapping;
    middle_tex.wrapT = THREE.RepeatWrapping;

    let details_tex = tex_loader.load(details_stone);
    details_tex.wrapS = THREE.RepeatWrapping;
    details_tex.wrapT = THREE.RepeatWrapping;

    let details_snow_tex = tex_loader.load(details_snow);
    details_snow_tex.wrapS = THREE.RepeatWrapping;
    details_snow_tex.wrapT = THREE.RepeatWrapping;

    let details_grass_tex = tex_loader.load(details_grass);
    details_grass_tex.wrapS = THREE.RepeatWrapping;
    details_grass_tex.wrapT = THREE.RepeatWrapping;

    area.terraMaterial = new THREE.ShaderMaterial({
        uniforms:
            {
                u_color: {value: new THREE.Vector3()},
                height_map: {value: heightMap},
                height_map_bed: {value: heightMapBed},
                u_upper_tex: {value: upper_tex},
                u_lower_tex: {value: lower_tex},
                u_middle_tex: {value: middle_tex},
                details_tex: {value: details_tex},
                details_tex_snow: {value: details_snow_tex},
                details_tex_grass: {value: details_grass_tex},
                scale: {value: 200},
                threshold: {value: 6.0},
                stone_details_intensive : {value: 0.5},
                snow_details_intensive : {value: 0.5},
                grass_details_intensive : {value: 0.5},
                stone_details_freq: {value: 50.0},
                snow_details_freq: {value: 50.0},
                grass_details_freq: {value: 50.0},
            },

        vertexShader: vxShaderTerra,
        fragmentShader: fragShaderTerra,
        clippingPlanes: [allView],
        clipping: true,
    });

    let plane = new THREE.PlaneGeometry(2000, 2000, 1000, 1000);
    let plane_mesh = new THREE.Mesh(plane, area.terraMaterial);
    plane_mesh.rotation.x = -Math.PI / 2;
    // plane_mesh.position.y = -100;

    area.scene.add(plane_mesh);
}

export function setUpLighthouse(area) {

    //https://stackoverflow.com/a/58321354 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! THREE.sRGBEncoding;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! flipY = false;

    let tex_loader = new THREE.TextureLoader();

    let heightMap = tex_loader.load(terra);
    heightMap.wrapS = THREE.RepeatWrapping;
    heightMap.wrapT = THREE.RepeatWrapping;

    let door_color_tex = tex_loader.load(door_color);
    door_color_tex.encoding = THREE.sRGBEncoding;
    door_color_tex.flipY = false;
    door_color_tex.wrapS = THREE.RepeatWrapping;
    door_color_tex.wrapT = THREE.RepeatWrapping;

    let top_color_tex = tex_loader.load(top_color);
    top_color_tex.encoding = THREE.sRGBEncoding;
    top_color_tex.flipY = false;
    top_color_tex.wrapS = THREE.RepeatWrapping;
    top_color_tex.wrapT = THREE.RepeatWrapping;

    let body_color_tex = tex_loader.load(body_color);
    body_color_tex.encoding = THREE.sRGBEncoding;
    body_color_tex.flipY = false;
    body_color_tex.wrapS = THREE.RepeatWrapping;
    body_color_tex.wrapT = THREE.RepeatWrapping;

    let base_color_tex = tex_loader.load(base_color);
    base_color_tex.encoding = THREE.sRGBEncoding;
    base_color_tex.flipY = false;
    base_color_tex.wrapS = THREE.RepeatWrapping;
    base_color_tex.wrapT = THREE.RepeatWrapping;

    let loader = new OBJLoader();
    area.lighthouseObject = loader.parse(lighthouse_model);

    // find min point to properly set all the positions on shader
    let min_pos =  new THREE.Vector3(Infinity, Infinity, Infinity);

    area.lighthouseObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            let positions = child.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i+=3) {
                let x = positions[i];
                let y = positions[i + 1];
                let z = positions[i + 2];
                if (x < min_pos.x && y < min_pos.y && z < min_pos.z) {
                    min_pos.x = x;
                    min_pos.y = y;
                    min_pos.z = z;
                }
            }
        }
    });

    let material = (color) => {
        return new THREE.ShaderMaterial({
                uniforms: {
                    min_point: {value: min_pos},
                    x_pos : {value: 1000},
                    z_pos : {value: 1000},
                    height_map: {value: heightMap},
                    scale: {value: 200.0},
                    u_color: {value: color}
                },
                vertexShader: vxShaderBase,
                fragmentShader: fragShaderBase,
                clippingPlanes: [allView],
                clipping: true,
            }
        )
    };


    area.lighthouseMaterialMap = new Map();
    area.lighthouseObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            switch (child.name) {
                case 'Door':
                    let doorMaterial = material(door_color_tex);
                    area.lighthouseMaterialMap.set('Door', doorMaterial);
                    child.material = doorMaterial;
                    break;
                case 'Top':
                    let topMaterial = material(top_color_tex);
                    area.lighthouseMaterialMap.set('Top', topMaterial);
                    child.material = topMaterial;
                    break;
                case 'Body':
                    let bodyMaterial = material(body_color_tex);
                    area.lighthouseMaterialMap.set('Body', bodyMaterial);
                    child.material =  bodyMaterial;
                    break;
                case 'Basement':
                    let basementMaterial = material(base_color_tex);
                    area.lighthouseMaterialMap.set('Basement', basementMaterial);
                    child.material =  basementMaterial;
                    break;
                default:
                    child.visible = false
            }
        }
    });

    area.scene.add(area.lighthouseObject);
}
