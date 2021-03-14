import * as THREE from "/build/three.module.js"
import { GLTFLoader } from "/jsm/loaders/GLTFLoader"

export class LeapTowerScene {
    scene: THREE.Scene
    skyTexture: THREE.Texture
    waterNormalTexture: THREE.Texture
    waterDifuseTexture: THREE.Texture

    constructor() {
        this.scene = new THREE.Scene()
        this.set_lights()
        this.set_models()
    }

    set_lights(): void {
        const ambientLight = new THREE.HemisphereLight(new THREE.Color(0.3, 0.3, 0.5),
        new THREE.Color(0.8, 0.5, 0.1),
        0.7)
        this.scene.add(ambientLight)

        const sunLight = new THREE.DirectionalLight(new THREE.Color(1, 0.9, 0.8), 1)
        sunLight.position.set(10, 10, 10)
        this.scene.add(sunLight)
    }

    set_models(): void {
        const manager = new THREE.LoadingManager()
        manager.onLoad = () => {
            const sky = <THREE.Mesh> this.scene.getObjectByName("Cielo")
            sky.material = new THREE.MeshBasicMaterial({ map: this.skyTexture})
        
            this.waterNormalTexture.wrapS = THREE.RepeatWrapping
            this.waterNormalTexture.wrapT = THREE.RepeatWrapping
            this.waterDifuseTexture.wrapS = THREE.RepeatWrapping
            this.waterDifuseTexture.wrapT = THREE.RepeatWrapping
            const waterNormal = <THREE.Mesh> this.scene.getObjectByName("mar")
            waterNormal.material = new THREE.MeshPhongMaterial({ normalMap: this.waterNormalTexture,
                                                                 map: this.waterDifuseTexture })
        }

        const skyTextureLoader = new THREE.TextureLoader(manager)
        const waterNormalTextureLoader = new THREE.TextureLoader(manager)
        const waterDifuseTextureLoader = new THREE.TextureLoader(manager)

        const loader = new GLTFLoader()
        loader.load("/models/city.glb",
                    (gltf) => {
                        this.scene.add(gltf.scene)
                        skyTextureLoader.load("maps/sky1.jpg", (texture) => this.skyTexture = texture)
                        waterDifuseTextureLoader.load("maps/aguaDeMar.jpg", (texture) => this.waterDifuseTexture = texture)
                        waterNormalTextureLoader.load("maps/aguaDeMar_normal.jpg", (texture) => this.waterNormalTexture = texture)
                    },
                    null,
                    (err) => console.log(err))
        
    }

    animate_water(delta: number): void {
        if(this.waterDifuseTexture && this.waterNormalTexture) {
            this.waterDifuseTexture.offset.x += delta
            this.waterNormalTexture.offset.x += delta
        }
    }

    get_scene(): THREE.Scene{
        return this.scene
    }
}
