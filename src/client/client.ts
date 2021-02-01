
import * as THREE from "/build/three.module.js"
import { OrbitControls } from "/jsm/controls/OrbitControls"

const scene: THREE.Scene = new THREE.Scene()

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const light= new THREE.PointLight(0xFFFFFF,1,500);
const controls = new OrbitControls(camera, renderer.domElement)

const geometry: THREE.BoxGeometry = new THREE.BoxGeometry()
const material: THREE.MeshBasicMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false })

const cube: THREE.Mesh = new THREE.Mesh(geometry, material)

light.position.set(100,100,100)

scene.add(cube)
scene.add(light);

camera.position.z = 2

const animate = function () {

    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.03

    controls.update()

    renderer.render(scene, camera)

}

animate()