import React, {Component} from "react";

import * as THREE from 'three-full';
import vxShader from './main.vert';
import fragShader from './main.frag';

import {createAxes} from './AxesObject.js';
import * as dat from 'dat.gui'
import parse from 'color-parse';

import bunny_model from './bunny.obj'

function getMousePosition(viewArea, canvas, event) {
    let rect = canvas.getBoundingClientRect();
    viewArea.mouse.x = event.clientX - rect.left;
    viewArea.mouse.y = event.clientY - rect.top;
    console.log("Coordinate x: " + x,
        "Coordinate y: " + y);
}

// function scrollCallback(viewArea, canvas, event) {
//     let rect = canvas.getBoundingClientRect();
//     viewArea.mouse.x = event.clientX - rect.left;
//     viewArea.mouse.y = event.clientY - rect.top;
//     console.log("Coordinate x: " + x,
//         "Coordinate y: " + y);
// }


// class ScreenBoundsHolder {
//     constructor() {
//         this.followMouse = false;
//         this.scaleBase = 9.0 / 10.0;
//         this.scaleScreen = 1.0;
//         this.yOffset = 0;
//     }
// }


export class ViewArea extends Component {
    constructor() {
        super();
        this.c = new THREE.Vector2(-0.70176, 0.3842);
        this.iterations = 1000;
        this.scaleScreen = 1.0
        this.scaleBase = 9.0 / 10.0;

        this.customMaterial = new THREE.ShaderMaterial({
            uniforms:
                {
                    u_color: {value: new THREE.Vector3()},
                    iterations: {value: this.iterations},
                    c: {value: this.c},
                    r : {value: (1 + ((1 + 4 * this.c.length()) ** 0.5)) / 2},
                    width : {value: 0.0},
                    height : {value: 0.0},
                    scaleScreen : {value: this.scaleScreen ** this.scaleBase}
                },
            side: THREE.DoubleSide,
            vertexShader: vxShader,
            fragmentShader: fragShader,
            vertexColors: true
        });

        this.canvasRef = React.createRef();
        this.divRef = React.createRef();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, 1, .1, 1000);
        this.mouse = new THREE.Vector2();
        //
        this.camera.position.z = 0;
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.bunnyRotation = 0;
        this.look_x = 0;
        this.look_y = 0;
        this.look_z = 1;
        this.camera.lookAt(0, 0, 1);
        //
        const geometry = new THREE.BufferGeometry();

        const indices = [0, 1, 2, 0, 3, 2];
        this.a = -2.0;
        this.b = 2.0;
        this.c = 1;

        // let vertices = [
        //     this.c, this.a, this.a * 2.5,
        //     this.c, this.b, this.a * 2.5,
        //     this.c, this.b, this.b * 2.5,
        //     this.c, this.a, this.b * 2.5,
        // ];

        let vertices = [
             this.a * 2.5,  this.b, this.c,
             this.a * 2.5,  this.a, this.c,
             this.b * 2.5,  this.a, this.c,
             this.b * 2.5,  this.b, this.c,
        ];

        const colors = [
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
        ];

        geometry.setIndex(indices);
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

        // this.bunnyRotation = 81;
        this.mesh = new THREE.Mesh(geometry, this.customMaterial);
        this.scene.add(this.mesh);

        this.options = {
            color: "#ffae23",
            rotationSpeed: 0
        };

    }

    componentDidMount() {
        // разбираемся с мышкой

        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            return;
        }

        this.addDatGUI();

        const renderer = new THREE.WebGLRenderer({canvas: canvas, context: gl});
        renderer.setSize(canvas.width, canvas.height);
        this.customMaterial.uniforms.width.value = canvas.width;
        this.customMaterial.uniforms.height.value = canvas.height;

        // this.prevTime = new Date();
        let onMouseDown = function(event) {getMousePosition(canvas, event)};

        canvas.addEventListener('mousedown', onMouseDown, false)

        const renderLoopTick = () => {
        //     // Handle resize
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
                this.camera.lookAt(this.look_x, this.look_y, this.look_z);
                this.customMaterial.uniforms.width.value = this.divRef.current.offsetWidth;
                this.customMaterial.uniforms.height.value = this.divRef.current.offsetWidth;
                // this.controls = new THREE.OrbitControls(this.camera, canvas);
            }
            // const curTime = new Date();
            // const d = new THREE.Vector3();
            // const q = new THREE.Quaternion();
            // const s = new THREE.Vector3();
            // this.camera.matrixWorld.decompose(d, q, s);

            // this.bunnyRotation = this.bunnyRotation + (curTime.getTime() - this.prevTime.getTime()) / 1000 * this.options.rotationSpeed * Math.PI / 180;
            this.mesh.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), this.bunnyRotation);
            this.customMaterial.uniforms.width.value = canvas.width;
            this.customMaterial.uniforms.height.value = canvas.height;
            this.customMaterial.uniforms.iterations.value = this.iterations;
            this.customMaterial.uniforms.scaleScreen.value = this.scaleBase ** this.scaleScreen;


            this.camera.lookAt(this.look_x, this.look_y, this.look_z);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.3, 0.7, 0.3, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            renderer.render(this.scene, this.camera);
            // let test = getMousePosition(canvas);
            // this.prevTime = curTime;

            requestAnimationFrame(renderLoopTick);
        }

        requestAnimationFrame(renderLoopTick);

    }

    addDatGUI = () => {
        this.gui = new dat.GUI({name: "My GUI"});
        var fields = this.gui.addFolder("Field");
        fields.addColor(this.options, "color");
        fields.add(this, "iterations", 1000, 10000, 10);
        fields.add(this.options, "rotationSpeed", 0, 200, 1);
        fields.add(this, "look_x", -10, 10, .1);
        fields.add(this, "look_y", -10, 10, .1);
        fields.add(this, "look_z", -10, 10, .1);
        fields.add(this, "scaleScreen", -10, 10, .1);

        fields.add(this, "bunnyRotation", 0, 10, .01);

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
