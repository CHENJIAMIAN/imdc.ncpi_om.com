import {
    DoubleSide,
    sRGBEncoding,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    MeshStandardMaterial,
    MeshPhysicalMaterial,
    PlaneGeometry,
    RepeatWrapping,
    FrontSide,
    Object3D,
    Vector3,
    Group,
    Color,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    HemisphereLight,
    DirectionalLight,
    PointLight,
    SpotLight,
    AmbientLight,
    SpotLightHelper,
    DirectionalLightHelper,
    CameraHelper,
    BoxGeometry,
    SphereGeometry,
    BufferGeometry,
    BufferAttribute,
    MeshNormalMaterial,
    Vector2,
    LinearMipmapLinearFilter,
    Clock,
    AxesHelper,
    GridHelper,
    NoToneMapping,
    ReinhardToneMapping,
    CineonToneMapping,
    ACESFilmicToneMapping,
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
    CustomBlending,
    AddEquation,
    SubtractEquation,
    ReverseSubtractEquation,
    MinEquation,
    MaxEquation,
    ZeroFactor,
    OneFactor,
    SrcColorFactor,
    OneMinusSrcColorFactor,
    SrcAlphaFactor,
    OneMinusSrcAlphaFactor,
    DstAlphaFactor,
    OneMinusDstAlphaFactor,
    DstColorFactor,
    OneMinusDstColorFactor,
    SrcAlphaSaturateFactor,
    REVISION,
    MOUSE,
    Vector4,
    Vector2,
    Color,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    Clock,
    HalfFloatType,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    MOUSE,
    Vector4,
    Vector3,
    Vector2,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    REVISION,
    Clock,
    HalfFloatType,
} from "./index-D4L0IM0P.js"
import Stats from "stats.js"
import { Tweakpane } from 'tweakpane'
import { OrbitControls } from "./OrbitControls-DvibNlCA.js"

