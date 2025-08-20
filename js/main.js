/**
 * メインアプリケーション
 * 3Dスーパーマーケットシミュレーション
 */

class SupermarketSimulation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.pathFinder = null;
        this.store = null;
        this.agentManager = null;
        
        this.isRunning = false;
        this.isPaused = false;
        this.simulationSpeed = 1.0;
        this.lastTime = 0;
        
        this.stats = {
            activeCustomers: 0,
            queueLength: 0,
            totalSales: 0,
            completedCustomers: 0
        };
        
        // グローバルアクセス用
        window.gameStats = this.stats;
        
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.showLoading(true);
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupPathFinding();
        this.setupStore();
        this.setupAgents();
        this.setupEventListeners();
        this.setupUI();
        
        // 初期化完了
        setTimeout(() => {
            this.showLoading(false);
            this.start();
        }, 2000);
    }

    /**
     * 3Dシーンの設定
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 1, 100);
    }

    /**
     * カメラの設定
     */
    setupCamera() {
        const container = document.getElementById('scene-container');
        const aspect = container.clientWidth / container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(15, 12, 15);
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * レンダラーの設定
     */
    setupRenderer() {
        const container = document.getElementById('scene-container');
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        container.appendChild(this.renderer.domElement);
    }

    /**
     * カメラコントロールの設定
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 0, 0);
    }

    /**
     * パスファインディングの設定
     */
    setupPathFinding() {
        this.pathFinder = new PathFinder(40, 40, 1);
    }

    /**
     * 店舗の設定
     */
    setupStore() {
        this.store = new SupermarketStore(this.scene, this.pathFinder);
    }

    /**
     * エージェントの設定
     */
    setupAgents() {
        this.agentManager = new AgentManager(this.scene, this.pathFinder);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウリサイズ
        window.addEventListener('resize', () => this.onWindowResize());
        
        // キーボードイベント
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // シミュレーション制御
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        pauseBtn?.addEventListener('click', () => this.togglePause());
        resetBtn?.addEventListener('click', () => this.reset());
        
        // スライダー制御
        const speedSlider = document.getElementById('simulation-speed');
        const agentCountSlider = document.getElementById('agent-count');
        
        speedSlider?.addEventListener('input', (e) => {
            this.simulationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = `${this.simulationSpeed.toFixed(1)}x`;
        });
        
        agentCountSlider?.addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            this.agentManager.setMaxAgents(count);
            document.getElementById('agent-count-value').textContent = count;
        });
    }

    /**
     * UIの初期設定
     */
    setupUI() {
        // 情報パネルの制御
        const closeInfoBtn = document.getElementById('close-info');
        const infoPanel = document.getElementById('info-panel');
        
        closeInfoBtn?.addEventListener('click', () => {
            infoPanel.style.display = 'none';
        });
        
        // 初期値設定
        document.getElementById('speed-value').textContent = `${this.simulationSpeed}x`;
        document.getElementById('agent-count-value').textContent = '10';
        
        // 3秒後に情報パネルを表示
        setTimeout(() => {
            infoPanel.style.display = 'block';
            setTimeout(() => infoPanel.style.display = 'none', 5000);
        }, 3000);
    }

    /**
     * シミュレーション開始
     */
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.animate();
        console.log('3D スーパーマーケットシミュレーション開始');
    }

    /**
     * 一時停止/再開
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = this.isPaused ? '再開' : '一時停止';
    }

    /**
     * リセット
     */
    reset() {
        this.agentManager.clearAllAgents();
        this.stats.activeCustomers = 0;
        this.stats.queueLength = 0;
        this.stats.totalSales = 0;
        this.stats.completedCustomers = 0;
        this.updateStatsDisplay();
        console.log('シミュレーションをリセット');
    }

    /**
     * メインループ
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
    }

    /**
     * 更新処理
     */
    update(deltaTime) {
        // エージェント更新
        this.agentManager.update(deltaTime, this.simulationSpeed);
        
        // コントロール更新
        this.controls.update();
        
        // 統計情報更新
        this.updateStatsDisplay();
    }

    /**
     * 統計情報表示を更新
     */
    updateStatsDisplay() {
        document.getElementById('active-customers').textContent = this.stats.activeCustomers;
        document.getElementById('queue-length').textContent = this.stats.queueLength;
        document.getElementById('total-sales').textContent = this.stats.totalSales.toLocaleString();
    }

    /**
     * レンダリング
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * ウィンドウリサイズ処理
     */
    onWindowResize() {
        const container = document.getElementById('scene-container');
        const aspect = container.clientWidth / container.clientHeight;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    /**
     * キーボード処理
     */
    onKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                event.preventDefault();
                this.reset();
                break;
            case 'Escape':
                document.getElementById('info-panel').style.display = 'none';
                break;
            case 'KeyI':
                const infoPanel = document.getElementById('info-panel');
                infoPanel.style.display = infoPanel.style.display === 'none' ? 'block' : 'none';
                break;
        }
    }

    /**
     * ローディング画面の制御
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.style.display = 'flex';
            this.updateLoadingProgress();
        } else {
            loading.style.display = 'none';
        }
    }

    /**
     * ローディングプログレスの更新
     */
    updateLoadingProgress() {
        const progress = document.querySelector('.loading-progress');
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

    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return {
            scene: {
                children: this.scene.children.length,
                triangles: this.renderer.info.render.triangles
            },
            agents: this.agentManager.getDebugInfo(),
            stats: this.stats,
            performance: {
                fps: Math.round(1000 / (performance.now() - this.lastTime)),
                memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
            }
        };
    }

    /**
     * アプリケーション終了
     */
    dispose() {
        this.isRunning = false;
        
        if (this.store) {
            this.store.dispose();
        }
        
        if (this.agentManager) {
            this.agentManager.clearAllAgents();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('シミュレーション終了');
    }
}

/**
 * アプリケーション起動処理
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('3D スーパーマーケットシミュレーション 読み込み開始');
    
    // Three.jsが読み込まれるまで待機
    if (typeof THREE === 'undefined') {
        console.error('Three.js が読み込まれていません');
        return;
    }
    
    // OrbitControlsが読み込まれるまで待機
    if (typeof THREE.OrbitControls === 'undefined') {
        console.error('OrbitControls が読み込まれていません');
        return;
    }
    
    try {
        // アプリケーション開始
        window.supermarketApp = new SupermarketSimulation();
        
        // デバッグ用グローバル関数
        window.getDebugInfo = () => window.supermarketApp.getDebugInfo();
        window.resetSimulation = () => window.supermarketApp.reset();
        window.togglePause = () => window.supermarketApp.togglePause();
        
    } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
        
        // エラー表示
        const loading = document.getElementById('loading');
        const loadingContent = loading.querySelector('.loading-content');
        loadingContent.innerHTML = `
            <h2 style="color: #ff6b6b;">エラーが発生しました</h2>
            <p>アプリケーションを初期化できませんでした。</p>
            <p>ブラウザをリロードして再試行してください。</p>
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
});

/**
 * ページアンロード時のクリーンアップ
 */
window.addEventListener('beforeunload', () => {
    if (window.supermarketApp) {
        window.supermarketApp.dispose();
    }
});