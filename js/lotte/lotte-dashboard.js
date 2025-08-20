/**
 * ロッテダッシュボード メインアプリケーション
 * 3D買い物行動予測ダッシュボードの統合制御
 */

class LotteDashboardApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // コアシステム
        this.cognitiveModels = new CognitiveModels();
        this.customerSegments = new CustomerSegments();
        this.popEffectsSystem = new POPEffectsSystem();
        this.environmentalFactors = new EnvironmentalFactorsSystem();
        this.analyticsEngine = new AnalyticsEngine();
        
        // 3Dシーン管理
        this.storeLayout = null;
        this.customerAgents = [];
        this.popDisplays = [];
        
        // シミュレーション状態
        this.isRunning = false;
        this.isPaused = false;
        this.simulationSpeed = 1.0;
        this.lastUpdateTime = 0;
        
        // 統計データ
        this.sessionStats = {
            totalCustomers: 0,
            snackBuyers: 0,
            popAttentionRate: 0,
            totalRevenue: 0,
            segmentBreakdown: { senior: 0, family: 0, single: 0, youth: 0 }
        };
        
        this.init();
    }

    /**
     * アプリケーション初期化
     */
    async init() {
        this.showLoading(true);
        
        try {
            await this.initializeComponents();
            this.setup3DScene();
            this.setupEventListeners();
            this.initializeUI();
            this.startSimulation();
            
            setTimeout(() => {
                this.showLoading(false);
                this.showWelcomeMessage();
            }, 3000);
            
        } catch (error) {
            console.error('初期化エラー:', error);
            this.showError('アプリケーションの初期化に失敗しました。');
        }
    }

    /**
     * コンポーネント初期化
     */
    async initializeComponents() {
        // 現在時刻を表示
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // 分析エンジン開始
        this.analyticsEngine.startRealTimeAnalysis();
        
        // デフォルト環境設定
        this.environmentalFactors.updateEnvironment({
            weather: 'sunny',
            temperature: 22,
            timeOfDay: 'afternoon',
            season: 'spring'
        });
    }

    /**
     * 3Dシーンセットアップ
     */
    setup3DScene() {
        const container = document.getElementById('scene-container');
        
        // シーン作成
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 1, 100);
        
        // カメラ設定
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(20, 15, 20);
        
        // レンダラー設定
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(this.renderer.domElement);
        
        // カメラコントロール
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.target.set(0, 0, 0);
        
        // 店舗レイアウト作成
        this.createStoreLayout();
        
        // 照明設定
        this.setupLighting();
        
        // POPディスプレイ作成
        this.createPOPDisplays();
    }

    /**
     * 店舗レイアウト作成
     */
    createStoreLayout() {
        // 床
        const floorGeometry = new THREE.PlaneGeometry(30, 25);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf5f5f5,
            transparent: true,
            opacity: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // ロッテお菓子専用コーナー
        this.createLotteCorner();
        
        // 他の商品棚
        this.createGeneralShelves();
        
        // レジエリア
        this.createCheckoutArea();
        
        // 壁と入口
        this.createWallsAndEntrance();
    }

    /**
     * ロッテコーナー作成
     */
    createLotteCorner() {
        const cornerPosition = { x: -8, z: 8 };
        
        // メインディスプレイ棚
        const shelfGeometry = new THREE.BoxGeometry(4, 2, 0.8);
        const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0xE50012 }); // ロッテレッド
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(cornerPosition.x, 1, cornerPosition.z);
        shelf.castShadow = true;
        this.scene.add(shelf);

        // ロッテ商品配置
        this.placeLotteProducts(cornerPosition);
        
        // ロッテブランドサイン
        this.createLotteBrandSign(cornerPosition);
    }

    /**
     * ロッテ商品配置
     */
    placeLotteProducts(basePosition) {
        const products = [
            { name: 'ガーナチョコレート', color: 0x8B4513, position: { x: -1.5, y: 0.3, z: 0 } },
            { name: 'トッポ', color: 0xFF6347, position: { x: -0.5, y: 0.3, z: 0 } },
            { name: 'コアラのマーチ', color: 0xFFE4B5, position: { x: 0.5, y: 0.3, z: 0 } },
            { name: 'パイの実', color: 0xDEB887, position: { x: 1.5, y: 0.3, z: 0 } }
        ];

        products.forEach(product => {
            const productGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.2);
            const productMaterial = new THREE.MeshLambertMaterial({ color: product.color });
            const productMesh = new THREE.Mesh(productGeometry, productMaterial);
            
            productMesh.position.set(
                basePosition.x + product.position.x,
                basePosition.y + product.position.y + 2,
                basePosition.z + product.position.z
            );
            productMesh.castShadow = true;
            productMesh.userData = { productName: product.name, isLotteProduct: true };
            
            this.scene.add(productMesh);
        });
    }

    /**
     * ロッテブランドサイン
     */
    createLotteBrandSign(position) {
        const signGeometry = new THREE.PlaneGeometry(3, 1);
        const signMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE50012,
            transparent: true,
            opacity: 0.9
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(position.x, 3.5, position.z - 0.5);
        this.scene.add(sign);

        // LOTTEロゴ（簡易版）
        const logoGeometry = new THREE.PlaneGeometry(2, 0.5);
        const logoMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const logo = new THREE.Mesh(logoGeometry, logoMaterial);
        logo.position.set(position.x, 3.5, position.z - 0.4);
        this.scene.add(logo);
    }

    /**
     * 一般商品棚作成
     */
    createGeneralShelves() {
        const shelfPositions = [
            { x: 0, z: 6, label: 'スナック' },
            { x: 8, z: 6, label: '飲料' },
            { x: -8, z: 0, label: '冷凍食品' },
            { x: 0, z: 0, label: '日用品' },
            { x: 8, z: 0, label: 'パン' }
        ];

        shelfPositions.forEach(pos => {
            const shelfGeometry = new THREE.BoxGeometry(3, 1.8, 0.6);
            const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(pos.x, 0.9, pos.z);
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            this.scene.add(shelf);
        });
    }

    /**
     * レジエリア作成
     */
    createCheckoutArea() {
        const checkoutPositions = [
            { x: -4, z: -10 },
            { x: 0, z: -10 },
            { x: 4, z: -10 }
        ];

        checkoutPositions.forEach(pos => {
            // レジカウンター
            const counterGeometry = new THREE.BoxGeometry(1.5, 1, 0.6);
            const counterMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const counter = new THREE.Mesh(counterGeometry, counterMaterial);
            counter.position.set(pos.x, 0.5, pos.z);
            counter.castShadow = true;
            this.scene.add(counter);
        });
    }

    /**
     * 壁と入口作成
     */
    createWallsAndEntrance() {
        const wallHeight = 4;
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xE8E8E8 });

        // 後ろの壁
        const backWallGeometry = new THREE.BoxGeometry(30, wallHeight, 0.2);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, wallHeight/2, 12.5);
        this.scene.add(backWall);

        // 左右の壁
        const sideWallGeometry = new THREE.BoxGeometry(0.2, wallHeight, 25);
        
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.position.set(-15, wallHeight/2, 0);
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        rightWall.position.set(15, wallHeight/2, 0);
        this.scene.add(rightWall);
    }

    /**
     * POPディスプレイ作成
     */
    createPOPDisplays() {
        const popConfigs = [
            {
                type: 'discount',
                position: { x: -8, y: 2.5, z: 7 },
                size: { width: 1, height: 0.8 },
                product: 'ghana_chocolate'
            },
            {
                type: 'limited',
                position: { x: -6, y: 2.5, z: 7 },
                size: { width: 0.8, height: 0.6 },
                product: 'seasonal_chocolate'
            },
            {
                type: 'character',
                position: { x: -10, y: 1.5, z: 7 },
                size: { width: 1.2, height: 1 },
                product: 'koala_march'
            }
        ];

        popConfigs.forEach(config => {
            this.createPOPDisplay(config);
        });
    }

    /**
     * 個別POPディスプレイ作成
     */
    createPOPDisplay(config) {
        const popGroup = new THREE.Group();
        
        // POP背景
        const bgGeometry = new THREE.PlaneGeometry(config.size.width, config.size.height);
        const bgColors = {
            discount: 0xFF4444,
            limited: 0xFF8800,
            character: 0x44FF44,
            celebrity: 0x8844FF,
            health: 0x44FFFF,
            premium: 0xFFD700
        };
        
        const bgMaterial = new THREE.MeshLambertMaterial({ 
            color: bgColors[config.type] || 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        popGroup.add(background);
        
        // POPフレーム
        const frameGeometry = new THREE.RingGeometry(
            Math.min(config.size.width, config.size.height) * 0.4,
            Math.min(config.size.width, config.size.height) * 0.45,
            16
        );
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = 0.01;
        popGroup.add(frame);
        
        popGroup.position.set(config.position.x, config.position.y, config.position.z);
        popGroup.userData = { popType: config.type, product: config.product };
        
        this.scene.add(popGroup);
        this.popDisplays.push(popGroup);
    }

    /**
     * 照明設定
     */
    setupLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // メイン照明
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // ロッテコーナー専用スポットライト
        const lotteSpotlight = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6);
        lotteSpotlight.position.set(-8, 8, 8);
        lotteSpotlight.target.position.set(-8, 0, 8);
        lotteSpotlight.castShadow = true;
        this.scene.add(lotteSpotlight);
        this.scene.add(lotteSpotlight.target);
    }

    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // シミュレーション制御
        document.getElementById('play-pause-btn')?.addEventListener('click', () => this.toggleSimulation());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.resetSimulation());

        // 環境設定
        document.getElementById('weather-select')?.addEventListener('change', (e) => this.updateWeather(e.target.value));
        document.getElementById('temperature')?.addEventListener('input', (e) => this.updateTemperature(e.target.value));
        document.getElementById('time-period')?.addEventListener('change', (e) => this.updateTimePeriod(e.target.value));

        // 客層設定
        this.setupSegmentControls();

        // POP設定
        this.setupPOPControls();

        // シミュレーション設定
        document.getElementById('sim-speed')?.addEventListener('input', (e) => this.updateSimulationSpeed(e.target.value));
        document.getElementById('visitor-rate')?.addEventListener('input', (e) => this.updateVisitorRate(e.target.value));

        // AI推奨システム
        document.getElementById('generate-recommendations')?.addEventListener('click', () => this.generateAIRecommendations());

        // リサイズ対応
        window.addEventListener('resize', () => this.onWindowResize());
        
        // インフォパネル制御
        document.getElementById('close-info')?.addEventListener('click', () => this.closeInfoPanel());
    }

    /**
     * セグメント制御設定
     */
    setupSegmentControls() {
        const segments = ['senior', 'family', 'single', 'youth'];
        
        segments.forEach(segment => {
            const slider = document.getElementById(`${segment}-ratio`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    e.target.nextElementSibling.textContent = `${value}%`;
                    this.updateSegmentRatio(segment, value / 100);
                });
            }
        });
    }

    /**
     * POP制御設定
     */
    setupPOPControls() {
        const popCheckboxes = ['discount-pop', 'limited-pop', 'seasonal-pop'];
        
        popCheckboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updatePOPVisibility(checkboxId.replace('-pop', ''), e.target.checked);
                });
            }
        });

        const intensitySlider = document.getElementById('pop-intensity');
        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('intensity-value').textContent = `${value.toFixed(1)}x`;
                this.updatePOPIntensity(value);
            });
        }
    }

    /**
     * UI初期化
     */
    initializeUI() {
        // チャート初期化
        this.initializeCharts();
        
        // 初期値設定
        document.getElementById('temp-value').textContent = '20°C';
        document.getElementById('speed-value').textContent = '1.0x';
        document.getElementById('visitor-value').textContent = '5人';
        document.getElementById('intensity-value').textContent = '1.0x';
    }

    /**
     * チャート初期化
     */
    initializeCharts() {
        // 時間帯別チャート
        const hourlyCtx = document.getElementById('hourly-chart');
        if (hourlyCtx) {
            window.hourlyChart = new Chart(hourlyCtx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 12}, (_, i) => `${i + 8}:00`),
                    datasets: [{
                        label: 'POP注目率',
                        data: Array(12).fill(0).map(() => Math.random() * 80 + 20),
                        borderColor: '#00D4FF',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        tension: 0.4
                    }, {
                        label: '購入率',
                        data: Array(12).fill(0).map(() => Math.random() * 40 + 10),
                        borderColor: '#FF69B4',
                        backgroundColor: 'rgba(255, 105, 180, 0.1)',
                        tension: 0.4
                    }]
                },
                options: this.getChartOptions('時間帯別POP効果')
            });
        }

        // セグメント別チャート
        const segmentCtx = document.getElementById('segment-chart');
        if (segmentCtx) {
            window.segmentChart = new Chart(segmentCtx, {
                type: 'doughnut',
                data: {
                    labels: ['シニア', '子あり世代', 'シングル', '若者'],
                    datasets: [{
                        data: [78, 45, 65, 82],
                        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
                    }]
                },
                options: this.getChartOptions('客層別反応率', 'doughnut')
            });
        }

        // カテゴリパフォーマンスチャート
        const categoryCtx = document.getElementById('category-chart');
        if (categoryCtx) {
            window.categoryChart = new Chart(categoryCtx, {
                type: 'bar',
                data: {
                    labels: ['チョコレート', 'クッキー', 'キャンディ', 'ガム'],
                    datasets: [{
                        label: '売上（千円）',
                        data: [150, 95, 78, 45],
                        backgroundColor: '#8B5CF6'
                    }]
                },
                options: this.getChartOptions('商品カテゴリ別売上')
            });
        }

        // POP比較チャート
        const popCtx = document.getElementById('pop-comparison-chart');
        if (popCtx) {
            window.popComparisonChart = new Chart(popCtx, {
                type: 'radar',
                data: {
                    labels: ['割引', '限定', 'キャラクター', '健康', 'プレミアム'],
                    datasets: [{
                        label: '効果スコア',
                        data: [85, 72, 68, 45, 58],
                        borderColor: '#00FF88',
                        backgroundColor: 'rgba(0, 255, 136, 0.2)'
                    }]
                },
                options: this.getChartOptions('POP種別効果比較', 'radar')
            });
        }
    }

    /**
     * チャート共通オプション
     */
    getChartOptions(title, type = 'default') {
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            },
            scales: type !== 'doughnut' && type !== 'radar' ? {
                x: {
                    ticks: { color: '#FFFFFF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#FFFFFF' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            } : undefined
        };

        if (type === 'radar') {
            baseOptions.scales = {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#FFFFFF' },
                    ticks: { color: '#FFFFFF' }
                }
            };
        }

        return baseOptions;
    }

    /**
     * シミュレーション開始
     */
    startSimulation() {
        this.isRunning = true;
        this.lastUpdateTime = performance.now();
        this.animate();
        
        // 定期的に顧客を生成
        this.customerSpawnInterval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                this.spawnCustomer();
            }
        }, 3000);
    }

    /**
     * 顧客生成
     */
    spawnCustomer() {
        const segmentType = this.customerSegments.selectRandomSegment();
        const customer = this.customerSegments.generateCustomer(segmentType);
        
        // 3D顧客モデル作成
        const customerMesh = this.createCustomer3D(customer);
        this.scene.add(customerMesh);
        this.customerAgents.push({
            mesh: customerMesh,
            data: customer,
            path: this.generateShoppingPath(customer),
            currentStep: 0,
            dwellTime: 0
        });
        
        // 統計更新
        this.sessionStats.totalCustomers++;
        this.sessionStats.segmentBreakdown[segmentType]++;
    }

    /**
     * 3D顧客モデル作成
     */
    createCustomer3D(customerData) {
        const group = new THREE.Group();
        
        // 体
        const bodyGeometry = new THREE.CapsuleGeometry(0.2, 1.4, 4, 8);
        const segmentColors = {
            senior: 0x8B7355,
            family: 0x4169E1,
            single: 0xFF1493,
            youth: 0x00FF00
        };
        
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: segmentColors[customerData.segment] || 0x888888
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        body.castShadow = true;
        group.add(body);
        
        // ショッピングバスケット
        const basketGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
        const basketMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basket.position.set(0.4, 0.5, 0);
        group.add(basket);
        
        // 初期位置（入口）
        group.position.set(0, 0, -12);
        group.userData = customerData;
        
        return group;
    }

    /**
     * 買い物パス生成
     */
    generateShoppingPath(customer) {
        const path = [
            { x: 0, z: -12, action: 'enter' },      // 入口
            { x: -8, z: 8, action: 'browse' },      // ロッテコーナー
            { x: 0, z: 6, action: 'browse' },       // スナックコーナー
            { x: 8, z: 0, action: 'browse' },       // その他
            { x: 0, z: -10, action: 'checkout' },   // レジ
            { x: 0, z: -12, action: 'exit' }        // 出口
        ];
        
        // 個人の嗜好に基づいてパスを調整
        if (customer.snackPreferences?.chocolate > 0.7) {
            path.splice(2, 0, { x: -6, z: 6, action: 'browse' }); // チョコレートエリア追加
        }
        
        return path;
    }

    /**
     * メインアニメーションループ
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        
        if (!this.isPaused) {
            this.updateCustomers(deltaTime);
            this.updatePOPEffects(deltaTime);
            this.updateAnalytics();
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 顧客更新
     */
    updateCustomers(deltaTime) {
        const scaledDelta = deltaTime * this.simulationSpeed;
        
        for (let i = this.customerAgents.length - 1; i >= 0; i--) {
            const agent = this.customerAgents[i];
            const success = this.updateCustomerAgent(agent, scaledDelta);
            
            if (!success) {
                // エージェント削除
                this.scene.remove(agent.mesh);
                this.customerAgents.splice(i, 1);
            }
        }
    }

    /**
     * 個別顧客更新
     */
    updateCustomerAgent(agent, deltaTime) {
        const { mesh, data, path, currentStep } = agent;
        
        if (currentStep >= path.length) {
            return false; // 完了
        }
        
        const target = path[currentStep];
        const position = mesh.position;
        
        // 移動
        const dx = target.x - position.x;
        const dz = target.z - position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 0.5) {
            // 目標到達
            agent.currentStep++;
            agent.dwellTime = 0;
            
            // アクション実行
            this.executeCustomerAction(agent, target.action);
        } else {
            // 移動継続
            const speed = 2.0 * deltaTime;
            const moveX = (dx / distance) * speed;
            const moveZ = (dz / distance) * speed;
            
            position.x += moveX;
            position.z += moveZ;
            
            // 向きを更新
            mesh.rotation.y = Math.atan2(moveX, moveZ);
        }
        
        return true;
    }

    /**
     * 顧客アクション実行
     */
    executeCustomerAction(agent, action) {
        const { data } = agent;
        
        switch (action) {
            case 'browse':
                // POP効果計算
                const nearbyPOPs = this.getNearbyPOPs(agent.mesh.position);
                nearbyPOPs.forEach(pop => {
                    this.calculatePOPInteraction(data, pop);
                });
                break;
                
            case 'checkout':
                // 購入処理
                this.processPurchase(agent);
                break;
        }
    }

    /**
     * 近くのPOPを取得
     */
    getNearbyPOPs(position) {
        return this.popDisplays.filter(pop => {
            const distance = position.distanceTo(pop.position);
            return distance < 3.0;
        });
    }

    /**
     * POP相互作用計算
     */
    calculatePOPInteraction(customer, popDisplay) {
        const popConfig = {
            type: popDisplay.userData.popType,
            product: popDisplay.userData.product
        };
        
        const product = this.popEffectsSystem.lotteProducts.getProduct(popConfig.product);
        if (!product) return;
        
        // 環境要因を取得
        const environment = this.environmentalFactors.currentEnvironment;
        
        // POP効果計算
        const effect = this.popEffectsSystem.calculatePOPEffect(
            product, popConfig, customer, environment
        );
        
        // 分析エンジンに記録
        this.analyticsEngine.recordCustomerInteraction(
            customer.id || 'customer_' + Date.now(),
            'view',
            product,
            popConfig,
            effect
        );
        
        // 視覚効果
        this.showPOPInteraction(popDisplay, effect.totalEffect);
        
        // 統計更新
        this.sessionStats.popAttentionRate = 
            (this.sessionStats.popAttentionRate + effect.totalEffect) / 2;
    }

    /**
     * POP相互作用の視覚効果
     */
    showPOPInteraction(popDisplay, effectLevel) {
        // 光る効果
        const originalMaterial = popDisplay.children[0].material;
        const glowMaterial = originalMaterial.clone();
        glowMaterial.emissive = new THREE.Color(0x444444);
        glowMaterial.emissiveIntensity = effectLevel;
        
        popDisplay.children[0].material = glowMaterial;
        
        setTimeout(() => {
            popDisplay.children[0].material = originalMaterial;
        }, 1000);
    }

    /**
     * 購入処理
     */
    processPurchase(agent) {
        const { data } = agent;
        const lotteProducts = ['ghana_chocolate', 'toppo', 'koala_march', 'pie_no_mi'];
        
        // ロッテ商品購入確率
        const lottePurchaseProb = this.calculateLottePurchaseProbability(data);
        
        if (Math.random() < lottePurchaseProb) {
            const product = lotteProducts[Math.floor(Math.random() * lotteProducts.length)];
            const price = 150 + Math.random() * 100;
            
            // 購入記録
            this.analyticsEngine.recordPurchase(
                data.id || 'customer_' + Date.now(),
                { id: product, name: product },
                price,
                { type: 'discount', effectiveness: lottePurchaseProb }
            );
            
            // 統計更新
            this.sessionStats.snackBuyers++;
            this.sessionStats.totalRevenue += price;
        }
    }

    /**
     * ロッテ商品購入確率計算
     */
    calculateLottePurchaseProbability(customerData) {
        let probability = 0.3; // ベース確率
        
        // セグメント別調整
        const segmentMultipliers = {
            senior: 0.8,
            family: 1.2,
            single: 1.0,
            youth: 1.1
        };
        
        probability *= segmentMultipliers[customerData.segment] || 1.0;
        
        // 嗜好性による調整
        if (customerData.snackPreferences?.chocolate > 0.7) {
            probability *= 1.3;
        }
        
        return Math.min(probability, 0.8);
    }

    /**
     * POP効果更新
     */
    updatePOPEffects(deltaTime) {
        // POPアニメーション更新
        this.popDisplays.forEach(pop => {
            const time = Date.now() * 0.001;
            pop.rotation.y = Math.sin(time * 0.5) * 0.1;
            pop.position.y += Math.sin(time * 2) * 0.02;
        });
    }

    /**
     * 分析データ更新
     */
    updateAnalytics() {
        // オーバーレイ情報更新
        const activeCustomers = this.customerAgents.length;
        const snackBuyers = this.sessionStats.snackBuyers;
        const attentionRate = (this.sessionStats.popAttentionRate * 100).toFixed(1);
        
        document.getElementById('active-customers').textContent = activeCustomers;
        document.getElementById('snack-buyers').textContent = snackBuyers;
        document.getElementById('pop-attention').textContent = attentionRate + '%';
    }

    // UI制御メソッド
    switchTab(tabName) {
        // 全タブを非表示
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 選択されたタブを表示
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    toggleSimulation() {
        if (this.isPaused) {
            this.isPaused = false;
            document.getElementById('play-pause-btn').innerHTML = '<i class="fas fa-pause"></i> 一時停止';
        } else {
            this.isPaused = true;
            document.getElementById('play-pause-btn').innerHTML = '<i class="fas fa-play"></i> 再開';
        }
    }

    resetSimulation() {
        // 全顧客削除
        this.customerAgents.forEach(agent => {
            this.scene.remove(agent.mesh);
        });
        this.customerAgents = [];
        
        // 統計リセット
        this.sessionStats = {
            totalCustomers: 0,
            snackBuyers: 0,
            popAttentionRate: 0,
            totalRevenue: 0,
            segmentBreakdown: { senior: 0, family: 0, single: 0, youth: 0 }
        };
        
        // 分析エンジンリセット
        this.analyticsEngine.realtimeData = {
            customers: [],
            interactions: [],
            purchases: [],
            popViews: [],
            sessionMetrics: {},
            hourlyStats: {}
        };
    }

    updateWeather(weather) {
        this.environmentalFactors.updateEnvironment({ weather });
        console.log('天気更新:', weather);
    }

    updateTemperature(temp) {
        document.getElementById('temp-value').textContent = `${temp}°C`;
        this.environmentalFactors.updateEnvironment({ temperature: parseInt(temp) });
    }

    updateTimePeriod(timePeriod) {
        this.environmentalFactors.updateEnvironment({ timeOfDay: timePeriod });
        console.log('時間帯更新:', timePeriod);
    }

    updateSegmentRatio(segment, ratio) {
        const weights = { ...this.customerSegments.segmentWeights };
        weights[segment] = ratio;
        this.customerSegments.updateSegmentWeights(weights);
    }

    updatePOPVisibility(popType, visible) {
        this.popDisplays.forEach(pop => {
            if (pop.userData.popType === popType) {
                pop.visible = visible;
            }
        });
    }

    updatePOPIntensity(intensity) {
        // POP効果の強度調整
        this.popDisplays.forEach(pop => {
            const originalScale = pop.userData.originalScale || pop.scale.clone();
            if (!pop.userData.originalScale) {
                pop.userData.originalScale = originalScale;
            }
            pop.scale.copy(originalScale).multiplyScalar(intensity);
        });
    }

    updateSimulationSpeed(speed) {
        this.simulationSpeed = parseFloat(speed);
        document.getElementById('speed-value').textContent = `${speed}x`;
    }

    updateVisitorRate(rate) {
        document.getElementById('visitor-value').textContent = `${rate}人`;
        
        // 顧客生成間隔を調整
        if (this.customerSpawnInterval) {
            clearInterval(this.customerSpawnInterval);
        }
        const interval = Math.max(1000, 6000 / parseInt(rate));
        this.customerSpawnInterval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                this.spawnCustomer();
            }
        }, interval);
    }

    generateAIRecommendations() {
        const insights = this.analyticsEngine.generateInsights();
        const recommendations = document.getElementById('recommendations-output');
        
        if (recommendations && insights.length > 0) {
            recommendations.innerHTML = insights.map(insight => `
                <div class="recommendation-item">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                    <ul>
                        ${insight.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                    <div class="impact">予想効果: ${insight.expectedImpact}</div>
                </div>
            `).join('');
        }
    }

    onWindowResize() {
        const container = document.getElementById('scene-container');
        const aspect = container.clientWidth / container.clientHeight;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    showLoading(show) {
        const loading = document.getElementById('loading-overlay');
        loading.style.display = show ? 'flex' : 'none';
        
        if (show) {
            this.updateLoadingProgress();
        }
    }

    updateLoadingProgress() {
        const progress = document.getElementById('progress-bar');
        let width = 0;
        
        const interval = setInterval(() => {
            width += Math.random() * 15 + 5;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
            }
            progress.style.width = width + '%';
        }, 200);
    }

    showWelcomeMessage() {
        // ウェルカムメッセージ表示
        console.log('🎉 ロッテ3D買い物行動予測ダッシュボードへようこそ！');
    }

    showError(message) {
        const loading = document.getElementById('loading-overlay');
        const content = loading.querySelector('.loading-content');
        content.innerHTML = `
            <h2 style="color: #ff6b6b;">エラーが発生しました</h2>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: #ff6b6b;
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 20px;
            ">リロード</button>
        `;
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    closeInfoPanel() {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
    }

    dispose() {
        this.isRunning = false;
        
        if (this.customerSpawnInterval) {
            clearInterval(this.customerSpawnInterval);
        }
        
        this.analyticsEngine.stopRealTimeAnalysis();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('ダッシュボード終了');
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ロッテ3D買い物行動予測ダッシュボード 開始');
    
    try {
        window.lotteDashboard = new LotteDashboardApp();
        
        // デバッグ用グローバル関数
        window.getLotteDebugInfo = () => ({
            customerCount: window.lotteDashboard.customerAgents.length,
            sessionStats: window.lotteDashboard.sessionStats,
            environment: window.lotteDashboard.environmentalFactors.currentEnvironment
        });
        
    } catch (error) {
        console.error('ダッシュボード初期化エラー:', error);
    }
});

// ページアンロード時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (window.lotteDashboard) {
        window.lotteDashboard.dispose();
    }
});