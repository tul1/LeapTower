
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



const manager = new THREE.LoadingManager()
const skyTextureLoader = new THREE.TextureLoader(manager)
const waterNormalTextureLoader = new THREE.TextureLoader(manager)
const waterDifuseTextureLoader = new THREE.TextureLoader(manager)


let skyTexture: THREE.Texture = null
let waterNormalTexture: THREE.Texture = null
let waterDifuseTexture: THREE.Texture = null

manager.onLoad = function() {
    const sky = <THREE.Mesh> scene.getObjectByName("Cielo")
    sky.material = new THREE.MeshBasicMaterial({ map: skyTexture})

    waterNormalTexture.wrapS = THREE.RepeatWrapping
    waterNormalTexture.wrapT = THREE.RepeatWrapping
    waterDifuseTexture.wrapS = THREE.RepeatWrapping
    waterDifuseTexture.wrapT = THREE.RepeatWrapping
    const waterNormal = <THREE.Mesh> scene.getObjectByName("mar")
    waterNormal.material = new THREE.MeshPhongMaterial({ normalMap: waterNormalTexture, map: waterDifuseTexture})
}

const loader = new GLTFLoader()
loader.load("/models/city.glb",
            (gltf) => {
                scene.add(gltf.scene)
                skyTextureLoader.load("maps/sky1.jpg", (texture) => skyTexture = texture)
                waterDifuseTextureLoader.load("maps/aguaDeMar.jpg", (texture) => waterDifuseTexture = texture)
                waterNormalTextureLoader.load("maps/aguaDeMar_normal.jpg", (texture) => waterNormalTexture = texture)
            },
            null,
            (err) => console.log(err))

const animate = function () {
    
    requestAnimationFrame(animate)

    if(waterDifuseTexture && waterNormalTexture) {
        waterDifuseTexture.offset.x += 0.0001
        waterNormalTexture.offset.x += 0.0001
    }

    controls.update()
    renderer.render(scene, camera)

}

animate()