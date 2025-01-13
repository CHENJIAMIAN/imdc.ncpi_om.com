# 施耐德数据中心DEMO 逆向

## 成果

1. 首页
2. 液冷管路
    - 管的流动效果
        - 两个管模型叠加, 一个是包含底色的管, 一个是透明的管, 通过改变透明管的`alphaMap`的`offset.y`实现流动效果,见`animateOpacity`函数
    - 点`管路巡检`的流动效果
        - 见图`点 管路巡检 的流动效果的展UV实现.png`, 巧妙利用将整个管模型展UV贴图, 通过改变UV贴图`baseColor_2.png`的`offset.y`实现流动效果,见`startAnimation`函数
3. 温度云图
    - `云图.js` 不用`heatmap.js`,实现简单的平面云图效果
4. 母线温度
    - 母线上的温度效果,直接替换一个map为`const QA = "data:image/jpeg;base64..."`静态的材质
5. 气流模拟
    - `AirflowMaterial.js` 用柏林噪声纹理+时间动画 巧妙实现气流效果
6. 电力潮流模拟
    - 电流是怎么显示出来的? 直接改map的offset即可
7. AO贴图

## 难题

- <https://threejs.org/editor/预览时气流为什么没动起来>?
  - 在<https://threejs.org/editor/编辑时用setInterval(()=>{animations.update(0.01);}>, 16)可以动起来
  - 但是在<https://threejs.org/editor/预览时气流没动起来>, 原因是: 预览时是克隆了一个scene, 但是animations作用在原scene上, 所以预览时气流没动起来

---

## UI切换
```javascript
function updateUI(item) {//function cd(t)
    // 清空选中项数据
    selectedItemData.value = {};

    if (item.key === "yl_gl_xj") {
        selectedItemData.value = item;
    } else {
        currentModule.value = item;
        navItemList.value.forEach(navItem => {
            navItem.show = item.key === navItem.key;
        });
    }

    // 控制左侧导航栏显隐
    leftNavList.value.forEach(navItem => {
        navItem.show = item.key === navItem.key;
    });

    // 重置场景
    resetScene();

    switch (item.key) {
        case "sy": // 首页
            break;
        case "wd_yt": // 温度云图
            showTemperatureCloud(item.show);
            break;
        case "mx_wd": // 母线温度
            showBusbarTemperature(item.show);
            break;
        case "ql_mn": // 气流模拟
            toggleAirflowSimulation(true);
            break;
        case "yl_gl": // 液冷管路
            toggleLiquidCoolingPipes(true);
            break;
        case "dl_cl_mn": // 电力潮流模拟
            toggleElectricCurrentSimulation(true);
            break;
        case "yl_gl_xj": // 液冷管路巡检
            toggleLiquidCoolingInspection(true);
            break;
    }
}
```

**解释：**

1. **变量名转换：**

    *   `ma` 转换为 `selectedItemData`，表示当前选中的项的数据。
    *   `ms` 转换为 `currentModule`，表示当前选中的模块。
    *   `Sl` 转换为 `navItemList`，表示导航项列表。
    *   `lf` 转换为 `leftNavList`，表示左侧导航列表。

3. **函数调用：**

    *   `rf(t.show)` 转换为 `showTemperatureCloud(item.show)`，表示显示或隐藏温度云图。
    *   `af(t.show)` 转换为 `showBusbarTemperature(item.show)`，表示显示或隐藏母线温度。
    *   `Tl(!0)` 转换为 `toggleAirflowSimulation(true)`，表示开启气流模拟。
    *   `Ol(!0)` 转换为 `toggleLiquidCoolingPipes(true)`，表示显示液冷管路。
    *   `Al(!0)` 转换为 `toggleElectricCurrentSimulation(true)`，表示开启电力潮流模拟。
    *   `cf(!0)` 转换为 `toggleLiquidCoolingInspection(true)`，表示开启液冷管路巡检。
    *   `rS()` 转换为 `resetScene()`，表示重置场景。

---

