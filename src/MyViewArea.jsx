import React, {Component} from "react";

import * as THREE from 'three';

import OrbitControls from 'orbit-controls-es6';

import vxShader from '../shaders/terra.vert';
import fragShader from '../shaders/terra.frag';

import {createAxes} from './AxesObject.js';
import {setUpTerra, setUpLighthouse, water_plane} from './AreaSettings.js';
import * as dat from 'dat.gui'
import parse from 'color-parse';

import lighthouse_model from '../resources/lighthouse/Mayak_3.obj';

function optionColorToVec3(color) {
    let parsedColor = parse(color);

    let values = parsedColor.values;

    return new THREE.Vector3(values[0] / 255, values[1] / 255, values[2] / 255);
}


let reflectivePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -100);
let refractivePlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
let allView = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1000);

export class ViewArea extends Component {
    constructor() {
        super();

        this.canvasRef = React.createRef();
        this.divRef = React.createRef();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, 1, 0.1, 5000);

        this.camera.position.z = 300;
        this.camera.position.x = -100;
        this.camera.position.y = 250;

        setUpTerra(this);
        setUpLighthouse(this);
        water_plane(this);


        this.options = {
            color: "#bd9c36",
            rotationSpeed: 60,
            terraScale: 227,
            lighthouseScale: 63,
            lposx: -83,
            lposz: -83,
            plane_x : 0,
            plane_y : 0,
            plane_z : 0,
            constant: 1000,
            n_water: 1.0,
            n_air: 1.0
        };
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }

        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.update();

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            return;
        }

        this.addDatGUI();

        var renderer = new THREE.WebGLRenderer({canvas: canvas, context: gl});
        renderer.setSize(canvas.width, canvas.height);
        // var globalPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 1 );
        // renderer.clippingPlanes = [ globalPlane ];
        renderer.localClippingEnabled = true;
        // renderer.setPixelRatio(window.devicePixelRatio);
        this.prevTime = new Date();

        const cubeRenderTargetReflection = new THREE.WebGLCubeRenderTarget( 512, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
        const cubeCameraReflection = new THREE.CubeCamera( 0.1, 5000, cubeRenderTargetReflection );
        this.scene.add( cubeCameraReflection );

        const cubeRenderTargetRefraction = new THREE.WebGLCubeRenderTarget( 512, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
        const cubeCameraRefraction = new THREE.CubeCamera( 0.1, 5000, cubeRenderTargetRefraction );
        this.scene.add( cubeCameraRefraction );



        const renderLoopTick = () => {
            // Handle resize
            if (this.divRef.current.offsetWidth !== canvas.width ||
                this.divRef.current.offsetHeight !== canvas.height) {
                console.log(`Resizing canvas: ${this.divRef.current.offsetWidth}x${this.divRef.current.offsetHeight}`);
                // console.log(this.heightMap.color);
                canvas.width = this.divRef.current.offsetWidth;
                canvas.height = this.divRef.current.offsetHeight;

                renderer.setSize(canvas.width, canvas.height);

                const d = new THREE.Vector3();
                const q = new THREE.Quaternion();
                const s = new THREE.Vector3();
                this.camera.matrixWorld.decompose(d, q, s);
                this.camera.position.copy(d);
                this.camera.quaternion.copy(q);
                this.camera.scale.copy(s);

                this.camera = new THREE.PerspectiveCamera(90, canvas.width / canvas.height, this.camera.near, this.camera.far);

                this.camera.position.set(d.x, d.y, d.z);
                this.camera.quaternion.clone(q);
                cubeCameraReflection.quaternion.clone(q);
                cubeCameraRefraction.quaternion.clone(q);

                this.camera.scale.set(s.x, s.y, s.z);
                cubeCameraReflection.scale.set(s.x, s.y, s.z);
                cubeCameraRefraction.scale.set(s.x, s.y, s.z);
                this.controls = new OrbitControls(this.camera, canvas);
            }

            const curTime = new Date();

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // -------------------------- update gui controllers ---------------------------
            this.controls.update();
            this.lighthouseObject.scale.set(
                this.options.lighthouseScale,
                this.options.lighthouseScale,
                this.options.lighthouseScale);

            this.terraMaterial.uniforms.scale.value = this.options.terraScale;
            // reflectivePlane = new THREE.Plane(
            //     new THREE.Vector3(this.options.plane_x, this.options.plane_y, this.options.plane_z),
            //     this.options.constant);
            this.water.visible = false;



            for (let material of this.lighthouseMaterialMap.values()) {
                material.uniforms.x_pos.value = this.options.lposx;
                material.uniforms.z_pos.value = this.options.lposz;
                material.uniforms.scale.value = this.options.terraScale;
                material.clippingPlanes = [reflectivePlane];
            }

            this.terraMaterial.clippingPlanes  = [reflectivePlane];

            cubeCameraReflection.position.copy(this.camera.position);
            cubeCameraReflection.position.y -= (cubeCameraReflection.position.y - this.water_level) * 2;
            cubeCameraReflection.update(renderer, this.scene);


            this.waterMaterial.uniforms.u_scene_reflect.value = cubeRenderTargetReflection.texture;


            for (let material of this.lighthouseMaterialMap.values()) {
                material.clippingPlanes = [refractivePlane];
            }

            this.terraMaterial.clippingPlanes  = [refractivePlane];

            cubeCameraRefraction.position.copy(this.camera.position);
            // cubeCameraRefraction.position.y -= (cubeCameraReflection.position.y - this.water_level) * 2;
            cubeCameraRefraction.update(renderer, this.scene);
            this.waterMaterial.uniforms.u_scene_refract.value = cubeRenderTargetRefraction.texture;

            this.water.visible = true;

            this.waterMaterial.uniforms.n_water.value = this.options.n_water;
            this.waterMaterial.uniforms.n_air.value = this.options.n_air;


            for (let material of this.lighthouseMaterialMap.values()) {
                material.clippingPlanes = [allView]
            }

            this.terraMaterial.clippingPlanes = [allView];

            renderer.render(this.scene, this.camera);
            this.prevTime = curTime;

            requestAnimationFrame(renderLoopTick);
        }

        requestAnimationFrame(renderLoopTick);
    }

    addDatGUI = () => {
        this.gui = new dat.GUI({name: "My GUI"});

        var fields = this.gui.addFolder("Field");
        fields.add(this.options, "terraScale", 0, 1000, 1);
        fields.add(this.options, "lighthouseScale", 0, 200, 1);
        fields.add(this.options, "lposx", -1000, 1000, 0.5);
        fields.add(this.options, "lposz", -1000, 1000, 0.5);
        fields.add(this.options, "plane_x", -1, 1, 0.1);
        fields.add(this.options, "plane_y", -1, 1, 0.1);
        fields.add(this.options, "plane_z", -1, 1, 0.1);
        fields.add(this.options, "constant", -1000, 1000, 1);
        fields.add(this.options, "n_water", 1.0, 10.0, 0.1);
        fields.add(this.options, "n_air",  1.0, 10.0, 0.1);

        fields.open();
    }

    render() {
        return (
            <div ref={this.divRef} style={{width: "100%", height: "100vh"}}>
                <canvas
                    ref={this.canvasRef}
                    style={{width: "100%", height: "100%"}}
                />
            </div>
        );
    }
}
