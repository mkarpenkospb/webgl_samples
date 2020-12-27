import React, {Component} from "react";

import * as THREE from 'three';
import * as THREEFULL from 'three-full';

// import OrbitControls from 'orbit-controls-es6';

import {setUpTerra, setUpLighthouse, water_plane} from './AreaSettings.js';
import * as dat from 'dat.gui'
import {setTestGeometry} from "./AreaSettings";


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
        this.orthoCamera = new THREE.OrthographicCamera(-700, 700, 700, -3, -300, 500);

        this.quanterion = new THREE.Quaternion(2,4,5,1);
        this.orthoCamera.applyQuaternion(this.quanterion);
        this.orthoCamera.quaternion.normalize();

        this.aspectRatio = 1;
        // this.orthoCamera.position.set(5,2,-4);
        // this.orthoCamera.updateMatrix();
        // this.orthoCamera.updateProjectionMatrix();
        // this.orthoCamera.updateMatrixWorld();

        this.orthoMatrix = new THREE.Matrix4();
        this.orthoMatrix.multiplyMatrices(this.orthoCamera.projectionMatrix, this.orthoCamera.matrixWorldInverse);

        this.camera.position.z = 300;
        this.camera.position.x = -100;
        this.camera.position.y = 250;

        // this.orthoCamera.position.z = 300;
        // this.orthoCamera.position.x = 100;
        // this.orthoCamera.position.y = 250;

        setUpTerra(this);
        setUpLighthouse(this);
        // water_plane(this);

        this.options = {
            color: "#bd9c36",
            rotationSpeed: 60,
            terraScale: 277,
            lighthouseScale: 63,
            camera: 0,
            lposx: -80,
            lposz: -147,


            lookx: 0,
            looky: 0,
            lookz: 0,


            qx: -0.4,
            qy: 0.5,
            qz: 0,
            qw: 1,
            orth_near: -876,
            orth_far: 2000,

            frustumSize: 1000,

            constant: 1000,
            water_level: 100,
            // n_water: 1.0,
            // n_air: 1.0,
            shadowIntensity: 0.1,
            water_ripple: 46.0,
            details_threshold: 57,
            snow_details_intensive: 1.30,
            stone_details_intensive: 1.6,
            grass_details_intensive: 3.2,
            snow_details_freq: 50.0,
            stone_details_freq: 50.0,
            grass_details_freq: 50.0,
        };
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }
        this.controls = new THREEFULL.OrbitControls(this.camera, canvas);
        this.controls.update();

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            return;
        }

        this.addDatGUI();

        let renderer = new THREE.WebGLRenderer({canvas: canvas, context: gl});
        renderer.setSize(canvas.width, canvas.height);
        renderer.localClippingEnabled = true;
        this.prevTime = new Date();

        this.cubeRenderTargetReflection = new THREE.WebGLCubeRenderTarget(128, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        this.cubeCameraReflection = new THREE.CubeCamera(0.1, 5000, this.cubeRenderTargetReflection);
        this.scene.add(this.cubeCameraReflection);

        this.cubeRenderTargetRefraction = new THREE.WebGLCubeRenderTarget(128, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        this.cubeCameraRefraction = new THREE.CubeCamera(0.1, 5000, this.cubeRenderTargetRefraction);
        this.scene.add(this.cubeCameraRefraction);


        // ------------------------- camera for shadows --------------------------------------------
        this.depthTexture = new THREE.DepthTexture(canvas.width, canvas.height);
        this.shadowDepthTarget = new THREE.WebGLRenderTarget(canvas.width, canvas.height, {
            depthTexture : this.depthTexture,
        })
        this.shadowDepthTarget.depthBuffer = true;

        // dowDepthTarget.depthBuffer = true;
        // this.shadowDepthTarget.depthTexture = new THREE.DepthTexture()
        // this.shadowDepthTarget.depthTexture.format =

        const renderLoopTick = () => {
            // Handle resize
            this.handleResize(canvas, renderer)

            this.curTime = new Date();

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3, 0.4, 0.5, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this.updateUniforms()

            // ----------------------- draw reflection, clip everything under the water -----------------------

            // this.water.visible = false;
/*
            for (let material of this.lighthouseMaterialMap.values()) {
                material.clippingPlanes = [reflectivePlane];
            }

            this.terraMaterial.clippingPlanes = [reflectivePlane];

            this.cubeCameraReflection.position.copy(this.camera.position);
            // place camera under the water
            this.cubeCameraReflection.position.y -= (this.cubeCameraReflection.position.y - this.options.water_level) * 2;
            this.cubeCameraReflection.update(renderer, this.scene);

            this.waterMaterial.uniforms.u_scene_reflect.value = this.cubeRenderTargetReflection.texture;

            // ----------------------- draw refraction, clip everything above the water -----------------------

            for (let material of this.lighthouseMaterialMap.values()) {
                material.clippingPlanes = [refractivePlane];
            }

            this.terraMaterial.clippingPlanes = [refractivePlane];

            this.cubeCameraRefraction.position.copy(this.camera.position);
            this.cubeCameraRefraction.update(renderer, this.scene);
            this.waterMaterial.uniforms.u_scene_refract.value = this.cubeRenderTargetRefraction.texture;

            // ----------------------- finally draw the scene -------------------------------------------------

            this.water.visible = true;
*/
            for (let material of this.lighthouseMaterialMap.values()) {
                material.clippingPlanes = [allView]
            }

            this.terraMaterial.clippingPlanes = [allView];

            // ----------------------- render shadows depth -------------------------

            this.shadowRenderState(1);

            renderer.setRenderTarget(this.shadowDepthTarget);
            renderer.render(this.scene, this.orthoCamera);
            renderer.setRenderTarget(null);

            for (let material of this.lighthouseMaterialMap.values()) {
                material.uniforms.shadowsTexture.value = this.depthTexture;
                material.uniforms.shadowProjView.value = this.orthoMatrix;
            }

            this.terraMaterial.uniforms.shadowsTexture.value = this.depthTexture;
            this.terraMaterial.uniforms.shadowProjView.value = this.orthoMatrix;
            // this.waterMaterial.uniforms.shadowsTexture.value = this.shadowDepthTarget.depthTexture;
            // this.waterMaterial.uniforms.shadowProjView.value = orthoMatrix;

            this.shadowRenderState(0);

            if (this.options.camera === 0) {
                renderer.render(this.scene, this.camera);
            } else {
                renderer.render(this.scene, this.orthoCamera);
            }
            this.prevTime = this.curTime;
            requestAnimationFrame(renderLoopTick);
        }

        requestAnimationFrame(renderLoopTick);
    }

    handleResize = (canvas, renderer) => {
        if (this.divRef.current.offsetWidth !== canvas.width ||
            this.divRef.current.offsetHeight !== canvas.height) {
            console.log(`Resizing canvas: ${this.divRef.current.offsetWidth}x${this.divRef.current.offsetHeight}`);
            // console.log(this.heightMap.color);
            canvas.width = this.divRef.current.offsetWidth;
            canvas.height = this.divRef.current.offsetHeight;

            renderer.setSize(canvas.width, canvas.height);
            this.aspectRatio = canvas.width / canvas.height;

            this.depthTexture = new THREE.DepthTexture(canvas.width, canvas.height);
            this.shadowDepthTarget = new THREE.WebGLRenderTarget(canvas.width, canvas.height, {
                depthTexture : this.depthTexture,
            })
            this.shadowDepthTarget.depthBuffer = true;

            this.orthoCamera = new THREE.OrthographicCamera(this.options.frustumSize * this.aspectRatio / - 2,
                this.options.frustumSize * this.aspectRatio / 2,
                this.options.frustumSize / 2,
                this.options.frustumSize / - 2,
                -1000,
                1000);

            this.orthoMatrix = new THREE.Matrix4();
            this.orthoMatrix.multiplyMatrices(this.orthoCamera.projectionMatrix, this.orthoCamera.matrixWorldInverse);

            const d = new THREE.Vector3();
            const q = new THREE.Quaternion();
            const s = new THREE.Vector3();
            this.camera.matrixWorld.decompose(d, q, s);
            this.camera.position.copy(d);
            this.camera.quaternion.copy(q);
            this.camera.scale.copy(s);

            this.camera = new THREE.PerspectiveCamera(90,
                canvas.width / canvas.height, this.camera.near, this.camera.far);

            this.camera.position.set(d.x, d.y, d.z);
            this.camera.quaternion.clone(q);
            this.cubeCameraReflection.quaternion.clone(q);
            this.cubeCameraRefraction.quaternion.clone(q);

            this.camera.scale.set(s.x, s.y, s.z);
            this.cubeCameraReflection.scale.set(s.x, s.y, s.z);
            this.cubeCameraRefraction.scale.set(s.x, s.y, s.z);
            this.controls = new THREEFULL.OrbitControls(this.camera, canvas);
        }
    }

    shadowRenderState = (state) => {
        for (let material of this.lighthouseMaterialMap.values()) {
            material.uniforms.shadowRender.value = state;
        }
        this.terraMaterial.uniforms.shadowRender.value = state;
        // this.shadowDepthTarget.depthTexture = state === 1 ? this.depthTexture : null;

        // this.waterMaterial.uniforms.shadowRender.value = state;
    }

    updateUniforms = () => {

        this.controls.update();

        this.lighthouseObject.scale.set(
            this.options.lighthouseScale,
            this.options.lighthouseScale,
            this.options.lighthouseScale);

        for (let material of this.lighthouseMaterialMap.values()) {
            material.uniforms.x_pos.value = this.options.lposx;
            material.uniforms.z_pos.value = this.options.lposz;
            material.uniforms.scale.value = this.options.terraScale;
        }

        this.terraMaterial.uniforms.scale.value = this.options.terraScale;
        this.terraMaterial.uniforms.shadowIntensity.value = this.options.shadowIntensity;
        this.terraMaterial.uniforms.threshold.value = this.options.details_threshold;
        this.terraMaterial.uniforms.snow_details_intensive.value = this.options.snow_details_intensive;
        this.terraMaterial.uniforms.stone_details_intensive.value = this.options.stone_details_intensive;
        this.terraMaterial.uniforms.grass_details_intensive.value = this.options.grass_details_intensive;
        this.terraMaterial.uniforms.snow_details_freq.value = this.options.snow_details_freq;
        this.terraMaterial.uniforms.stone_details_freq.value = this.options.stone_details_freq;
        this.terraMaterial.uniforms.grass_details_freq.value = this.options.grass_details_freq;


        this.orthoCamera.near = this.options.orth_near;
        this.orthoCamera.far = this.options.orth_far;
        this.orthoCamera.top = this.options.frustumSize / 2;
        this.orthoCamera.bottom = this.options.frustumSize / - 2;
        this.orthoCamera.right = this.options.frustumSize * this.aspectRatio / 2;
        this.orthoCamera.left = this.options.frustumSize * this.aspectRatio / - 2;

        this.orthoCamera.quaternion.set(this.options.qx, this.options.qy, this.options.qz, this.options.qw);
        this.orthoCamera.quaternion.normalize();
        this.orthoCamera.updateProjectionMatrix();
        this.orthoCamera.updateMatrix();
        this.orthoCamera.updateMatrixWorld();

        this.orthoMatrix.multiplyMatrices(this.orthoCamera.projectionMatrix, this.orthoCamera.matrixWorldInverse);

        // this.waterMaterial.uniforms.ripple.value = this.options.water_ripple;
        // this.waterMaterial.uniforms.time.value += (this.curTime.getTime() - this.prevTime.getTime()) / 10000;
        // this.waterMaterial.uniforms.water_level.value = this.options.water_level;
    }

    addDatGUI = () => {
        this.gui = new dat.GUI({name: "My GUI"});

        const fields = this.gui.addFolder("Field");
        // fields.add(this.options, "terraScale", 0, 1000, 1);
        // fields.add(this.options, "water_level", 0, 200, 0.5);
        // fields.add(this.options, "lighthouseScale", 0, 200, 1);
        fields.add(this.options, "lposx", -1000, 1000, 0.5);
        fields.add(this.options, "lposz", -1000, 1000, 0.5);
        // fields.add(this.options, "water_ripple", 1.0, 500.0, 1);
        // fields.add(this.options, "details_threshold", 0.0, 100.0, 1.0);
        // fields.add(this.options, "snow_details_intensive", 0.0, 4.0, 0.05);
        // fields.add(this.options, "stone_details_intensive", 0.0, 4.0, 0.05);
        // fields.add(this.options, "grass_details_intensive", 0.0, 4.0, 0.05);
        // fields.add(this.options, "snow_details_freq", 1.0, 1000.0, 1.0);
        // fields.add(this.options, "stone_details_freq", 1.0, 1000.0, 1.0);
        // fields.add(this.options, "grass_details_freq", 1.0, 1000.0, 1.0);
        fields.add(this.options, "shadowIntensity", 0.0, 3.0, 0.01);

        fields.add(this.options, "qx", -1, 1, .1);
        fields.add(this.options, "qy", -1, 1, .1);
        fields.add(this.options, "qz", -1, 1, .1);
        fields.add(this.options, "qw", -1, 1, .1);
        fields.add(this.options, "orth_near", -2000, 2000, 1);
        fields.add(this.options, "orth_far", -2000, 2000, 1);

        fields.add(this.options, "frustumSize", 0, 5000, 1);

        fields.add(this.options, "camera", 0, 1, 1);

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
