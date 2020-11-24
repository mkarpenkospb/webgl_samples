import React, {Component} from "react";

import * as THREE from 'three-full';
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
import upper from '../resources/tiles/tile_snow.jpg';
import lower from '../resources/tiles/tile_grass.jpg';
import middle from '../resources/tiles/tile_rock.png';
import lighthouse_model from "../resources/lighthouse/Mayak_3.obj";



export function setUpTerra(area) {

    let tex_loader = new THREE.TextureLoader();

    let heightMap = tex_loader.load(terra);
    heightMap.wrapS = THREE.RepeatWrapping;
    heightMap.wrapT = THREE.RepeatWrapping;

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
                u_upper_tex: {value: upper_tex},
                u_lower_tex: {value: lower_tex},
                u_middle_tex: {value: middle_tex},
                scale: {value: 100},
            },

        vertexShader: vxShaderTerra,
        fragmentShader: fragShaderTerra
    });


    let plane = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let plane_mesh = new THREE.Mesh(plane, area.terraMaterial);
    plane_mesh.rotation.x = -Math.PI / 2;
    plane_mesh.position.y = -100;

    area.scene.add(plane_mesh);
}

export function setUpLighthouse(area) {

    area.lighthouseMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_color: {value: new THREE.Vector3(.3, .4, .6)},
        },

        vertexShader: vxShaderLighthouse,
        fragmentShader: fragShaderLighthouse
    })



    let loader = new THREE.OBJLoader();

    area.lighthouseObject = loader.parse(lighthouse_model);
    area.lighthouseObject.traverse( (child) => {
        if ( child instanceof THREE.Mesh ) {
            child.material = area.lighthouseMaterial;
        }
    });

    area.scene.add(area.lighthouseObject);
}