```javascript
function toggleLiquidCoolingPipes(show = false) {//function Ol(t=!1)
    if (show) {
        const targetPosition = new THREE.Vector3(-0.07, 1.54, -0.03);
        const cameraPosition = new THREE.Vector3(-0.02, 10.47, 2.59);
        R.cameraControls.setTarget(...targetPosition.toArray(), true);
        R.cameraControls.setPosition(...cameraPosition.toArray(), true);
    }

    const inspectionParts = ["液冷巡检"];
    const coolingPipesParts = ["Cube", "Cube_1", "Cube_2", "Cube_3", "液冷管路"];

    R.sceneGroup.traverse(function (object) {
        if (inspectionParts.includes(object.name)) {
            object.visible = !show;
        } else if (coolingPipesParts.includes(object.name)) {
            object.visible = show;
        }
    });

    toggleMaterialsOpacity(["地板", "机柜底座", "前门", "后门", "天窗", "母线支架", "CDU", "桥架", "液冷巡检", "空调", "空调内部", "母线", "母线箱", "母线插头", "电线", "UPS", "UPS内部", "ACDU"], show);

    if (show) {
        animateOpacity("Cube", 1);
        animateOpacity("Cube_1", 1);
    }
}
```

**解释：**

1. **函数名:** `Ol` 被更名为更具描述性的 `toggleLiquidCoolingPipes`。
6. **函数调用:**
    *   `so` 被替换为更具描述性的函数名 `toggleMaterialsOpacity`。
    *   `ad` 被替换为更具描述性的函数名 `animateOpacity`。

**注意:**

*   这段代码依赖于外部变量和函数，例如 `R`, `THREE`, `Se`, `toggleMaterialsOpacity`, `animateOpacity` 等。

```javascript
function animateOpacity(objectName, speed = 1) {//function ad(t, e=1) 
    const object = R.sceneGroup.getObjectByName(objectName);

    // 确保材质是透明的
    object.material.transparent = true;

    // 设置渲染顺序，使透明物体最后渲染，避免排序问题
    object.renderOrder = -1;

    // 检查是否已经存在同名的动画
    if (!R.animations.find(objectName)) {
        // 如果之前没有纹理贴图，则将当前贴图保存为 alphaMap
        if (object.material.map) {
            object.material.alphaMap = object.material.map;
            object.material.map = null;
        }

        // 添加动画
        R.animations.add({
            name: objectName, // 动画名称使用对象名称
            map: object.material.alphaMap, // 传入alpha贴图
            update(deltaTime) {
                // 更新alpha贴图的偏移，实现动画效果
                this.map.offset.y += deltaTime * speed;
            },
        });
    }
}
```

```javascript
function toggleLiquidCoolingInspection(enable = false) {//function cf(t=!1) 
    if (enable) {
        const targetPosition = new THREE.Vector3(-0.07, 1.54, -0.03);
        const cameraPosition = new THREE.Vector3(-0.02, 10.47, 2.59);
        R.cameraControls.setTarget(...targetPosition.toArray(), true);
        R.cameraControls.setPosition(...cameraPosition.toArray(), true);
    }

    const visibleMeshes = ["液冷管路"];
    const hiddenMeshes = ["液冷巡检"];

    R.sceneGroup.traverse(function (object) {
        if (visibleMeshes.includes(object.name)) {
            object.visible = !enable;
        } else if (hiddenMeshes.includes(object.name)) {
            object.visible = enable;
        }
    });

    toggleMaterialsOpacity(["地板", "机柜底座", "前门", "后门", "天窗", "母线支架", "CDU", "桥架", "液冷巡检", "空调", "空调内部", "母线", "母线箱", "母线插头", "电线", "UPS", "UPS内部", "ACDU"], enable);

    if (enable) {
        startAnimation("液冷巡检", 0.001);
    }
}
function startAnimation(objectName, speed = 1) {
    const object = R.sceneGroup.getObjectByName(objectName);

    // 设置一个初始偏移，避免一开始就完全透明
    object.material.map.offset.y = 0.03; 
    
    // 将对象渲染顺序设置为 -1，确保透明物体最后渲染
    object.renderOrder = -1;
    
    // 确保材质是透明的
    object.material.transparent = true;

    // 检查是否已经存在同名动画
    if (!R.animations.find(objectName)) {
        R.animations.add({
            name: objectName,
            map: object.material.map, // 使用对象的贴图
            update(deltaTime) {
                // 更新贴图的 Y 轴偏移
                fa.value = this.map.offset.y += speed;
                // 当偏移量大于等于 0.5 时，停止动画
                if (this.map.offset.y >= 0.5) {
                    R.animations.removeByName(objectName);
                }
            },
        });
    }
}
```

