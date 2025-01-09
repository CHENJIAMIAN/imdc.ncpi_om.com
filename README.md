# 施耐德数据中心DEMO 逆向

## 成果

1. 首页
2. 液冷管路
    <!-- - 管的流动效果 -->
    <!-- 点`管路巡检`的流动效果 -->
3. 温度云图
    - `云图.js` 不用`heatmap.js`,实现简单的平面云图效果
4. 母线温度
    <!-- - 母线上的温度效果 -->
5. 气流模拟
    - `AirflowMaterial.js` 用柏林噪声纹理+时间动画 巧妙实现气流效果
    <!-- - `微压差：5 Pa`是怎么显示出来的? -->
6. 电力潮流模拟
    <!-- - 电流是怎么显示出来的? -->

## 难题

- <https://threejs.org/editor/预览时气流为什么没动起来>?
  - 在<https://threejs.org/editor/编辑时用setInterval(()=>{animations.update(0.01);}>, 16)可以动起来
  - 但是在<https://threejs.org/editor/预览时气流没动起来>, 原因是: 预览时是克隆了一个scene, 但是animations作用在原scene上, 所以预览时气流没动起来
