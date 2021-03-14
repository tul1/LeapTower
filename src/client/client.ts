
import * as THREE from "/build/three.module.js"
import {OrbitControls} from "/jsm/controls/OrbitControls"
import {LeapTowerScene} from "./LeapTowerScene.js"

// Renderer
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Camera
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(10, 10, 10)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(-1, 0, 0)

// Scene
const scene = new LeapTowerScene()

const animate = function () {
    
    requestAnimationFrame(animate)

    scene.animate_water(0.00005)

    controls.update()
    renderer.render(scene.get_scene(), camera)

}

animate()