**解释:**

5. **函数调用:**
    *   `so` 被替换为 `toggleMaterialsOpacity`，表示切换材质透明度。


```javascript
function toggleBusbarMaterial(mesh, useNewMaterial = false) {//function JA(t, e=!1) 
    const texture = R.loader.loaderGltfTexture(QA);
    texture.channel = 2;
    const newMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        metalness: 0
    });

    mesh.traverse(function (child) {
        if (!child.oldMat) {
            child.newMat = newMaterial;
            child.oldMat = child.material;
        }
        child.material = useNewMaterial ? child.newMat : child.oldMat;
    });
}

function showBusbarTemperature(reset = false) {//function af(t=!1) 
    if (reset) {
        const target = new THREE.Vector3(-0.2, 2.18, -0.21);
        const position = new THREE.Vector3(3.68, 5.76, 2.17);
        R.cameraControls.setTarget(...target.toArray(), true);
        R.cameraControls.setPosition(...position.toArray(), true);
    }

    const busbar = R.sceneGroup.getObjectByName("母线");
    toggleBusbarMaterial(busbar, reset);
}
```

```js
const textureNames = {
    "ACDU_AO":"ACDU_AO.jpg" ,
    "CDU_AO":"CDU_AO.jpg" ,
    "UPS_AO":"UPS_AO.jpg" ,
    "内部_AO":"内部_AO.jpg" ,
    "前门_AO":"前门_AO.jpg" ,
    "后门_AO":"后门_AO.jpg" ,
    "天窗_AO":"天窗_AO.jpg" ,
    "散热塔_AO":"散热塔_AO.jpg" ,
    "机柜底座_AO":"机柜底座_AO.jpg" ,
    "母线_AO":"母线_AO.jpg" ,
    "母线支架AO":"母线支架AO.jpg" ,
    "母线箱_AO":"母线箱_AO.jpg" ,
    "水泵_AO":"水泵_AO.jpg" ,
    "水网_AO":"水网_AO.jpg" ,
    "水网底座_AO":"水网底座_AO.jpg" ,
    "水网接口_AO":"水网接口_AO.jpg" ,
    "水网阀门_AO":"水网阀门_AO.jpg" ,
    "空调_AO":"空调_AO.jpg" ,
};

const pre = 'https://fastly.jsdelivr.net/gh/CHENJIAMIAN/imdc.ncpi_om.com@main/imdc.ncpi-om.com/ImdcPod/assets/ImdcPod/textures/AO/'
function applyAmbientOcclusionMaps() {
    function applyTextureToMesh(mesh, texture) {
        mesh.traverse(child => {
            if (child.isMesh) {
                child.material.aoMap = texture;
                child.material.aoMapIntensity = 1;
            }
        });
    }

    const aoTextureMappings = [];
    for (let name in textureNames) {
        aoTextureMappings.push({
            name: name.replace("_AO", ""),
            textureUrl:pre + textureNames[name]
        });
    }

    const textureLoader = new THREE.TextureLoader();  

    aoTextureMappings.forEach(({ name, textureUrl }) => {
        const mesh = editor.scene.getObjectByName(name);
        if (mesh) {            
            const texture = textureLoader.load(textureUrl);  
            texture.colorSpace = THREE.SRGBColorSpace;  
            texture.flipY = false;
            texture.channel = 1;
            applyTextureToMesh(mesh, texture);
        }
    });
}
applyAmbientOcclusionMaps();
```