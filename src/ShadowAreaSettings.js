import React, {Component} from "react";

import * as THREE from 'three';

// ----------------------------- terra imports -------------------------------------------

//shaders

import vxShaderTerra_shadows from '../shaders/shadows/terra.vert';
import fragShaderTerra_shadows from '../shaders/shadows/terra.frag';
//model
import terra from '../resources/terra/terra6.png';


// ----------------------------- loads for lighthouse ---------------------------

import vxShaderBase_shadows from '../shaders/shadows/base.vert';
import fragShaderBase_shadows from '../shaders/shadows/base.frag';

import lighthouse_model from "../resources/lighthouse/Mayak_3.obj";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function setUpShadowTerra(area) {

    let tex_loader = new THREE.TextureLoader();

    let heightMap = tex_loader.load(terra);
    heightMap.wrapS = THREE.RepeatWrapping;
    heightMap.wrapT = THREE.RepeatWrapping;


    area.shadowTerraMaterial = new THREE.ShaderMaterial({
        uniforms:
            {
                height_map: {value: heightMap},
                scale: {value: 200},
            },

        vertexShader: vxShaderTerra_shadows,
        fragmentShader: fragShaderTerra_shadows,
    });

    let plane = new THREE.PlaneGeometry(2000, 2000, 1000, 1000);
    let plane_mesh = new THREE.Mesh(plane,  area.shadowTerraMaterial);
    plane_mesh.rotation.x = -Math.PI / 2;

    area.shadowScene.add(plane_mesh);
}

export function setUpShadowLighthouse(area) {

    //https://stackoverflow.com/a/58321354 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! THREE.sRGBEncoding;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! flipY = false;

    let tex_loader = new THREE.TextureLoader();

    let heightMap = tex_loader.load(terra);
    heightMap.wrapS = THREE.RepeatWrapping;
    heightMap.wrapT = THREE.RepeatWrapping;

    let loader = new OBJLoader();
    area.shadowLighthouseObject = loader.parse(lighthouse_model);

    // find min point to properly set all the positions on shader
    let min_pos =  new THREE.Vector3(Infinity, Infinity, Infinity);

    area.shadowLighthouseObject.traverse((child) => {
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

    area.shadowBaseMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    min_point: {value: min_pos},
                    x_pos : {value: 1000},
                    z_pos : {value: 1000},

                    height_map: {value: heightMap},
                    scale: {value: 200.0},
                },
                vertexShader: vxShaderBase_shadows,
                fragmentShader: fragShaderBase_shadows
            }
    );


    area.shadowLighthouseObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            switch (child.name) {
                case 'Door':
                case 'Top':
                case 'Body':
                case 'Basement':
                    child.material = area.shadowBaseMaterial;
                    break;
                default:
                    child.visible = false
            }
        }
    });


    area.shadowScene.add(area.shadowLighthouseObject);

}
