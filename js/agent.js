/**
 * 買い物客エージェントクラス
 * 自律的に行動する買い物客の実装
 */

class CustomerAgent {
    constructor(scene, pathFinder, id) {
        this.scene = scene;
        this.pathFinder = pathFinder;
        this.id = id;
        
        // エージェントの状態
        this.position = { x: 0, y: 0, z: 0 };
        this.target = null;
        this.path = [];
        this.currentPathIndex = 0;
        this.speed = 1.5 + Math.random() * 1; // 1.5-2.5の速度
        
        // 買い物状態
        this.state = 'entering'; // entering, shopping, queuing, purchasing, leaving
        this.shoppingList = this.generateShoppingList();
        this.currentShopItem = 0;
        this.cart = [];
        this.totalSpent = 0;
        this.waitTime = 0;
        this.patience = 30 + Math.random() * 60; // 30-90秒の忍耐
        
        // 3Dオブジェクト
        this.mesh = null;
        this.cartMesh = null;
        
        // アニメーション
        this.animationMixer = null;
        this.isWalking = false;
        
        this.createMesh();
        this.enterStore();
    }

    /**
     * 3Dメッシュを作成
     */
    createMesh() {
        // 基本的な人型シェイプ
        const geometry = new THREE.CapsuleGeometry(0.3, 1.6, 4, 8);
        const colors = [
            0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4,
            0xfecca7, 0xd63031, 0x74b9ff, 0xa29bfe
        ];
        const material = new THREE.MeshPhongMaterial({
            color: colors[Math.floor(Math.random() * colors.length)]
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.8, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // カートを作成
        this.createCart();
        
        // グループ化
        this.group = new THREE.Group();
        this.group.add(this.mesh);
        this.group.add(this.cartMesh);
        
        this.scene.add(this.group);
    }

    /**
     * ショッピングカートを作成
     */
    createCart() {
        const cartGroup = new THREE.Group();
        
        // カート本体
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.2, 0);
        cartGroup.add(body);
        
        // ハンドル
        const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8);
        const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, 0.6, -0.2);
        cartGroup.add(handle);
        
