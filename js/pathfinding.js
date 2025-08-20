/**
 * A*経路探索アルゴリズムの実装
 * グリッドベースの経路探索を提供
 */

class PathFinder {
    constructor(gridWidth, gridHeight, cellSize = 1) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;
        this.grid = this.createGrid();
        this.obstacles = new Set();
    }

    /**
     * グリッドを初期化
     */
    createGrid() {
        const grid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                grid[x][y] = {
                    x: x,
                    y: y,
                    walkable: true,
                    gCost: 0,
                    hCost: 0,
                    fCost: 0,
                    parent: null
                };
            }
        }
        return grid;
    }

    /**
     * 障害物を設定
     */
    setObstacle(x, y, walkable = false) {
        if (this.isValidCoordinate(x, y)) {
            this.grid[x][y].walkable = walkable;
            const key = `${x},${y}`;
            if (!walkable) {
                this.obstacles.add(key);
            } else {
                this.obstacles.delete(key);
            }
        }
    }

    /**
     * 矩形エリアに障害物を設定
     */
    setRectangleObstacle(startX, startY, width, height, walkable = false) {
        for (let x = startX; x < startX + width; x++) {
            for (let y = startY; y < startY + height; y++) {
                this.setObstacle(x, y, walkable);
            }
        }
    }

    /**
     * 座標が有効範囲内かチェック
     */
    isValidCoordinate(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    /**
     * ワールド座標をグリッド座標に変換
     */
    worldToGrid(worldX, worldZ) {
        return {
            x: Math.floor(worldX / this.cellSize + this.gridWidth / 2),
            y: Math.floor(worldZ / this.cellSize + this.gridHeight / 2)
        };
    }

    /**
     * グリッド座標をワールド座標に変換
     */
    gridToWorld(gridX, gridY) {
        return {
            x: (gridX - this.gridWidth / 2) * this.cellSize,
            z: (gridY - this.gridHeight / 2) * this.cellSize
        };
    }

    /**
     * A*アルゴリズムによる経路探索
     */
    findPath(startWorld, endWorld) {
        const start = this.worldToGrid(startWorld.x, startWorld.z);
        const end = this.worldToGrid(endWorld.x, endWorld.z);

        if (!this.isValidCoordinate(start.x, start.y) || 
            !this.isValidCoordinate(end.x, end.y)) {
            return [];
        }

        if (!this.grid[start.x][start.y].walkable || 
            !this.grid[end.x][end.y].walkable) {
            return [];
        }

        // グリッドをリセット
        this.resetGrid();

        const openSet = [];
        const closedSet = new Set();
        
        const startNode = this.grid[start.x][start.y];
        const endNode = this.grid[end.x][end.y];
        
        openSet.push(startNode);

        while (openSet.length > 0) {
            // 最小fCostのノードを選択
            let currentNode = openSet[0];
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].fCost < currentNode.fCost ||
                    (openSet[i].fCost === currentNode.fCost && openSet[i].hCost < currentNode.hCost)) {
                    currentNode = openSet[i];
                }
            }

            openSet.splice(openSet.indexOf(currentNode), 1);
            closedSet.add(`${currentNode.x},${currentNode.y}`);

            // 目標に到達
            if (currentNode === endNode) {
                return this.reconstructPath(startNode, endNode);
            }

            // 隣接ノードを探索
            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.walkable || closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    continue;
                }

                const newGCost = currentNode.gCost + this.getDistance(currentNode, neighbor);
                
                if (newGCost < neighbor.gCost || !openSet.includes(neighbor)) {
                    neighbor.gCost = newGCost;
                    neighbor.hCost = this.getDistance(neighbor, endNode);
                    neighbor.fCost = neighbor.gCost + neighbor.hCost;
                    neighbor.parent = currentNode;

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return []; // パスが見つからない
    }

    /**
     * グリッドをリセット
     */
    resetGrid() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const node = this.grid[x][y];
                node.gCost = 0;
                node.hCost = 0;
                node.fCost = 0;
                node.parent = null;
            }
        }
    }

    /**
     * 隣接ノードを取得
     */
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            const x = node.x + dx;
            const y = node.y + dy;

            if (this.isValidCoordinate(x, y)) {
                neighbors.push(this.grid[x][y]);
            }
        }

        return neighbors;
    }

    /**
     * 2ノード間の距離を計算
     */
    getDistance(nodeA, nodeB) {
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        
        if (dx > dy) {
            return 14 * dy + 10 * (dx - dy);
        } else {
            return 14 * dx + 10 * (dy - dx);
        }
    }

    /**
     * パスを再構築
     */
    reconstructPath(startNode, endNode) {
        const path = [];
        let currentNode = endNode;

        while (currentNode !== startNode) {
            const worldPos = this.gridToWorld(currentNode.x, currentNode.y);
            path.unshift({
                x: worldPos.x,
                y: 0,
                z: worldPos.z
            });
            currentNode = currentNode.parent;
        }

        // スタート地点も追加
        const startWorld = this.gridToWorld(startNode.x, startNode.y);
        path.unshift({
            x: startWorld.x,
            y: 0,
            z: startWorld.z
        });

        return this.smoothPath(path);
    }

    /**
     * パスをスムージング
     */
    smoothPath(path) {
        if (path.length <= 2) return path;

        const smoothedPath = [path[0]];
        let current = 0;

        while (current < path.length - 1) {
            let farthest = current + 1;
            
            // 直線で行けるかチェック
            for (let i = current + 2; i < path.length; i++) {
                if (this.hasLineOfSight(path[current], path[i])) {
                    farthest = i;
                } else {
                    break;
                }
            }
            
            smoothedPath.push(path[farthest]);
            current = farthest;
        }

        return smoothedPath;
    }

    /**
     * 2点間に障害物がないかチェック
     */
    hasLineOfSight(from, to) {
        const gridFrom = this.worldToGrid(from.x, from.z);
        const gridTo = this.worldToGrid(to.x, to.z);

        const dx = Math.abs(gridTo.x - gridFrom.x);
        const dy = Math.abs(gridTo.y - gridFrom.y);
        const x = gridFrom.x;
        const y = gridFrom.y;
        const n = 1 + dx + dy;
        const x_inc = (gridTo.x > gridFrom.x) ? 1 : -1;
        const y_inc = (gridTo.y > gridFrom.y) ? 1 : -1;
        let error = dx - dy;
        
        dx *= 2;
        dy *= 2;

        let currentX = x;
        let currentY = y;

        for (let i = 0; i < n; i++) {
            if (!this.isValidCoordinate(currentX, currentY) ||
                !this.grid[currentX][currentY].walkable) {
                return false;
            }

            if (error > 0) {
                currentX += x_inc;
                error -= dy;
            } else {
                currentY += y_inc;
                error += dx;
            }
        }

        return true;
    }

    /**
     * ランダムな歩行可能位置を取得
     */
    getRandomWalkablePosition() {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            
            if (this.grid[x][y].walkable) {
                return this.gridToWorld(x, y);
            }
            attempts++;
        }

        // フォールバック: グリッドの中心
        return this.gridToWorld(
            Math.floor(this.gridWidth / 2),
            Math.floor(this.gridHeight / 2)
        );
    }
}