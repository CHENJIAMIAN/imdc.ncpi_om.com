const {
    Texture,
    LinearFilter,
    ShaderMaterial,
    DoubleSide,
    PlaneGeometry,
    Mesh,
    Vector4,
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    AmbientLight
} = THREE


const heatData = [{
    x: -3.37,
    y: 3.5,
    radius: 3.35,
    weight: .81
}, {
    x: -3.6,
    y: 1.06,
    radius: 3.45,
    weight: .58
}, {
    x: -3.55,
    y: -1.25,
    radius: 3.15,
    weight: .59
}, {
    x: -3.63,
    y: -3.65,
    radius: 3.05,
    weight: .75
}, {
    x: 3.21,
    y: 3.8,
    radius: 3.25,
    weight: .69
}, {
    x: 3.11,
    y: 1.31,
    radius: 3.2,
    weight: .7
}, {
    x: 3.01,
    y: -1.29,
    radius: 3.2,
    weight: .69
}, {
    x: 3.09,
    y: -3.71,
    radius: 3.1,
    weight: .8
}, {
    x: -.93,
    y: 4.96,
    radius: 3.15,
    weight: .69
}, {
    x: 1.16,
    y: 4.96,
    radius: 3.3,
    weight: .59
}, {
    x: -1.1,
    y: -5.07,
    radius: 3.3,
    weight: .7
}, {
    x: 1.04,
    y: -5.15,
    radius: 3.3,
    weight: .69
}, {
    x: -.67,
    y: 2.77,
    radius: 2.35,
    weight: .58
}, {
    x: -.67,
    y: 1.76,
    radius: 2.4,
    weight: .44
}, {
    x: -.66,
    y: 1.16,
    radius: 2.25,
    weight: .44
}, {
    x: -.68,
    y: .63,
    radius: 2.15,
    weight: .44
}, {
    x: -.7,
    y: .13,
    radius: 2.4,
    weight: .44
}, {
    x: -.71,
    y: -.47,
    radius: 2.2,
    weight: .44
}, {
    x: -.72,
    y: -1.1,
    radius: 2.15,
    weight: .44
}, {
    x: -.71,
    y: -1.68,
    radius: 2.2,
    weight: .44
}, {
    x: -.72,
    y: -2.27,
    radius: 2.2,
    weight: .44
}, {
    x: -.67,
    y: -3.31,
    radius: 2.2,
    weight: .58
}, {
    x: .67,
    y: 2.84,
    radius: 2,
    weight: .58
}, {
    x: .65,
    y: 1.82,
    radius: 2.1,
    weight: .43
}, {
    x: .65,
    y: 1.27,
    radius: 2.3,
    weight: .43
}, {
    x: .66,
    y: .62,
    radius: 2.35,
    weight: .44
}, {
    x: .65,
    y: .04,
    radius: 2.2,
    weight: .44
}, {
    x: .64,
    y: -.56,
    radius: 2.25,
    weight: .44
}, {
    x: .65,
    y: -1.11,
    radius: 2.5,
    weight: .44
}, {
    x: .67,
    y: -1.74,
    radius: 2.05,
    weight: .36
}, {
    x: .67,
    y: -2.35,
    radius: 2.1,
    weight: .36
}, {
    x: .71,
    y: -3.14,
    radius: 2.05,
    weight: .43
}]
const planeSize = 20
const pixelScale = 20 // 修改：保持一致  
const createPalette = (options = {}) => {
    options = Object.assign({
        '0': '#2a82e4',
        '0.375': '#48c0f7',
        '0.5': '#11d813',
        '0.625': '#ffeb3b',
        '0.75': '#ff8d1a',
        '0.875': '#fe220b',
        '1': '#fe220b'
    }, options)
    const width = 256
    const height = 10
    const canvas = document.getElementById('paletteCanvas') || document.createElement('canvas')
    canvas.setAttribute('id', 'paletteCanvas')
    canvas.width = width
    canvas.height = height
    canvas.style.position = 'absolute'
    canvas.style.top = '20px'
    canvas.style.left = `calc(50% - ${width / 2}px)`
    canvas.style.zIndex = '5000'
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    for (const stop in options) {
        gradient.addColorStop(Number(stop), options[stop])
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    const texture = new Texture(canvas)
    texture.minFilter = LinearFilter
    texture.needsUpdate = true
    return texture
}
const createHeatmap = (options = {}) => {
    let { heatData = [], radius: radius = 5, size = 20, pixelScale: pixelScale = 10 } = options
    const diameter = size * pixelScale
    const r = radius
    const canvas = document.getElementById('canvasMap') || document.createElement('canvas')
    canvas.setAttribute('id', 'canvasMap')
    canvas.width = diameter
    canvas.height = diameter
    canvas.style.position = 'absolute'
    canvas.style.top = '40px'
    canvas.style.left = `calc(50% - ${r / 2}px)`
    canvas.style.zIndex = '5000'
    const ctx = canvas.getContext('2d')
    const texture = new Texture(canvas)
    texture.minFilter = LinearFilter
    texture.needsUpdate = true
    function drawCircle (ctx, x, y, radius, weight) {
        radius = parseInt(radius * weight)
        const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        radialGradient.addColorStop(0, 'rgba(255, 0, 0, 1)')
        radialGradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
        ctx.fillStyle = radialGradient
        ctx.globalAlpha = weight
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
    }
    function update (data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (Array.isArray(data)) {
            data = data.map(item => {
                const { x, y, radius: radius = 5, weight } = item
                return {
                    x: (x / size + 0.5) * diameter,
                    y: (y / size + 0.5) * diameter,
                    radius: (radius || r) * pixelScale,
                    weight
                }
            })
            data.forEach(item => drawCircle(ctx, item.x, item.y, item.radius, item.weight))
            texture.needsUpdate = true
        }
    }
    update(heatData)
    return {
        texture,
        update
    }
}
// 顶点着色器  
var vertex_shader = /* glsl */ `  
	varying vec2 vUv;  
  void main() {  
    vUv = uv;  
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  
  }  
`

// 片元着色器  
var fragment_shader = /* glsl */ `  
  varying vec2 vUv;  
  uniform sampler2D alphaScaleMap;  
  uniform sampler2D paletteMap;  
  uniform vec4 colorBg;  

  void main() {  
    vec4 alphaColor = texture2D(alphaScaleMap, vUv);  
    vec4 color = texture2D(paletteMap, vec2(alphaColor.a, 1.0));  
    gl_FragColor = vec4(color.rgb, alphaColor.a);  
	}  
`

// 创建热力图材质的函数  
function createHeatmapMaterial (uniforms) {
    return new ShaderMaterial({
        side: DoubleSide,
        transparent: true,
        vertexShader: vertex_shader,
        fragmentShader: fragment_shader,
        uniforms: uniforms,
        alphaTest: 0.1,
        depthTest: false,
        depthWrite: false,
    })
}

// 创建热力图网格  
function generateHeatMap () {
    // 使用 createPalette 和 createHeatmap 函数  
    const paletteTexture = createPalette()
    const { texture: alphaTexture, update: updateHeatmap } = createHeatmap({
        // heatData: heatData,  
        size: planeSize,
        pixelScale: pixelScale, // 修改：保持一致  
    })
    const uniforms = {
        alphaScaleMap: { value: alphaTexture },
        paletteMap: { value: paletteTexture }
    }

    // 创建平面几何体和材质  
    const geometry = new PlaneGeometry(planeSize, planeSize, planeSize, planeSize)
    const material = createHeatmapMaterial(uniforms)
    material.transparent = true
    material.depthTest = false
    material.depthWrite = false

    // 创建网格并添加到场景  
    const plane = new Mesh(geometry, material)
    plane.name = "plane"
    plane.rotation.x = -Math.PI / 2
    plane.position.y = 0.01
    plane.renderOrder = 100
    editor.scene.add(plane)

    // 暴露更新热力图数据的方法  
    window.updateHeatmap = updateHeatmap
}

async function initHotSpot () {
    // ... 其他代码  
    generateHeatMap()
    updateHeatmap(heatData)
    // ... 其他代码  
}

initHotSpot()