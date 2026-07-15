// ========================================
// 记忆片段 · 3D 圆柱画廊（16:9 宽屏 · 自然亮度版 · 粒子增强版）
// ========================================

console.log('✅ gallery-3d.js 开始加载');

(function() {
    // 等待 DOM 加载
    let container = document.getElementById('gallery-3d-container');
    if (!container) {
        const checkExist = setInterval(() => {
            container = document.getElementById('gallery-3d-container');
            if (container) {
                clearInterval(checkExist);
                initGallery();
            }
        }, 100);
        return;
    }
    initGallery();

    function initGallery() {
        if (!container) return;

        console.log('✅ 容器已找到，开始初始化');

        container.style.width = '100%';
        container.style.height = '500px';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';

        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js 未加载');
            container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:60px 0;">Three.js 加载失败，请检查网络</p>';
            return;
        }
        console.log('✅ Three.js 已加载');

        const MEMORIES = [
            { id: 0, title: '出勤', desc: '前往匹诺康尼前，与刃在耶佩拉的车上互相谈论对于"死亡"的看法。表示自己想要以"流萤"的身份死去。' },
            { id: 1, title: '珍贵的合照', desc: '她与"你"在筑梦天台留下的合影，图中的少女略显腼腆。那是她最快乐的一段记忆之一……' },
            { id: 2, title: '初见', desc: '以"鸢尾花家族艺者"的身份，与"你"在匹诺康尼的"第一次相遇"' },
            { id: 3, title: '坦白', desc: '她在烈火中解开装甲的束缚，将自己最本真最完整的一面，展示在"你"的面前' },
            { id: 4, title: '互相的拯救', desc: '她将星核融入体内，燃烧所有能量将"你"从深层梦境中带出。同时"你"也将迎战神主日，将她从梦境中拯救出来' },
            { id: 5, title: '最后的温柔', desc: '一切尘埃落定，但是她身体已经到了极限，即将迎来"死亡"，与"你"坐在船头聊天，是命运给她在匹诺康尼最后的温柔。' },
            { id: 6, title: '不切实际的幻想', desc: '临近"死亡"时，她曾幻想，自己与"你"的第一次相遇，如果双方都是学生，那该会有怎样有趣的展开呢' },
            { id: 7, title: '补全缺失的心愿', desc: '"你"通过终末的力量，拨转命运的时针，补全了她最后想要看烟花的心愿' }
        ];

        const COLORS = [
            0x00d4aa, 0x66e8cc, 0x2ecc71, 0x1abc9c,
            0x48c9b0, 0x00b894, 0x00a381, 0x008f7a
        ];

        // 16:9 宽屏比例
        const RADIUS = 5.0;
        const CARD_WIDTH = 3.8;
        const CARD_HEIGHT = 2.1375;
        const COUNT = MEMORIES.length;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x080c14);

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0.5, 10.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        console.log('✅ 渲染器已添加，尺寸:', width, 'x', height);

        // ★★★ 环境光：自然亮度，不刺眼 ★★★
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(5, 8, 10);
        mainLight.castShadow = true;
        scene.add(mainLight);

        const rimLight = new THREE.DirectionalLight(0x00d4aa, 0.3);
        rimLight.position.set(-5, 2, -8);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0x66e8cc, 0.2);
        fillLight.position.set(0, -5, 5);
        scene.add(fillLight);

        const ringGeo = new THREE.RingGeometry(RADIUS - 0.3, RADIUS + 0.8, 80);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00d4aa,
            transparent: true,
            opacity: 0.06,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -2.0;
        scene.add(ring);

        const ring2Geo = new THREE.RingGeometry(RADIUS - 0.8, RADIUS - 0.3, 80);
        const ring2Mat = new THREE.MeshBasicMaterial({
            color: 0x66e8cc,
            transparent: true,
            opacity: 0.04,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.x = -Math.PI / 2;
        ring2.position.y = -1.8;
        scene.add(ring2);

        // ★★★ 粒子特效：数量增加到 500，更亮 ★★★
        const particleCount = 500;
        const particleGeo = new THREE.BufferGeometry();
        const pos = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = RADIUS + 1 + Math.random() * 3.5;
            pos[i*3] = Math.cos(theta) * r;
            pos[i*3+1] = (Math.random() - 0.5) * 5.5;
            pos[i*3+2] = Math.sin(theta) * r;
            sizes[i] = 0.03 + Math.random() * 0.06;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMat = new THREE.PointsMaterial({
            color: 0x00d4aa,
            size: 0.055,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        particles.position.y = 0.5;
        scene.add(particles);

        // 加载真实图片
        const textureLoader = new THREE.TextureLoader();

        function createCardTexture(index) {
            const imagePath = `assets/images/memory-${index + 1}.png`;
            return textureLoader.load(imagePath);
        }

        const cardMeshes = [];
        MEMORIES.forEach((mem, i) => {
            const angle = (i / COUNT) * Math.PI * 2;
            const texture = createCardTexture(i);
            const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
            
            // ★★★ 材质：干净明亮，无自发光 ★★★
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                roughness: 0.25,
                metalness: 0.05
            });

            const mesh = new THREE.Mesh(geometry, material);
            const x = Math.sin(angle) * RADIUS;
            const z = Math.cos(angle) * RADIUS;
            mesh.position.set(x, 0, z);
            mesh.lookAt(x * 2, 0, z * 2);

            mesh.userData = {
                index: i,
                angle: angle,
                title: mem.title,
                desc: mem.desc,
                color: COLORS[i % COLORS.length]
            };

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            cardMeshes.push(mesh);
        });
        console.log('✅ 已创建 ' + cardMeshes.length + ' 张卡片（16:9 自然亮度版）');

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let isDragging = false;
        let isClick = false;
        let prevMouse = { x: 0, y: 0 };
        let autoRotate = true;
        let targetRotation = 0;
        let currentRotation = 0;
        let dragStartX = 0;

        // ============================================================
        // 点击弹窗：16:9 大图 + 黑色遮罩 + 文字
        // ============================================================
        function showMemoryDetail(index) {
            const mem = MEMORIES[index];
            const color = '#' + COLORS[index % COLORS.length].toString(16).padStart(6, '0');

            const oldOverlay = document.getElementById('memory-overlay');
            if (oldOverlay) oldOverlay.remove();

            const overlay = document.createElement('div');
            overlay.id = 'memory-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(8, 12, 20, 0.88);
                backdrop-filter: blur(12px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
                padding: 30px;
                cursor: pointer;
            `;

            const card = document.createElement('div');
            card.style.cssText = `
                position: relative;
                max-width: 860px;
                width: 100%;
                aspect-ratio: 16 / 9;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 0 80px ${color}44, 0 0 160px ${color}22;
                animation: scaleIn 0.35s ease;
                background: #0a0e18;
                cursor: default;
            `;

            const img = document.createElement('img');
            img.src = `assets/images/memory-${index + 1}.png`;
            img.alt = mem.title;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            `;
            card.appendChild(img);

            // 黑色遮罩层（底部渐变）
            const mask = document.createElement('div');
            mask.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 55%;
                background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
                pointer-events: none;
            `;
            card.appendChild(mask);

            // 文字容器
            const textContainer = document.createElement('div');
            textContainer.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 40px 48px 36px;
                pointer-events: none;
            `;

            const title = document.createElement('h2');
            title.style.cssText = `
                font-size: 2.4rem;
                font-weight: 700;
                color: #ffffff;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 20px rgba(0,0,0,0.5);
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                letter-spacing: 2px;
            `;
            title.textContent = mem.title;
            textContainer.appendChild(title);

            const line = document.createElement('div');
            line.style.cssText = `
                width: 56px;
                height: 2px;
                background: linear-gradient(90deg, ${color}, transparent);
                margin-bottom: 10px;
            `;
            textContainer.appendChild(line);

            const desc = document.createElement('p');
            desc.style.cssText = `
                font-size: 1.05rem;
                line-height: 1.8;
                color: rgba(255,255,255,0.75);
                margin: 0;
                text-shadow: 0 1px 12px rgba(0,0,0,0.4);
                font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
                max-width: 80%;
            `;
            desc.textContent = mem.desc;
            textContainer.appendChild(desc);

            card.appendChild(textContainer);

            // 关闭按钮
            const closeBtn = document.createElement('button');
            closeBtn.style.cssText = `
                position: absolute;
                top: 16px;
                right: 20px;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,0.15);
                color: #fff;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                font-size: 1.2rem;
                cursor: pointer;
                transition: 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                font-family: 'Segoe UI', sans-serif;
            `;
            closeBtn.textContent = '✕';
            closeBtn.onmouseover = () => {
                closeBtn.style.background = color + '66';
                closeBtn.style.borderColor = color;
            };
            closeBtn.onmouseout = () => {
                closeBtn.style.background = 'rgba(0,0,0,0.5)';
                closeBtn.style.borderColor = 'rgba(255,255,255,0.15)';
            };
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                overlay.remove();
            };
            card.appendChild(closeBtn);

            overlay.appendChild(card);
            document.body.appendChild(overlay);

            overlay.onclick = (e) => {
                if (e.target === overlay) overlay.remove();
            };

            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }

        const canvas = renderer.domElement;

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (isDragging) {
                const deltaX = e.clientX - prevMouse.x;
                targetRotation += deltaX * 0.005;
                prevMouse = { x: e.clientX, y: e.clientY };
            }
        });

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            isClick = true;
            autoRotate = false;
            prevMouse = { x: e.clientX, y: e.clientY };
            dragStartX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            if (Math.abs(e.clientX - dragStartX) > 5) isClick = false;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging && isClick) {
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(cardMeshes);
                if (intersects.length > 0) {
                    const idx = intersects[0].object.userData.index;
                    if (idx !== undefined) showMemoryDetail(idx);
                }
            }
            isDragging = false;
            setTimeout(() => { autoRotate = true; }, 3000);
        });

        let touchStartX = 0;
        let isTouching = false;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouching = true;
            isClick = true;
            autoRotate = false;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            prevMouse = { x: touch.clientX, y: touch.clientY };

            const rect = canvas.getBoundingClientRect();
            mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isTouching) return;
            const touch = e.touches[0];
            if (Math.abs(touch.clientX - touchStartX) > 10) isClick = false;
            const deltaX = touch.clientX - prevMouse.x;
            targetRotation += deltaX * 0.005;
            prevMouse = { x: touch.clientX, y: touch.clientY };

            const rect = canvas.getBoundingClientRect();
            mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            if (isTouching && isClick) {
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(cardMeshes);
                if (intersects.length > 0) {
                    const idx = intersects[0].object.userData.index;
                    if (idx !== undefined) showMemoryDetail(idx);
                }
            }
            isTouching = false;
            setTimeout(() => { autoRotate = true; }, 3000);
        });

        function resize() {
            const w = container.clientWidth || 800;
            const h = container.clientHeight || 500;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener('resize', resize);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => resize());
            ro.observe(container);
        }

        let time = 0;

        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;

            if (autoRotate) targetRotation += 0.004;
            currentRotation += (targetRotation - currentRotation) * 0.06;

            cardMeshes.forEach((mesh, i) => {
                const baseAngle = (i / COUNT) * Math.PI * 2;
                const angle = baseAngle + currentRotation;

                const x = Math.sin(angle) * RADIUS;
                const z = Math.cos(angle) * RADIUS;
                mesh.position.set(x, 0, z);
                mesh.lookAt(x * 2, 0, z * 2);

                raycaster.setFromCamera(mouse, camera);
                const hits = raycaster.intersectObjects([mesh]);
                const isHovered = hits.length > 0 && hits[0].object === mesh && !isDragging;

                if (isHovered) {
                    const s = 1.10;
                    mesh.scale.x += (s - mesh.scale.x) * 0.08;
                    mesh.scale.y += (s - mesh.scale.y) * 0.08;
                } else {
                    mesh.scale.x += (1 - mesh.scale.x) * 0.08;
                    mesh.scale.y += (1 - mesh.scale.y) * 0.08;
                }
            });

            // ★★★ 粒子旋转速度略微提升 ★★★
            particles.rotation.y += 0.002;
            ring.rotation.z += 0.002;
            ring2.rotation.z -= 0.003;

            renderer.render(scene, camera);
        }

        animate();

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.92); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        console.log('✅ 3D 画廊启动完成（16:9 自然亮度版 · 粒子增强版）');
    }
})();