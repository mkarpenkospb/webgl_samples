import React, { Component } from "react";

import * as THREE from 'three-full';
import vxShader from '../shaders/terra.vert';
import fragShader from '../shaders/terra.frag';

import { createAxes } from './AxesObject.js';
import * as dat from 'dat.gui'
import parse from 'color-parse';

import bunny_model from './bunny.obj'

function optionColorToVec3(color){
  let parsedColor = parse(color);

  let values = parsedColor.values;

  return new THREE.Vector3(values[0] / 255, values[1] / 255, values[2] / 255);
}

export class ViewArea extends Component {
  constructor() {
    super();

    this.customMaterial = new THREE.ShaderMaterial({
      uniforms:
      {
        u_color: {value: new THREE.Vector3()},
      },

      vertexShader: vxShader,
      fragmentShader: fragShader
    });

    this.canvasRef = React.createRef();
    this.divRef = React.createRef();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 1000 );

    this.camera.position.z = 15;
    this.camera.position.x = 15;
    this.camera.position.y = 15;

    this.scene.add(createAxes());

    let loader = new THREE.OBJLoader();

    this.bunnyObject = loader.parse(bunny_model);
    this.bunnyObject.traverse( (child) => {
      if ( child instanceof THREE.Mesh ) {
          child.material = this.terraMaterial;
      }
    });
    this.bunnyRotation = 0;

    this.scene.add(this.bunnyObject);

    this.options = {
      color: "#ffae23",
      rotationSpeed: 60
    };
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    if (!canvas) {
      return;
    }

    this.controls = new THREE.OrbitControls(this.camera, this.canvasRef.current);
    this.controls.update();

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      return;
    }

    this.addDatGUI();

    var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: gl } );
    renderer.setSize(canvas.width, canvas.height );

    this.prevTime = new Date();

    const renderLoopTick = () => {
      // Handle resize
      if (this.divRef.current.offsetWidth != canvas.width ||
          this.divRef.current.offsetHeight != canvas.height) {
            console.log(`Resizing canvas: ${this.divRef.current.offsetWidth}x${this.divRef.current.offsetHeight}`);

            canvas.width = this.divRef.current.offsetWidth;
            canvas.height = this.divRef.current.offsetHeight;

            renderer.setSize(canvas.width, canvas.height );

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
            this.controls = new THREE.OrbitControls(this.camera, canvas);
      }

      const curTime = new Date();

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.2, 0.2, 0.2, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.controls.update();

      this.bunnyObject.position.set(3, 1, 1);
      this.bunnyObject.scale.set(30, 30, 30);
      this.bunnyRotation = this.bunnyRotation + (curTime.getTime() - this.prevTime.getTime()) / 1000 * this.options.rotationSpeed * Math.PI / 180;
      this.bunnyObject.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), this.bunnyRotation);

      this.terraMaterial.uniforms.u_color.value = optionColorToVec3(this.options.color);

      renderer.render( this.scene, this.camera );

      this.prevTime = curTime;

      requestAnimationFrame(renderLoopTick);
    }

    requestAnimationFrame(renderLoopTick);

  }

  addDatGUI = () => {
    this.gui = new dat.GUI({ name: "My GUI" });

    var fields = this.gui.addFolder("Field");
    fields.addColor(this.options, "color");
    fields.add(this.options, "rotationSpeed", 0, 360, 1);
    fields.open();
  }

  render() {
    return (
      <div ref={this.divRef} style={{width: "100%",height: "100vh"}}>
        <canvas
          ref={this.canvasRef}
          style={{width: "100%",height: "100%"}}
        />
      </div>
  );
  }
}
