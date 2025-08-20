/**
 * スーパーマーケット店舗クラス
 * 3D店舗環境とレイアウトを管理
 */

class SupermarketStore {
    constructor(scene, pathFinder) {
        this.scene = scene;
        this.pathFinder = pathFinder;
        this.storeObjects = [];
        this.shelves = [];
        this.checkouts = [];
        
        this.storeWidth = 20;
        this.storeDepth = 20;
        
        this.createStore();
        this.setupPathfinding();
    }

    /**
     * 店舗全体を作成
     */
    createStore() {
        this.createFloor();
        this.createWalls();
        this.createShelves();
        this.createCheckouts();
        this.createEntrance();
        this.createLighting();
        this.createDecorations();
    }

    /**
     * 床を作成
     */
    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(this.storeWidth, this.storeDepth);
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0xf0f0f0,
            transparent: true,
            opacity: 0.8
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        
        this.scene.add(floor);
        this.storeObjects.push(floor);

        // 床のテクスチャパターンを追加
        this.createFloorPattern();
    }

    /**
     * 床のパターンを作成
     */
    createFloorPattern() {
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xdddddd,
            transparent: true,
            opacity: 0.3
        });

        // 通路のライン
        const aisleLines = [];
        
        // 縦のライン
        for (let x = -8; x <= 8; x += 4) {
            aisleLines.push(
                new THREE.Vector3(x, 0.01, -this.storeDepth/2),
                new THREE.Vector3(x, 0.01, this.storeDepth/2)
            );
        }
        
        // 横のライン  
        for (let z = -8; z <= 8; z += 4) {
            aisleLines.push(
                new THREE.Vector3(-this.storeWidth/2, 0.01, z),
                new THREE.Vector3(this.storeWidth/2, 0.01, z)
            );
        }

        lineGeometry.setFromPoints(aisleLines);
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(lines);
        this.storeObjects.push(lines);
    }

    /**
     * 壁を作成
     */
    createWalls() {
        const wallHeight = 4;
        const wallThickness = 0.2;
        
        const wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, this.storeDepth);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 });

        // 左右の壁
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-this.storeWidth/2, wallHeight/2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        this.storeObjects.push(leftWall);

        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(this.storeWidth/2, wallHeight/2, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
        this.storeObjects.push(rightWall);

        // 前後の壁（出入り口あり）
        const frontBackWallGeometry = new THREE.BoxGeometry(this.storeWidth, wallHeight, wallThickness);
        
        const backWall = new THREE.Mesh(frontBackWallGeometry, wallMaterial);
        backWall.position.set(0, wallHeight/2, this.storeDepth/2);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        this.storeObjects.push(backWall);

        // 前の壁は出入り口があるので分割
        this.createFrontWalls(wallHeight, wallThickness, wallMaterial);
    }

    /**
     * 出入り口付きの前面壁を作成
     */
    createFrontWalls(wallHeight, wallThickness, wallMaterial) {
        const entranceWidth = 4;
        const wallSegmentWidth = (this.storeWidth - entranceWidth) / 2;
        
        const wallSegmentGeometry = new THREE.BoxGeometry(wallSegmentWidth, wallHeight, wallThickness);
        
        const leftFrontWall = new THREE.Mesh(wallSegmentGeometry, wallMaterial);
        leftFrontWall.position.set(-this.storeWidth/2 + wallSegmentWidth/2, wallHeight/2, -this.storeDepth/2);
        leftFrontWall.castShadow = true;
        leftFrontWall.receiveShadow = true;
        this.scene.add(leftFrontWall);
        this.storeObjects.push(leftFrontWall);

        const rightFrontWall = new THREE.Mesh(wallSegmentGeometry, wallMaterial);
        rightFrontWall.position.set(this.storeWidth/2 - wallSegmentWidth/2, wallHeight/2, -this.storeDepth/2);
        rightFrontWall.castShadow = true;
        rightFrontWall.receiveShadow = true;
        this.scene.add(rightFrontWall);
        this.storeObjects.push(rightFrontWall);
    }

    /**
     * 商品棚を作成
     */
    createShelves() {
        const shelfPositions = [
            // 野菜コーナー
            { x: -8, z: 8, width: 3, depth: 1, label: '野菜', color: 0x4CAF50 },
            { x: -8, z: 6, width: 3, depth: 1, label: '果物', color: 0xFF9800 },
            
            // 肉コーナー
            { x: 8, z: 8, width: 3, depth: 1, label: '肉類', color: 0xF44336 },
            { x: 8, z: 6, width: 3, depth: 1, label: '魚類', color: 0x2196F3 },
            
            // パン・乳製品コーナー
            { x: -8, z: -8, width: 3, depth: 1, label: 'パン', color: 0x8D6E63 },
            { x: 8, z: -8, width: 3, depth: 1, label: '乳製品', color: 0xFFEB3B },
            
            // 中央の商品棚
            { x: 0, z: 8, width: 4, depth: 1, label: 'お菓子', color: 0xE91E63 },
            { x: 0, z: 4, width: 4, depth: 1, label: '飲み物', color: 0x9C27B0 },
            { x: 0, z: 0, width: 4, depth: 1, label: '日用品', color: 0x607D8B },
            { x: 0, z: -4, width: 4, depth: 1, label: '調味料', color: 0x795548 },
            { x: 0, z: -8, width: 4, depth: 1, label: '冷凍食品', color: 0x00BCD4 }
        ];

        shelfPositions.forEach(pos => {
            this.createShelf(pos.x, pos.z, pos.width, pos.depth, pos.label, pos.color);
        });
    }

    /**
     * 個別の棚を作成
     */
    createShelf(x, z, width, depth, label, color) {
        const shelfGroup = new THREE.Group();
        
        // 棚の本体
        const shelfGeometry = new THREE.BoxGeometry(width, 1.8, depth);
        const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, 0.9, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        shelfGroup.add(shelf);

        // 商品を表現する色つきブロック
        for (let i = 0; i < 6; i++) {
            const productGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const productMaterial = new THREE.MeshLambertMaterial({ color: color });
            const product = new THREE.Mesh(productGeometry, productMaterial);
            
            product.position.set(
                (Math.random() - 0.5) * (width - 0.5),
                1.2 + Math.random() * 0.4,
                (Math.random() - 0.5) * (depth - 0.2)
            );
            product.castShadow = true;
            shelfGroup.add(product);
        }

        // ラベル（テキスト）
        this.createShelfLabel(shelfGroup, label, color);

        shelfGroup.position.set(x, 0, z);
        this.scene.add(shelfGroup);
        this.shelves.push({
            group: shelfGroup,
            position: { x, z },
            width,
            depth,
            label
        });
        this.storeObjects.push(shelfGroup);
    }

    /**
     * 棚のラベルを作成
     */
    createShelfLabel(shelfGroup, text, color) {
        // 3Dテキストは複雑なので、代わりに色付きプレートを使用
        const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
        const labelMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, 2.2, 0);
        shelfGroup.add(label);
    }

    /**
     * レジカウンターを作成
     */
    createCheckouts() {
        const checkoutPositions = [
            { x: -2, z: -10 },
            { x: 0, z: -10 },
            { x: 2, z: -10 }
        ];

        checkoutPositions.forEach((pos, index) => {
            this.createCheckout(pos.x, pos.z, index + 1);
        });
    }

    /**
     * 個別のレジカウンターを作成
     */
    createCheckout(x, z, number) {
        const checkoutGroup = new THREE.Group();
        
        // カウンター
        const counterGeometry = new THREE.BoxGeometry(1.5, 1, 0.6);
        const counterMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.set(0, 0.5, 0);
        counter.castShadow = true;
        counter.receiveShadow = true;
        checkoutGroup.add(counter);

        // レジスター
        const registerGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.3);
        const registerMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const register = new THREE.Mesh(registerGeometry, registerMaterial);
        register.position.set(0, 1.15, 0);
        register.castShadow = true;
        checkoutGroup.add(register);

        // スクリーン
        const screenGeometry = new THREE.PlaneGeometry(0.2, 0.15);
        const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 1.3, 0.16);
        checkoutGroup.add(screen);

        checkoutGroup.position.set(x, 0, z);
        this.scene.add(checkoutGroup);
        this.checkouts.push({
            group: checkoutGroup,
            position: { x, z },
            number: number,
            queue: []
        });
        this.storeObjects.push(checkoutGroup);
    }

    /**
     * 入り口を作成
     */
    createEntrance() {
        // 入り口のドア（自動ドア風）
        const doorGeometry = new THREE.PlaneGeometry(3.5, 2.5);
        const doorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4FC3F7,
            transparent: true,
            opacity: 0.3
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.25, -this.storeDepth/2 + 0.01);
        this.scene.add(door);
        this.storeObjects.push(door);

        // 入り口看板
        const signGeometry = new THREE.PlaneGeometry(4, 1);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0xFF5722 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 3.2, -this.storeDepth/2 + 0.05);
        this.scene.add(sign);
        this.storeObjects.push(sign);
    }

    /**
     * 照明を設定
     */
    createLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // 主要照明
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        this.scene.add(mainLight);

        // 店内の蛍光灯
        this.createFluorescentLights();
    }

    /**
     * 蛍光灯を作成
     */
    createFluorescentLights() {
        const positions = [
            [-5, -5], [-5, 0], [-5, 5],
            [0, -5], [0, 0], [0, 5],
            [5, -5], [5, 0], [5, 5]
        ];

        positions.forEach(pos => {
            // 蛍光灯の形状
            const lightGeometry = new THREE.BoxGeometry(3, 0.1, 0.3);
            const lightMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xffffff,
                emissive: 0x222222
            });
            const lightFixture = new THREE.Mesh(lightGeometry, lightMaterial);
            lightFixture.position.set(pos[0], 3.8, pos[1]);
            this.scene.add(lightFixture);
            this.storeObjects.push(lightFixture);

            // ポイントライト
            const pointLight = new THREE.PointLight(0xffffff, 0.5, 8);
            pointLight.position.set(pos[0], 3.5, pos[1]);
            this.scene.add(pointLight);
        });
    }

    /**
     * 装飾要素を追加
     */
    createDecorations() {
        // ショッピングカート置き場
        this.createCartArea();
        
        // 案内表示
        this.createSignage();
    }

    /**
     * カート置き場を作成
     */
    createCartArea() {
        const cartPositions = [
            { x: -6, z: -9 },
            { x: -4, z: -9 },
            { x: 4, z: -9 },
            { x: 6, z: -9 }
        ];

        cartPositions.forEach(pos => {
            const cartGroup = new THREE.Group();
            
            const bodyGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.3);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 0.15, 0);
            cartGroup.add(body);

            const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6);
            const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(0, 0.45, -0.15);
            cartGroup.add(handle);

            cartGroup.position.set(pos.x, 0, pos.z);
            this.scene.add(cartGroup);
            this.storeObjects.push(cartGroup);
        });
    }

    /**
     * 案内表示を作成
     */
    createSignage() {
        // 通路案内
        const aisleSign = new THREE.Group();
        
        const signGeometry = new THREE.BoxGeometry(0.1, 2, 0.8);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
        const signPost = new THREE.Mesh(signGeometry, signMaterial);
        signPost.position.set(0, 1, 0);
        aisleSign.add(signPost);

        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 3);
        const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.set(0, 2.2, 0);
        arrow.rotation.z = -Math.PI / 2;
        aisleSign.add(arrow);

        aisleSign.position.set(-6, 0, 2);
        this.scene.add(aisleSign);
        this.storeObjects.push(aisleSign);
    }

    /**
     * パスファインディング用の障害物を設定
     */
    setupPathfinding() {
        // 壁
        this.pathFinder.setRectangleObstacle(0, 0, 40, 2); // 上壁
        this.pathFinder.setRectangleObstacle(0, 38, 40, 2); // 下壁
        this.pathFinder.setRectangleObstacle(0, 0, 2, 40); // 左壁
        this.pathFinder.setRectangleObstacle(38, 0, 2, 40); // 右壁

        // 棚の障害物
        this.shelves.forEach(shelf => {
            const gridPos = this.pathFinder.worldToGrid(shelf.position.x, shelf.position.z);
            const gridWidth = Math.ceil(shelf.width / this.pathFinder.cellSize);
            const gridDepth = Math.ceil(shelf.depth / this.pathFinder.cellSize);
            
            this.pathFinder.setRectangleObstacle(
                gridPos.x - Math.floor(gridWidth/2),
                gridPos.y - Math.floor(gridDepth/2),
                gridWidth,
                gridDepth
            );
        });

        // レジカウンターの障害物
        this.checkouts.forEach(checkout => {
            const gridPos = this.pathFinder.worldToGrid(checkout.position.x, checkout.position.z);
            this.pathFinder.setRectangleObstacle(gridPos.x - 1, gridPos.y - 1, 3, 2);
        });
    }

    /**
     * 店舗オブジェクトを取得
     */
    getStoreObjects() {
        return this.storeObjects;
    }

    /**
     * 棚情報を取得
     */
    getShelves() {
        return this.shelves;
    }

    /**
     * レジ情報を取得
     */
    getCheckouts() {
        return this.checkouts;
    }

    /**
     * 店舗を削除
     */
    dispose() {
        this.storeObjects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            this.scene.remove(obj);
        });
        this.storeObjects = [];
        this.shelves = [];
        this.checkouts = [];
    }
}