class ModelViewer extends EventTarget {
    constructor({ container, canvas, cssElement, options = {} } = {}) {
        super()
        this.clock = new Clock()
        this.timeInfo = {
            delta: 0
        }
        this.container = container
        this.canvas = canvas
        this.cssElement = cssElement

        const width = this.container.offsetWidth
        const height = this.container.offsetHeight
        const aspect = width / height
        const pixelRatio = window.devicePixelRatio

        this.sizes = {
            width: width,
            height: height,
            aspect: aspect,
            pixelRatio: pixelRatio
        }

        this.camera = new PerspectiveCamera(60, this.sizes.aspect, 0.1, 2000)
        this.camera.position.set(0, 0, 5)
        this.scene = new Scene()
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        })
        this.renderer.shadowMap.type = PCFSoftShadowMap
        this.renderer.setPixelRatio(pixelRatio)
        this.renderer.setSize(width, height)
        this.camera.updateProjectionMatrix()

        this.css2DRenderer = new CSS2DRenderer(this.cssElement)
        this.css2DRenderer.setSize(width, height)

        this.orbitControls = null
        if (options.orbitControls) {
            this.enabledOrbitControls()
        }

        this.cameraControls = null
        if (options.enabledCameraControls) {
            this.enabledCameraControls()
        }

        this.mouseEventHandler = new MouseEventHandler(this.camera, this.canvas, this.scene)
        this.mouseEventHandler.enabled = false

        this.resourceLoader = new ResourceLoader()

        window.addEventListener("resize", this.resetSize.bind(this))

        this.composer = null
        this.renderPass = null
        this.effectFXAA = null
        this.outlinePass = null
        this.outputPass = null
        if (options.enabledPostprocessing) {
            this.enabledPostprocessing()
        }

        this.lightGroup = new Group()
        this.lightGroup.name = "lightGroup"
        this.scene.add(this.lightGroup)

        this.defaultSky()

        // 调试工具
        this.stats = new Stats()
        this.stats.domElement.style.top = "unset"
        this.stats.domElement.style.bottom = "0"
        this.container.appendChild(this.stats.domElement)

        this.pane = new Tweakpane({
            title: "Debug",
            container: this.container,
        })

        this.pane.element.style.position = "absolute"
        this.pane.element.style.zIndex = "1000"
        this.pane.element.style.right = "5px"
        this.pane.element.style.top = "5px"
        this.pane.element.style.width = "auto"
        this.pane.element.style.minWidth = "200px"
        this.pane.element.style.maxHeight = "95%"
        this.pane.element.style.overflowY = "auto"
        this.pane.element.style.overflowX = "hidden"

        this.lightPane = this.pane.addFolder({
            title: "LightHelper"
        })

        this.lightHelperGroup = new Group()
        this.lightHelperGroup.name = "lightHelperGroup"
        this.scene.add(this.lightHelperGroup)
    }

    async enabledPostprocessing (options = {}) {
        const { EffectComposer } = await import("./EffectComposer-BBPlgFtC.js")
        const { RenderPass } = await import("./RenderPass-DlCygASy.js")
        const { ShaderPass } = await import("./ShaderPass-CMl3JXW9.js")
        const { FXAAShader } = await import("./FXAAShader-3Vj3PVLq.js")
        const { OutlinePass } = await import("./OutlinePass-wl3jTg2D.js")
        const { OutputPass } = await import("./OutputPass-ihIgfo1d.js")

        this.composer = new EffectComposer(this.renderer)
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.composer.addPass(this.renderPass)

        this.effectFXAA = new ShaderPass(FXAAShader)
        this.effectFXAA.uniforms.resolution.value.set(1 / this.sizes.width * this.sizes.pixelRatio, 1 / this.sizes.height * this.sizes.pixelRatio)
        this.composer.addPass(this.effectFXAA)

        this.outlinePass = new OutlinePass(new Vector2(this.sizes.width, this.sizes.height), this.scene, this.camera)
        this.composer.addPass(this.outlinePass)

        this.outputPass = new OutputPass()
        this.composer.addPass(this.outputPass)
    }

    async enabledOrbitControls (options) {
        if (this.orbitControls) {
            return console.warn("OrbitControls already initialized!")
        }
        const { OrbitControls } = await import("./OrbitControls-DvibNlCA.js")
        const controls = new OrbitControls(this.camera, this.canvas)
        controls.minDistance = 0.000001
        controls.enableDamping = true
        controls.dampingFactor = 0.2
        controls.update()
        this.orbitControls = controls
    }
    async enabledCameraControls (options) {
        if (this.cameraControls) {
            return console.warn("CameraControls is already initialized!")
        }

        const { default: CameraControls } = await import(
            "camera-controls"
        )
        CameraControls.install({ THREE: { Vector2, Vector3, Vector4, Quaternion, Matrix4, Spherical, Box3, Sphere, Raycaster, MathUtils: Math } })

        const cameraControls = new CameraControls(this.camera, this.renderer.domElement)

        cameraControls.azimuthRotateSpeed = 1 // negative value to invert rotation direction
        cameraControls.polarRotateSpeed = 1 // negative value to invert rotation direction
        cameraControls.truckSpeed = 1
        cameraControls.dollySpeed = window.innerWidth > 1000 ? 0.3 : 1
        cameraControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY
        cameraControls.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK
        this.cameraControls = cameraControls
    }

    createDirectionalLight (color, intensity) {
        const light = new DirectionalLight(color, intensity)
        this.lightGroup.add(light)
        return {
            light: light
        }
    }

    createPointLight (color, intensity) {
        const light = new PointLight(color, intensity)
        this.lightGroup.add(light)
        return {
            light: light
        }
    }

    createSpotLight (color, intensity) {
        const light = new SpotLight(color, intensity)
        this.lightGroup.add(light)
        return {
            light: light
        }
    }

    createAmbientLight (color, intensity) {
        const light = new AmbientLight(color, intensity)
        this.lightGroup.add(light)
        return {
            light: light
        }
    }

    createHemisphereLight (skyColor, groundColor, intensity) {
        const light = new HemisphereLight(skyColor, groundColor, intensity)
        this.lightGroup.add(light)
        return {
            light: light
        }
    }

    defaultSky (open = true) {
        if (!open) {
            this.scene.environment = null
            return
        }
        const sky = new SkyDome()
        const pmremGenerator = new PMREMGenerator(this.renderer)
        this.scene.environment = pmremGenerator.fromScene(sky).texture
    }

    updateHDR (url, onLoad, onProgress, onError) {
        return this.resourceLoader.loaderRgbe(url, texture => {
            this.scene.environment = texture
            onLoad && onLoad(texture)
        }, onProgress, err => {
            console.error(err)
            onError && onError(err)
        })
    }

    resetSize () {
        this.sizes.width = this.container.offsetWidth
        this.sizes.height = this.container.offsetHeight
        this.sizes.aspect = this.sizes.width / this.sizes.height
        this.sizes.pixelRatio = window.devicePixelRatio
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.camera.aspect = this.sizes.aspect
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.camera.updateProjectionMatrix()
        this.css2DRenderer.setSize(this.sizes.width, this.sizes.height)
        this.composer?.setSize(this.sizes.width, this.sizes.height)
        this.effectFXAA && this.effectFXAA.uniforms.resolution.value.set(1 / this.sizes.width * this.sizes.pixelRatio, 1 / this.sizes.height * this.sizes.pixelRatio)
    }

    render () {
        const delta = this.clock.getDelta()
        this.timeInfo.delta = delta
        if (this.orbitControls) {
            this.orbitControls.update()
        } else if (this.cameraControls) {
            this.cameraControls.update(delta)
        }
        this.renderer.render(this.scene, this.camera)
        this.css2DRenderer.render(this.scene, this.camera)
    }

    renderComposer () {
        const delta = this.clock.getDelta()
        this.timeInfo.delta = delta
        if (this.orbitControls) {
            this.orbitControls.update()
        } else if (this.cameraControls) {
            this.cameraControls.update(delta)
        }
        this.composer?.render()
        this.css2DRenderer.render(this.scene, this.camera)
    }

    destroyObject3D (object3D) {
        object3D.traverse(child => {
            if (child instanceof Mesh) {
                child.geometry.dispose()
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose())
                } else {
                    child.material.dispose()
                }
            }
        })
    }

    destroy () {
        this.destroyObject3D(this.scene)
        this.scene = null
        this.camera = null
        this.renderer.dispose()
        this.renderer.forceContextLoss()
        this.renderer.context = null
        this.renderer.domElement = null
        this.renderer = null
        this.composer?.dispose()
        this.composer = null
        this.renderPass?.dispose()
        this.renderPass = null
        this.effectFXAA?.dispose()
        this.effectFXAA = null
        this.outlinePass?.dispose()
        this.outlinePass = null
        this.outputPass?.dispose()
        this.outputPass = null
        this.orbitControls?.dispose()
        this.orbitControls = null
        this.cameraControls?.dispose()
        this.cameraControls = null
    }
}