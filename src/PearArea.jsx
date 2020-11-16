import React, {Component} from "react";

import * as THREE from 'three-full';
import vxShader from './main.vert';
import fragShader from './main.frag';

import {createAxes} from './AxesObject.js';
import * as dat from 'dat.gui'
import parse from 'color-parse';

import pear_model from './pear_export.obj'

function optionColorToVec3(color) {
    let parsedColor = parse(color);

    let values = parsedColor.values;

    return new THREE.Vector3(values[0] / 255, values[1] / 255, values[2] / 255);
}

function getVideoCardInfo(gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer:  gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    } : {
        error: "no WEBGL_debug_renderer_info",
    };
}


export class ViewArea extends Component {
    constructor() {
        super();

        this.customMaterial = new THREE.ShaderMaterial({
            uniforms:
                {
                    u_color: {value: new THREE.Vector3()},
                    n_from: {value: 1},
                    n_to: {value: 1.1},
                    a: {value: 0.4},
                    cameraPos: {value: new THREE.Vector3()}
                    // texture: {value: }
                },
            vertexShader: vxShader,
            fragmentShader: fragShader
        });

        this.canvasRef = React.createRef();
        this.divRef = React.createRef();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
        // this.camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 1000 );

        this.camera.position.z = 15;
        this.camera.position.x = 15;
        this.camera.position.y = 15;

        // this.scene.add(createAxes());
        this.scene.background = new THREE.CubeTextureLoader().setPath(
            'mountain-skyboxes/Teide/'
        ).load([
            'posx.jpg',
            'negx.jpg',
            'posy.jpg',
            'negy.jpg',
            'posz.jpg',
            'negz.jpg',
        ]);

        let loader = new THREE.OBJLoader();

        this.pearObject = loader.parse(pear_model);
        // Внутри объекта находится сетка, которая также является объектом, который можно
        // даже отдельно отрендерить. Ей наши материалы никто не присваивал. А задача у нас именно сетке
        // присвоить материал
        this.pearObject.traverse( (child) => {
          if ( child instanceof THREE.Mesh ) {
              child.material = this.customMaterial;
          }
        });
        this.pearRotation = 0;

        this.scene.add(this.pearObject);

        this.options = {
            color: "#ffae23",
            n_from: 1,
            n_to: 1.1,
            a: 0.4,
            rotationSpeed: 60
        };

        // константы для мыши


        this.mouseControls  = {
            followMouse: false,
            xStartPos: 0,
            yStartPos: 0,
            xPos: 0,
            yPos: 0,
            deltaX: 0,
            deltaY: 0
        }
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        let Y_AXIS = new THREE.Vector3( 0, 1, 0 );
        if (!canvas) {
            return;
        }
        canvas.width = 1920;
        canvas.height = 1080;
        // this.controls = new THREE.OrbitControls(this.camera, this.canvasRef.current);
        // this.controls.update();

        const gl = canvas.getContext('webgl2',
            { powerPreference : "high-performance"}

            );
        if (!gl) {
            return;
        }
        // gl.device
        console.log(getVideoCardInfo(gl));
        // gl.powerPreference

        // then(function (devices) {
        //     devices.forEach(function (device) {
        //         console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
        //     });
        // });
        this.addDatGUI();
        let renderer = new THREE.WebGLRenderer({canvas: canvas, context: gl});
        let ratio = window.devicePixelRatio;
        renderer.setSize(window.width, window.height);
        renderer.setPixelRatio(ratio);

        this.prevTime = new Date();

        canvas.addEventListener('mousedown', this.onMouseDown, false);
        canvas.addEventListener('mouseup', this.onMouseUp, false);
        canvas.addEventListener('mousemove', this.onMouseMove, false);



        const renderLoopTick = () => {
            // Handle resize
            if (this.divRef.current.offsetWidth != canvas.width ||
                this.divRef.current.offsetHeight != canvas.height) {
                console.log(`Resizing canvas: ${this.divRef.current.offsetWidth}x${this.divRef.current.offsetHeight}`);

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
                this.camera.scale.set(s.x, s.y, s.z);
                // this.controls = new THREE.OrbitControls(this.camera, canvas);
            }

            // support camera controls

            if (this.mouseControls.followMouse) {
                this.mouseControls.deltaX += (this.mouseControls.xPos - this.mouseControls.xStartPos) * 0.01;
                this.mouseControls.deltaY += (this.mouseControls.yPos - this.mouseControls.yStartPos) * 0.01;
                this.mouseControls.xStartPos = this.mouseControls.xPos;
                this.mouseControls.yStartPos = this.mouseControls.yPos;

            }

            this.camera.rotateOnAxis(Y_AXIS, this.mouseControls.deltaX);

            const curTime = new Date();

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // this.controls.update();

            this.pearObject.position.set(5, 2, 2);
            this.pearObject.scale.set(1, 1, 1);
            this.pearRotation = this.pearRotation + (curTime.getTime() - this.prevTime.getTime()) / 1000 * this.options.rotationSpeed * Math.PI / 180;
            this.pearObject.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.pearRotation);

            this.customMaterial.uniforms.u_color.value = optionColorToVec3(this.options.color);
            this.customMaterial.uniforms.cameraPos.value = this.camera.position;
            // this.customMaterial.uniforms
            renderer.render(this.scene, this.camera);

            this.prevTime = curTime;

            requestAnimationFrame(renderLoopTick);
        }

        requestAnimationFrame(renderLoopTick);

    }

    addDatGUI = () => {
        this.gui = new dat.GUI({name: "My GUI"});
        let fields = this.gui.addFolder("Field");
        fields.addColor(this.options, "color");
        fields.add(this.options, "rotationSpeed", 0, 360, 1);
        fields.add(this.options, "n_from", 1, 10, 0.1);
        fields.add(this.options, "n_to", 1, 10, 0.1);
        fields.add(this.options, "a", 0, 1, 0.01);
        fields.open();
    }


    updateCursorPos = (event) => {
        let rect = this.canvasRef.current.getBoundingClientRect();
        this.mouseControls.xStartPos = event.clientX - rect.left;
        this.mouseControls.yStartPos = event.clientY - rect.top;
    }

    onMouseDown = (event) => {
        this.mouseControls.followMouse = true;
        this.updateCursorPos(event);
    }

    onMouseUp = (event) => {
        this.mouseControls.followMouse = false;
        this.updateCursorPos(event);
    }

    onMouseMove = (event) => {
        let rect = this.canvasRef.current.getBoundingClientRect();
        this.mouseControls.xPos = event.clientX - rect.left;
        this.mouseControls.yPos = event.clientY - rect.top;
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
