/**  
 * 资源加载器  
 */  
class ResourceLoader {  
    constructor() {  
        this.loadingSet = new Set(); // 使用 Set 来存储正在加载的资源 URL，确保唯一性  
        this.loadingManager = new THREE.LoadingManager();  
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);  
        this.rgbeLoader = new RGBELoader(this.loadingManager); // 使用 THREE.RGBELoader  
        this.items = []; // 加载完成的资源列表  
        this.hasFinishedLoading = false; // 是否已完成所有加载  
        this.progress = 0; // 加载进度  

        this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {  
            this.loadingSet.add(url);  
            this.items = Array.from(this.loadingSet);  
            this.progress = itemsLoaded / itemsTotal;  
            this.hasFinishedLoading = false;  
            this.loadingSet.clear(); // 清空 Set  
        };  

        this.loadingManager.onLoad = () => {  
            this.hasFinishedLoading = true;  
        };  

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {  
            this.loadingSet.add(url);  
            this.items = Array.from(this.loadingSet);  
            this.progress = itemsLoaded / itemsTotal;  
        };  

        this.loadingManager.onError = (url) => {  
            console.error("加载出错", url);  
        };  
    }  

    /**  
     * 加载 GLTF 模型  
     * @param {string | object} options 加载选项  
     * @param {string} options.url 模型 URL  
     * @param {function} [options.onLoad] 加载完成回调  
     * @param {function} [options.onProgress] 加载进度回调  
     * @param {function} [options.onError] 加载错误回调  
     * @param {THREE.LoadingManager} [options.manager] 加载管理器  
     * @returns {Promise<object>} 加载的 GLTF 模型数据  
     */  
    async loaderGLTF(options) {  
        const { url, onLoad = undefined, onProgress = this.loaderOnProgress, onError = undefined, manager = this.loadingManager } =  
            typeof options === "string" ? { url: options } : options;  

        const { DRACOLoader } = await import("./DRACOLoader-DRfW5f7D.js"); // 动态导入 DRACOLoader  
        const { GLTFLoader } = await import("./GLTFLoader-Cky4qAiS.js"); // 动态导入 GLTFLoader  

        const dracoLoader = new DRACOLoader();  
        dracoLoader.setDecoderPath("./draco/gltf/");  

        const gltfLoader = new GLTFLoader(manager);  
        gltfLoader.setDRACOLoader(dracoLoader);  

        return new Promise((resolve, reject) => {  
            gltfLoader.load(  
                url,  
                function (gltf) {  
                    onLoad?.(gltf);  
                    resolve(gltf);  
                },  
                onProgress,  
                onError  
            );  
        });  
    }  

    /**  
     * 加载 FBX 模型  
     * @param {string | object} options 加载选项  
     * @param {string} options.url 模型 URL  
     * @param {function} [options.onLoad] 加载完成回调  
     * @param {function} [options.onProgress] 加载进度回调  
     * @param {function} [options.onError] 加载错误回调  
     * @param {THREE.LoadingManager} [options.manager] 加载管理器  
     * @returns {Promise<object>} 加载的 FBX 模型数据  
     */  
    async loaderFbx(options) {  
        const { url, onLoad = undefined, onProgress = this.loaderOnProgress, onError = undefined, manager = this.loadingManager } =  
            typeof options === "string" ? { url: options } : options;  

        const { FBXLoader } = await import("./FBXLoader-BkFCIu1-.js"); // 动态导入 FBXLoader  

        const fbxLoader = new FBXLoader(manager);  

        return new Promise((resolve, reject) => {  
            fbxLoader.load(  
                url,  
                function (fbx) {  
                    onLoad?.(fbx);  
                    resolve(fbx);  
                },  
                onProgress,  
                onError  
            );  
        });  
    }  

    /**  
     * 加载 GLTF 模型中的纹理  
     * @param {string} url 纹理 URL  
     * @param {function} [onLoad] 加载完成回调  
     * @param {function} [onProgress] 加载进度回调  
     * @param {function} [onError] 加载错误回调  
     * @returns {THREE.Texture} 加载的纹理  
     */  
    loaderGltfTexture(url, onLoad, onProgress = this.loaderOnProgress, onError) {  
        const texture = this.textureLoader.load(url, onLoad, onProgress, onError);  
        texture.colorSpace = THREE.SRGBColorSpace;  
        texture.flipY = false;  
        return texture;  
    }  

    /**  
     * 加载普通纹理  
     * @param {string} url 纹理 URL  
     * @param {function} [onLoad] 加载完成回调  
     * @param {function} [onProgress] 加载进度回调  
     * @param {function} [onError] 加载错误回调  
     * @returns {THREE.Texture} 加载的纹理  
     */  
    loaderTexture(url, onLoad, onProgress = this.loaderOnProgress, onError) {  
        const texture = this.textureLoader.load(url, onLoad, onProgress, onError);  
        texture.colorSpace = THREE.SRGBColorSpace;  
        return texture;  
    }  

    /**  
     * 加载 RGBA 格式的 HDR 环境贴图  
     * @param {string} url 纹理 URL  
     * @param {function} [onLoad] 加载完成回调  
     * @param {function} [onProgress] 加载进度回调  
     * @param {function} [onError] 加载错误回调  
     * @returns {THREE.DataTexture} 加载的 HDR 贴图  
     */  
    loaderRgbe(url, onLoad, onProgress = this.loaderOnProgress, onError) {  
        const texture = this.rgbeLoader.load(url, onLoad, onProgress, onError);  
        texture.mapping = THREE.EquirectangularReflectionMapping; // 设置映射方式  
        texture.dispose(); // 释放资源  
        return texture;  
    }  

    /**  
     * 默认的加载进度回调函数（可以根据需要重写）  
     * @param {string} url 资源 URL  
     * @param {number} itemsLoaded 已加载数量  
     * @param {number} itemsTotal 总数量  
     */  
    loaderOnProgress(url, itemsLoaded, itemsTotal) {  
        // 可以在这里添加默认的进度处理逻辑，例如打印进度信息  
        // console.log("Loading progress:", url, itemsLoaded, itemsTotal);  
    }  
}