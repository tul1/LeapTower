
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
controls.target.set(-1, 0, 0)

camera.position.set(10, 10, 10)

let skyTextureLoader = new THREE.TextureLoader();
const loader = new GLTFLoader();
loader.load("/models/city.glb",
            (gltf) => {
                scene.add(gltf.scene)
                skyTextureLoader.load("maps/sky1.jpg", 
                                      (texture) => gltf.scene.getObjectByName("Cielo").material.map=texture
                )
            },
            null,
            (err) => console.log(err))


/*
const skyGeo = new THREE.SphereBufferGeometry(200,64,64);
const skyMat = new THREE.MeshBasicMaterial();

const sky = new THREE.Mesh(skyGeo,skyMat);
//scene.add(sky);
*/

const animate = function () {

    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)

}

animate()