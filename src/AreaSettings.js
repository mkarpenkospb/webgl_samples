import React, {Component} from "react";

// import { OBJLoader } from 'Ob'
import * as THREE from 'three';

import vxShaderTerra from '../shaders/terra.vert';
import fragShaderTerra from '../shaders/terra.frag';

import vxShaderLighthouse from '../shaders/lighthouse.vert';
import fragShaderLighthouse from '../shaders/lighthouse.frag';

import {MyViewArea} from './MyViewArea.jsx';

import {createAxes} from './AxesObject.js';
import * as dat from 'dat.gui'
import parse from 'color-parse';

import bunny_model from './bunny.obj';
import terra from '../resources/terra/terra6.png';
import terra_bed from '../resources/terra/terra7cropped.jpg';
import upper from '../resources/tiles/tile_snow.jpg';
import lower from '../resources/tiles/tile_grass.jpg';
import middle from '../resources/tiles/tile_rock.png';
import lighthouse_model from "../resources/lighthouse/Mayak_3.obj";


// ----------------------------- textures for lighthouse ---------------------------

import base_color from '../resources/lighthouse/textures/Base_color_7.jpeg';
import body_color from '../resources/lighthouse/textures/Body_color_4.jpeg';
import door_color from '../resources/lighthouse/textures/Door_color_9.jpeg';
import top_color from '../resources/lighthouse/textures/Top_color_1.jpeg';

import vxShaderBase from '../shaders/base.vert';
import fragShaderBase from '../shaders/base.frag';

// -------------------------------------------- water shaders --------------------

import vxShaderPlane from '../shaders/water_plane.vert';
import fragShaderPlane from '../shaders/water_plane.frag';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let allView = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
// let allView = new THREE.Plane(new THREE.Vector3(0, 1, 0), -10000);

class GridInfo {
    constructor(indices, position, normal, uv) {
        this.indices = indices;
        this.position = position;
        this.normal = normal;
        this.uv = uv;
    }
}

function create_grid(size,  frequency) {
    let edge_size = frequency / size;
    let vertices = [];
    for (let i = 0; i < frequency; i++) {
        for (let j = 0; j < frequency; ++j) {

        }
    }

}



export function water_plane(area) {
    let tex_loader = new THREE.TextureLoader();

    area.water_level = 100.0;

    area.waterMaterial = new THREE.ShaderMaterial({
        uniforms : {
            u_scene_reflect : {value: null},
            u_scene_refract : {value: null},
            n_water: {value: 1.0},
            n_air: {value: 1.0},
        },
        vertexShader: vxShaderPlane,
        fragmentShader: fragShaderPlane,
        clippingPlanes: [allView]
    });

    const vScale = 1000.0;
    let vertices = [
        -vScale,  area.water_level, -vScale,
        -vScale, area.water_level, vScale,
        vScale,  area.water_level, vScale,
        vScale,  area.water_level, -vScale
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

    area.terraMaterial = new THREE.ShaderMaterial({
        uniforms:
            {
                u_color: {value: new THREE.Vector3()},
                height_map: {value: heightMap},
                height_map_bed: {value: heightMapBed},
                u_upper_tex: {value: upper_tex},
                u_lower_tex: {value: lower_tex},
                u_middle_tex: {value: middle_tex},
                scale: {value: 200},
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

    //https://stackoverflow.com/a/58321354
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

    area.lighthouseMaterial = new THREE.ShaderMaterial({
        uniforms: {
            min_point: {value: min_pos},
            height_map: {value: heightMap},
            x_pos: {value: 0},
            z_pos: {value: 0},
            u_color: {value: new THREE.Vector3(.3, .4, .2)},
            scale: {value: 200.0},

        },
        clipping: true,
        clippingPlanes: [allView],
        vertexShader: vxShaderLighthouse,
        fragmentShader: fragShaderLighthouse
    })

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
                    area.lighthouseMaterialMap.set('lighthouseMaterial', area.lighthouseMaterial);
                    child.material = area.lighthouseMaterial;
            }
        }
    });

    area.scene.add(area.lighthouseObject);
}