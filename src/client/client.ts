
import * as THREE from "/build/three.module.js"
import { OrbitControls } from "/jsm/controls/OrbitControls"
import { GLTFLoader } from "/jsm/loaders/GLTFLoader";

const scene: THREE.Scene = new THREE.Scene()

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Lights
const ambientLight = new THREE.HemisphereLight(new THREE.Color(0.3, 0.3, 0.5),
                                               new THREE.Color(0.8, 0.5, 0.1),
                                               0.7)
const sunLight = new THREE.DirectionalLight(new THREE.Color(1, 0.9, 0.8), 1)
sunLight.position.set(10, 10, 10)
scene.add(sunLight)
scene.add(ambientLight)

// Camera
const controls = new OrbitControls(camera, renderer.domElement)
camera.position.set(10, 10, 10)


const loader = new GLTFLoader();
loader.load("/models/city.glb",
            (gltf) => scene.add(gltf.scene),
            null,
            (err) => console.log(err))

const animate = function () {

    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)

}

animate()