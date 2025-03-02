// 不再导入Three.js，因为我们已经在HTML中通过CDN加载了
// import * as THREE from 'three';
// 注意：AR.js和Three.js都在浏览器中通过脚本标签加载
// 确保在HTML中按正确顺序添加相关脚本

let camera, scene, renderer;
let arToolkitSource, arToolkitContext;
let markerRoot;
let score = 0;
let targets = [];
let isGameStarted = false;

// 初始化场景
function init() {
    scene = new THREE.Scene();

    // 设置相机
    camera = new THREE.Camera();
    scene.add(camera);

    // 设置渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true  // 透明背景，用于AR
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);
    
    // 初始化AR.js
    initAR();

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // 创建目标
    createTarget();

    // 添加点击事件监听器
    window.addEventListener('click', onDocumentClick);
    window.addEventListener('touchstart', onDocumentClick);

    // 添加窗口大小改变事件监听器
    window.addEventListener('resize', onWindowResize);
}

// AR.js初始化函数
function initAR() {
    // 创建AR源
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    // 处理AR源就绪事件
    arToolkitSource.init(function onReady() {
        onResize();
    });

    // 处理窗口大小变化
    window.addEventListener('resize', function() {
        onResize();
    });

    // 创建AR上下文
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
        detectionMode: 'mono',
    });

    // 初始化AR上下文
    arToolkitContext.init(function onCompleted() {
        // 复制投影矩阵到相机
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // 创建AR标记
    markerRoot = new THREE.Group();
    scene.add(markerRoot);

    // 创建AR标记控制器
    new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/patt.hiro',
    });
}

// 处理AR源大小变化
function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
}

// 创建目标
function createTarget() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const target = new THREE.Mesh(geometry, material);

    // 随机位置
    target.position.x = Math.random() * 8 - 4;
    target.position.y = Math.random() * 8 - 4;
    target.position.z = -Math.random() * 5 - 2;

    scene.add(target);
    targets.push(target);
}

// 点击事件处理
function onDocumentClick(event) {
    if (!isGameStarted) return;

    event.preventDefault();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 计算鼠标位置
    if (event.type === 'click') {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    } else if (event.type === 'touchstart') {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);

    // 检测点击是否击中目标
    const intersects = raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
        const target = intersects[0].object;
        scene.remove(target);
        targets = targets.filter(t => t !== target);
        score += 10;
        document.getElementById('score').textContent = `分数: ${score}`;
        createTarget();
    }
}

// 窗口大小改变事件处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
    }

    if (isGameStarted) {
        // 旋转所有目标
        targets.forEach(target => {
            target.rotation.x += 0.01;
            target.rotation.y += 0.01;
        });
    }

    renderer.render(scene, camera);
}

// 开始游戏按钮点击事件
document.getElementById('startButton').addEventListener('click', () => {
    isGameStarted = true;
    document.getElementById('startButton').style.display = 'none';
    score = 0;
    document.getElementById('score').textContent = `分数: ${score}`;
});

// 初始化并开始动画循环
init();
animate();