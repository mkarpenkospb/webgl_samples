import React, {Component} from "react";

import * as THREE from 'three';
import * as THREEFULL from 'three-full';

// import OrbitControls from 'orbit-controls-es6';

import {setUpTerra, setUpLighthouse, water_plane} from './AreaSettings.js';
import * as dat from 'dat.gui'
import {setTestGeometry} from "./AreaSettings";
import {setUpShadowLighthouse, setUpShadowTerra} from "./ShadowAreaSettings";


let reflectivePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -100);
let refractivePlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
let allView = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1000);
const far = 1500;
const near = 386;


export class ViewArea extends Component {
    constructor() {
        super();
        this.canvasRef = React.createRef();
        this.divRef = React.createRef();

        this.scene = new THREE.Scene();
        this.shadowScene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, 1, 0.1, 5000);
        this.aspectRatio = 1;

        this.camera.position.z = 300;
        this.camera.position.x = -100;
        this.camera.position.y = 250;

        setUpTerra(this);
        setUpLighthouse(this);

        setUpShadowTerra(this);
        setUpShadowLighthouse(this);

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


            qx: -0.2,
            qy: 0.4,
            qz: 0,
            qw: 1,
            orth_near: -2500,
            orth_far: 2500,
            nearThreshold: 10.0,

            frustumSize: far,

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


        this.setOrthoCamera()
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
        this.setDepthTexture(canvas);


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

            this.renderNearShadow(renderer);
            this.renderFarShadow(renderer);

            for (let material of this.lighthouseMaterialMap.values()) {
                material.uniforms.shadowsTexture.value = this.depthTexture;
                material.uniforms.shadowsNearTexture.value = this.depthNearTexture;
                material.uniforms.shadowProjView.value = this.orthoMatrix;
                material.uniforms.shadowNearProjView.value = this.orthoNearMatrix;
            }

            this.terraMaterial.uniforms.shadowsTexture.value = this.depthTexture;
            this.terraMaterial.uniforms.shadowsNearTexture.value = this.depthNearTexture;
            this.terraMaterial.uniforms.shadowProjView.value = this.orthoMatrix;
            this.terraMaterial.uniforms.shadowNearProjView.value = this.orthoNearMatrix;

