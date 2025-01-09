# 施耐德数据中心DEMO 逆向

## 成果
1. AirflowMaterial 用柏林噪声纹理+时间动画 巧妙实现气流效果



## 难题

- <https://threejs.org/editor/预览时气流为什么没动起来>?
  - 在<https://threejs.org/editor/编辑时用setInterval(()=>{animations.update(0.01);}>, 16)可以动起来
  - 但是在<https://threejs.org/editor/预览时气流没动起来>, 原因是: 预览时是克隆了一个scene, 但是animations作用在原scene上, 所以预览时气流没动起来