        // 車輪
        const wheelGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        
        const positions = [
            [-0.2, 0, 0.15], [0.2, 0, 0.15],
            [-0.2, 0, -0.15], [0.2, 0, -0.15]
        ];
        
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.rotation.z = Math.PI / 2;
            cartGroup.add(wheel);
        });
        
        cartGroup.position.set(0.8, 0, 0);
        this.cartMesh = cartGroup;
    }

    /**
     * 買い物リストを生成
     */
    generateShoppingList() {
        const items = [
            { name: '野菜', section: 'produce', position: { x: -8, z: 8 }, price: 300 },
            { name: '肉', section: 'meat', position: { x: 8, z: 8 }, price: 800 },
            { name: 'パン', section: 'bakery', position: { x: -8, z: -8 }, price: 200 },
            { name: '牛乳', section: 'dairy', position: { x: 8, z: -8 }, price: 150 },
            { name: 'お菓子', section: 'snacks', position: { x: 0, z: 8 }, price: 400 },
            { name: '調味料', section: 'condiments', position: { x: 0, z: -8 }, price: 250 }
        ];
        
        // ランダムに2-5個のアイテムを選択
        const itemCount = 2 + Math.floor(Math.random() * 4);
        const shuffled = items.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, itemCount);
    }

    /**
     * 店に入る
     */
    enterStore() {
        const entrance = { x: 0, z: -12 };
        this.position = { ...entrance };
        this.group.position.set(entrance.x, 0, entrance.z);
        this.setState('shopping');
        this.planNextDestination();
    }

    /**
     * 状態を設定
     */
    setState(newState) {
        this.state = newState;
        console.log(`Customer ${this.id}: ${newState}`);
    }

    /**
     * 次の目的地を計画
     */
    planNextDestination() {
        switch (this.state) {
            case 'shopping':
                if (this.currentShopItem < this.shoppingList.length) {
                    const item = this.shoppingList[this.currentShopItem];
                    this.moveTo(item.position);
                } else {
                    this.setState('queuing');
                    this.moveTo({ x: 0, z: -10 }); // レジエリア
                }
                break;
                
            case 'queuing':
                this.setState('purchasing');
                break;
                
            case 'purchasing':
                this.setState('leaving');
                this.moveTo({ x: 0, z: -12 }); // 出口
                break;
                
            case 'leaving':
                this.remove();
                break;
        }
    }

    /**
     * 指定位置に移動
     */
    moveTo(targetPosition) {
        this.target = targetPosition;
        const path = this.pathFinder.findPath(this.position, targetPosition);
        
        if (path.length > 0) {
            this.path = path;
            this.currentPathIndex = 0;
            this.isWalking = true;
        } else {
            // パスが見つからない場合は直接移動
            this.path = [targetPosition];
            this.currentPathIndex = 0;
            this.isWalking = true;
        }
    }

    /**
     * 更新処理
     */
    update(deltaTime) {
        if (!this.mesh) return;
        
        this.updateMovement(deltaTime);
        this.updateBehavior(deltaTime);
        this.updateAnimation(deltaTime);
    }

    /**
     * 移動処理
     */
    updateMovement(deltaTime) {
        if (this.path.length === 0 || this.currentPathIndex >= this.path.length) {
            this.isWalking = false;
            return;
        }

        const currentTarget = this.path[this.currentPathIndex];
        const dx = currentTarget.x - this.position.x;
        const dz = currentTarget.z - this.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.5) {
            this.currentPathIndex++;
            if (this.currentPathIndex >= this.path.length) {
                this.onReachedDestination();
                return;
            }
        } else {
            // 移動
            const moveDistance = this.speed * deltaTime;
            const normalizedDx = dx / distance;
            const normalizedDz = dz / distance;

            this.position.x += normalizedDx * moveDistance;
            this.position.z += normalizedDz * moveDistance;

            // 3Dオブジェクトの位置を更新
            this.group.position.x = this.position.x;
            this.group.position.z = this.position.z;

            // 向きを更新
            const angle = Math.atan2(normalizedDx, normalizedDz);
            this.group.rotation.y = angle;
        }
    }

    /**
     * 行動処理
     */
    updateBehavior(deltaTime) {
        switch (this.state) {
            case 'shopping':
                if (!this.isWalking) {
                    this.waitTime += deltaTime;
                    if (this.waitTime >= 2 + Math.random() * 3) { // 2-5秒待機
                        this.collectItem();
                        this.waitTime = 0;
                        this.currentShopItem++;
                        this.planNextDestination();
                    }
                }
                break;

            case 'queuing':
                this.waitTime += deltaTime;
                if (this.waitTime >= 5 + Math.random() * 10) { // 5-15秒待機
                    this.planNextDestination();
                    this.waitTime = 0;
                }
                break;

            case 'purchasing':
                this.waitTime += deltaTime;
                if (this.waitTime >= 3 + Math.random() * 2) { // 3-5秒で購入
                    this.completePurchase();
                    this.waitTime = 0;
                    this.planNextDestination();
                }
                break;
        }
    }

    /**
     * アニメーション更新
     */
    updateAnimation(deltaTime) {
        if (this.isWalking) {
            // 歩行アニメーション（上下に軽く揺れる）
            const walkCycle = Date.now() * 0.008;
            this.mesh.position.y = 0.8 + Math.sin(walkCycle) * 0.1;
            
            // カートも軽く揺れる
            if (this.cartMesh) {
                this.cartMesh.rotation.z = Math.sin(walkCycle * 0.5) * 0.02;
            }
        }
    }

    /**
     * 目的地到着時の処理
     */
    onReachedDestination() {
        this.isWalking = false;
        this.path = [];
        this.currentPathIndex = 0;
    }

    /**
     * アイテムを収集
     */
    collectItem() {
        if (this.currentShopItem < this.shoppingList.length) {
            const item = this.shoppingList[this.currentShopItem];
            this.cart.push(item);
            this.addItemToCart();
            console.log(`Customer ${this.id} collected: ${item.name}`);
        }
    }

    /**
     * カートにアイテムを視覚的に追加
     */
    addItemToCart() {
        const itemGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const itemMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
        });
        const itemMesh = new THREE.Mesh(itemGeometry, itemMaterial);
        
        const itemCount = this.cart.length;
        itemMesh.position.set(
            (Math.random() - 0.5) * 0.4,
            0.3 + itemCount * 0.1,
            (Math.random() - 0.5) * 0.3
        );
        
        this.cartMesh.add(itemMesh);
    }

    /**
     * 購入完了
     */
    completePurchase() {
        this.totalSpent = this.cart.reduce((total, item) => total + item.price, 0);
        console.log(`Customer ${this.id} purchased items for ¥${this.totalSpent}`);
        
        // 統計情報を更新
        if (window.gameStats) {
            window.gameStats.totalSales += this.totalSpent;
            window.gameStats.completedCustomers++;
        }
    }

    /**
     * エージェントを削除
     */
    remove() {
        if (this.group && this.scene) {
            this.scene.remove(this.group);
            
            // メモリクリーンアップ
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            
            if (window.gameStats) {
                window.gameStats.activeCustomers--;
            }
        }
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return {
            id: this.id,
            state: this.state,
            position: this.position,
            cartItems: this.cart.length,
            totalSpent: this.totalSpent,
            currentItem: this.currentShopItem < this.shoppingList.length ? 
                        this.shoppingList[this.currentShopItem].name : 'none'
        };
    }
}