            switch (this.options.camera) {
                case 0:
                    renderer.render(this.scene, this.camera);
                    break;
                case 1:
                    renderer.render(this.scene, this.orthoCamera);
                    break;
                case 2:
                    renderer.render(this.scene, this.orthoNearCamera)
                    break;
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

            this.setDepthTexture(canvas);

            this.setOrthoCamera();

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

    renderFarShadow = (renderer) => {
        // this.shadowDepthTarget = this.depthTexture;



        renderer.setRenderTarget(this.shadowDepthTarget);
        renderer.render(this.shadowScene, this.orthoCamera);
        renderer.setRenderTarget(null);
    }


    renderNearShadow = (renderer) => {
        this.options.frustumSize = near;
        let destination = new THREE.Vector3();

        destination.subVectors(this.controls.target, this.camera.position);
        destination.normalize();

        this.orthoNearCamera.position.set(
            this.camera.position.x + 189 * destination.x,
            this.camera.position.y + 189 * destination.y,
            this.camera.position.z + 189 * destination.z);

        this.orthoNearCamera.updateProjectionMatrix();
        this.orthoNearCamera.updateMatrix();
        this.orthoNearCamera.updateMatrixWorld();

        this.orthoNearMatrix.multiplyMatrices(this.orthoNearCamera.projectionMatrix, this.orthoNearCamera.matrixWorldInverse);


        // this.shadowDepthTarget = this.depthTexture;
        renderer.setRenderTarget(this.shadowNearDepthTarget);
        renderer.render(this.shadowScene, this.orthoNearCamera);
        renderer.setRenderTarget(null);
    }


    setDepthTexture = (canvas) =>  {
        this.depthTexture = new THREE.DepthTexture(canvas.width, canvas.height);
        this.shadowDepthTarget = new THREE.WebGLRenderTarget(canvas.width, canvas.height, {
            depthTexture : this.depthTexture,
        })
        this.shadowDepthTarget.depthBuffer = true;
        this.depthTexture.needsUpdate = true;

        this.depthNearTexture = new THREE.DepthTexture(canvas.width, canvas.height);
        this.shadowNearDepthTarget = new THREE.WebGLRenderTarget(canvas.width, canvas.height, {
            depthTexture : this.depthNearTexture,
        })
        this.shadowNearDepthTarget.depthBuffer = true;
        this.depthNearTexture.needsUpdate = true;
    }

    setOrthoCamera = () => {

        this.orthoCamera = new THREE.OrthographicCamera(far * this.aspectRatio / - 2,
            far * this.aspectRatio / 2,
            far / 2,
            far / - 2,
            -1000,
            1000);

        this.orthoCamera.quaternion.set(this.options.qx, this.options.qy, this.options.qz, this.options.qw);
        this.orthoCamera.quaternion.normalize();
        this.orthoCamera.updateProjectionMatrix();
        this.orthoCamera.updateMatrix();
        this.orthoCamera.updateMatrixWorld();
        this.orthoMatrix = new THREE.Matrix4();
        this.orthoMatrix.multiplyMatrices(this.orthoCamera.projectionMatrix, this.orthoCamera.matrixWorldInverse);


        this.orthoNearCamera = new THREE.OrthographicCamera(near * this.aspectRatio / - 2,
            near * this.aspectRatio / 2,
            near / 2,
            near / - 2,
            -1000,
            1000);

        this.orthoNearCamera.quaternion.set(this.options.qx, this.options.qy, this.options.qz, this.options.qw);
        this.orthoNearCamera.quaternion.normalize();
        this.orthoNearCamera.updateProjectionMatrix();
        this.orthoNearCamera.updateMatrix();
        this.orthoNearCamera.updateMatrixWorld();
        this.orthoNearMatrix = new THREE.Matrix4();
        this.orthoNearMatrix.multiplyMatrices(this.orthoNearCamera.projectionMatrix, this.orthoNearCamera.matrixWorldInverse);

    }


    updateUniforms = () => {

        this.controls.update();

        this.lighthouseObject.scale.set(
            this.options.lighthouseScale,
            this.options.lighthouseScale,
            this.options.lighthouseScale);

        this.shadowLighthouseObject.scale.set(
            this.options.lighthouseScale,
            this.options.lighthouseScale,
            this.options.lighthouseScale);

        for (let material of this.lighthouseMaterialMap.values()) {
            material.uniforms.x_pos.value = this.options.lposx;
            material.uniforms.z_pos.value = this.options.lposz;
            material.uniforms.scale.value = this.options.terraScale;
            material.uniforms.nearThreshold.value = this.options.nearThreshold;
        }

        this.shadowBaseMaterial.uniforms.x_pos.value = this.options.lposx;
        this.shadowBaseMaterial.uniforms.z_pos.value = this.options.lposz;
        this.shadowBaseMaterial.uniforms.scale.value = this.options.terraScale;


        this.shadowTerraMaterial.uniforms.scale.value = this.options.terraScale;
        this.terraMaterial.uniforms.scale.value = this.options.terraScale;
        this.terraMaterial.uniforms.shadowIntensity.value = this.options.shadowIntensity;
        this.terraMaterial.uniforms.nearThreshold.value = this.options.nearThreshold;
        this.terraMaterial.uniforms.threshold.value = this.options.details_threshold;
        this.terraMaterial.uniforms.snow_details_intensive.value = this.options.snow_details_intensive;
        this.terraMaterial.uniforms.stone_details_intensive.value = this.options.stone_details_intensive;
        this.terraMaterial.uniforms.grass_details_intensive.value = this.options.grass_details_intensive;
        this.terraMaterial.uniforms.snow_details_freq.value = this.options.snow_details_freq;
        this.terraMaterial.uniforms.stone_details_freq.value = this.options.stone_details_freq;
        this.terraMaterial.uniforms.grass_details_freq.value = this.options.grass_details_freq;

        // this.updateOrthoCameraState();

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
        fields.add(this.options, "nearThreshold", 0.0, 400.0, 0.5);

        fields.add(this.options, "camera", 0, 2, 1);
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