/**
 * エージェント管理クラス
 */
class AgentManager {
    constructor(scene, pathFinder) {
        this.scene = scene;
        this.pathFinder = pathFinder;
        this.agents = [];
        this.nextId = 1;
        this.spawnTimer = 0;
        this.spawnInterval = 3; // 3秒ごとにスポーン
        this.maxAgents = 10;
    }

    /**
     * 更新処理
     */
    update(deltaTime, simulationSpeed = 1) {
        const scaledDelta = deltaTime * simulationSpeed;
        
        // エージェントを更新
        for (let i = this.agents.length - 1; i >= 0; i--) {
            const agent = this.agents[i];
            agent.update(scaledDelta);
            
            // 削除されたエージェントを配列から除去
            if (agent.state === 'removed') {
                this.agents.splice(i, 1);
            }
        }
        
        // 新しいエージェントをスポーン
        this.spawnTimer += scaledDelta;
        if (this.spawnTimer >= this.spawnInterval && this.agents.length < this.maxAgents) {
            this.spawnAgent();
            this.spawnTimer = 0;
        }
        
        // 統計情報を更新
        if (window.gameStats) {
            window.gameStats.activeCustomers = this.agents.filter(a => a.state !== 'leaving').length;
            window.gameStats.queueLength = this.agents.filter(a => a.state === 'queuing').length;
        }
    }

    /**
     * エージェントをスポーン
     */
    spawnAgent() {
        const agent = new CustomerAgent(this.scene, this.pathFinder, this.nextId++);
        this.agents.push(agent);
        
        if (window.gameStats) {
            window.gameStats.activeCustomers++;
        }
    }

    /**
     * エージェント数を設定
     */
    setMaxAgents(count) {
        this.maxAgents = count;
    }

    /**
     * 全エージェントを削除
     */
    clearAllAgents() {
        this.agents.forEach(agent => agent.remove());
        this.agents = [];
        
        if (window.gameStats) {
            window.gameStats.activeCustomers = 0;
            window.gameStats.queueLength = 0;
        }
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return this.agents.map(agent => agent.getDebugInfo());
    }
}