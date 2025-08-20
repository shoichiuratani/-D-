/**
 * 客層セグメントシステム
 * シニア・子あり世代・シングル・若者の心理特性と行動パターン
 */

class CustomerSegments {
    constructor() {
        this.segments = {
            senior: new SeniorSegment(),
            family: new FamilySegment(),
            single: new SingleSegment(),
            youth: new YouthSegment()
        };
        
        this.segmentWeights = {
            senior: 0.25,
            family: 0.35,
            single: 0.25,
            youth: 0.15
        };
    }

    /**
     * セグメント比率を更新
     */
    updateSegmentWeights(weights) {
        // 合計が100%になるよう正規化
        const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
        Object.keys(weights).forEach(segment => {
            this.segmentWeights[segment] = weights[segment] / total;
        });
    }

    /**
     * ランダムにセグメントを選択
     */
    selectRandomSegment() {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [segment, weight] of Object.entries(this.segmentWeights)) {
            cumulative += weight;
            if (random <= cumulative) {
                return segment;
            }
        }
        
        return 'single'; // フォールバック
    }

    /**
     * セグメント別顧客を生成
     */
    generateCustomer(segmentType, customParams = {}) {
        const segment = this.segments[segmentType];
        if (!segment) {
            throw new Error(`Unknown segment type: ${segmentType}`);
        }
        
        return segment.generateCustomer(customParams);
    }

    /**
     * セグメント統計を取得
     */
    getSegmentStats() {
        return {
            weights: { ...this.segmentWeights },
            characteristics: Object.fromEntries(
                Object.entries(this.segments).map(([key, segment]) => [
                    key, segment.getCharacteristics()
                ])
            )
        };
    }
}

/**
 * シニア層 (60歳以上)
 * 特徴: 慎重な判断、品質重視、健康意識、習慣的購買
 */
class SeniorSegment {
    constructor() {
        this.characteristics = {
            ageRange: [60, 85],
            decisionSpeed: 'slow',
            pricesensitivity: 'medium',
            qualityFocus: 'high',
            healthConsciousness: 'high',
            technologyAdoption: 'low',
            brandLoyalty: 'high',
            impulsiveness: 'low'
        };
        
        this.psychographics = {
            // 嗜好性パラメータ
            hedonic: 0.3,           // 快楽追求（低）
            qualityPursuit: 0.8,    // 高付加価値追求（高）
            safety: 0.9,            // 安全安心（高）
            efficiency: 0.6,        // 効率重視（中）
            price: 0.7              // 価格追求（中-高）
        };
        
        this.behavioralPatterns = {
            attentionCapacity: 0.7,     // 注意容量（やや低）
            goalFocus: 0.9,             // 目標集中度（高）
            distractibility: 0.3,       // 注意散漫度（低）
            patience: 15.0,             // 忍耐力（高）
            crowdingTolerance: 0.6,     // 混雑耐性（やや低）
            statusSensitivity: 0.4      // ステータス感度（低）
        };
    }

    generateCustomer(customParams = {}) {
        const age = this.randomInRange(this.characteristics.ageRange[0], this.characteristics.ageRange[1]);
        const gender = Math.random() < 0.6 ? 'female' : 'male';
        
        const customer = {
            segment: 'senior',
            age: age,
            gender: gender,
            
            // 心理特性
            psychographics: {
                hedonic: this.addNoise(this.psychographics.hedonic, 0.1),
                qualityPursuit: this.addNoise(this.psychographics.qualityPursuit, 0.1),
                safety: this.addNoise(this.psychographics.safety, 0.1),
                efficiency: this.addNoise(this.psychographics.efficiency, 0.15),
                price: this.addNoise(this.psychographics.price, 0.15)
            },
            
            // 行動パラメータ
            behavioral: {
                attentionCapacity: this.addNoise(this.behavioralPatterns.attentionCapacity, 0.1),
                goalFocus: this.addNoise(this.behavioralPatterns.goalFocus, 0.1),
                distractibility: this.addNoise(this.behavioralPatterns.distractibility, 0.1),
                patience: this.addNoise(this.behavioralPatterns.patience, 3.0),
                crowdingTolerance: this.addNoise(this.behavioralPatterns.crowdingTolerance, 0.15),
                statusSensitivity: this.addNoise(this.behavioralPatterns.statusSensitivity, 0.1)
            },
            
            // お菓子に対する態度
            snackPreferences: this.generateSnackPreferences(),
            
            // POP反応特性
            popSensitivity: this.generatePOPSensitivity(),
            
            // 予算・買い物行動
            budget: this.randomInRange(2000, 5000),
            planningLevel: this.randomInRange(0.7, 0.95),
            impulseLevel: this.randomInRange(0.1, 0.3),
            
            // ブランド・習慣
            brandPreferences: this.generateBrandPreferences(),
            purchaseHistory: this.generatePurchaseHistory(),
            
            ...customParams
        };
        
        return customer;
    }

    generateSnackPreferences() {
        return {
            // カテゴリ別嗜好度
            traditional: this.randomInRange(0.7, 0.9),  // 伝統的なお菓子
            healthy: this.randomInRange(0.6, 0.8),      // 健康志向
            premium: this.randomInRange(0.5, 0.8),      // プレミアム商品
            seasonal: this.randomInRange(0.6, 0.8),     // 季節商品
            chocolate: this.randomInRange(0.4, 0.7),    // チョコレート
            candy: this.randomInRange(0.3, 0.6),        // キャンディ
            
            // 特徴重視度
            lowSugar: this.randomInRange(0.6, 0.9),     // 低糖
            functional: this.randomInRange(0.5, 0.8),   // 機能性
            naturalIngredients: this.randomInRange(0.7, 0.9), // 天然素材
            familiarBrands: this.randomInRange(0.8, 0.95)     // 馴染みブランド
        };
    }

    generatePOPSensitivity() {
        return {
            discount: this.randomInRange(0.7, 0.9),     // 割引表示に敏感
            limited: this.randomInRange(0.6, 0.8),      // 限定商品
            health: this.randomInRange(0.7, 0.9),       // 健康訴求
            traditional: this.randomInRange(0.8, 0.95), // 伝統・老舗訴求
            character: this.randomInRange(0.2, 0.4),    // キャラクター（低感度）
            celebrity: this.randomInRange(0.3, 0.5),    // 芸能人（低感度）
            eyeLevel: 1.2,                              // 目線の高さ補正
            readingTime: 1.5                            // 読む時間（長め）
        };
    }

    generateBrandPreferences() {
        // ロッテ製品への親しみやすさが高い
        return {
            'lotte': this.randomInRange(0.7, 0.9),
            'meiji': this.randomInRange(0.7, 0.85),
            'morinaga': this.randomInRange(0.6, 0.8),
            'glico': this.randomInRange(0.6, 0.8),
            'bourbon': this.randomInRange(0.5, 0.7),
            'yakult': this.randomInRange(0.5, 0.7)
        };
    }

    generatePurchaseHistory() {
        const items = [
            'xylitol_gum', 'koala_march', 'ghana_chocolate',
            'pie_no_mi', 'toppo', 'biscas'
        ];
        
        const history = [];
        const historyLength = this.randomInRange(20, 50);
        
        for (let i = 0; i < historyLength; i++) {
            history.push({
                id: items[Math.floor(Math.random() * items.length)],
                frequency: this.randomInRange(0.3, 0.8),
                recency: Math.random() * 30
            });
        }
        
        return history;
    }

    getCharacteristics() {
        return {
            description: "慎重で品質重視、健康意識が高く、習慣的な購買行動を示す",
            keyDrivers: ["品質", "健康", "安全性", "馴染み"],
            popResponse: "割引・健康訴求・伝統的価値に反応",
            decisionStyle: "時間をかけて慎重に判断",
            loyaltyLevel: "高い",
            ...this.characteristics
        };
    }

    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    addNoise(value, noiseLevel) {
        const noise = (Math.random() - 0.5) * 2 * noiseLevel;
        return Math.max(0, Math.min(1, value + noise));
    }
}

/**
 * 子あり世代 (30-40歳)
 * 特徴: 家族優先、時間制約、コスパ重視、子供の嗜好考慮
 */
class FamilySegment {
    constructor() {
        this.characteristics = {
            ageRange: [30, 45],
            decisionSpeed: 'medium',
            pricesensitivity: 'high',
            qualityFocus: 'medium',
            timeConstraint: 'high',
            childInfluence: 'high',
            planningOriented: 'high'
        };
        
        this.psychographics = {
            hedonic: 0.5,
            qualityPursuit: 0.6,
            safety: 0.8,
            efficiency: 0.9,
            price: 0.8
        };
        
        this.behavioralPatterns = {
            attentionCapacity: 0.6,
            goalFocus: 0.8,
            distractibility: 0.7,
            patience: 8.0,
            crowdingTolerance: 0.5,
            statusSensitivity: 0.5
        };
    }

    generateCustomer(customParams = {}) {
        const age = this.randomInRange(this.characteristics.ageRange[0], this.characteristics.ageRange[1]);
        const gender = Math.random() < 0.7 ? 'female' : 'male';
        const childrenCount = Math.floor(Math.random() * 3) + 1;
        
        const customer = {
            segment: 'family',
            age: age,
            gender: gender,
            childrenCount: childrenCount,
            
            psychographics: {
                hedonic: this.addNoise(this.psychographics.hedonic, 0.15),
                qualityPursuit: this.addNoise(this.psychographics.qualityPursuit, 0.15),
                safety: this.addNoise(this.psychographics.safety, 0.1),
                efficiency: this.addNoise(this.psychographics.efficiency, 0.1),
                price: this.addNoise(this.psychographics.price, 0.1)
            },
            
            behavioral: {
                attentionCapacity: this.addNoise(this.behavioralPatterns.attentionCapacity, 0.15),
                goalFocus: this.addNoise(this.behavioralPatterns.goalFocus, 0.1),
                distractibility: this.addNoise(this.behavioralPatterns.distractibility, 0.15),
                patience: this.addNoise(this.behavioralPatterns.patience, 2.0),
                crowdingTolerance: this.addNoise(this.behavioralPatterns.crowdingTolerance, 0.15),
                statusSensitivity: this.addNoise(this.behavioralPatterns.statusSensitivity, 0.15)
            },
            
            snackPreferences: this.generateSnackPreferences(childrenCount),
            popSensitivity: this.generatePOPSensitivity(),
            
            budget: this.randomInRange(3000, 8000),
            planningLevel: this.randomInRange(0.6, 0.9),
            impulseLevel: this.randomInRange(0.2, 0.5),
            timeConstraint: this.randomInRange(0.6, 0.9),
            
            brandPreferences: this.generateBrandPreferences(),
            purchaseHistory: this.generatePurchaseHistory(),
            
            // 家族特有
            childPreferences: this.generateChildPreferences(childrenCount),
            familySize: childrenCount + 2,
            bulkBuying: this.randomInRange(0.6, 0.9),
            
            ...customParams
        };
        
        return customer;
    }

    generateSnackPreferences(childrenCount) {
        const childInfluence = childrenCount * 0.2;
        
        return {
            kidfriendly: this.randomInRange(0.7, 0.95),
            character: this.randomInRange(0.6, 0.9),
            sharing: this.randomInRange(0.8, 0.95),
            affordable: this.randomInRange(0.7, 0.9),
            familypack: this.randomInRange(0.8, 0.95),
            educational: this.randomInRange(0.5, 0.8),
            
            chocolate: this.randomInRange(0.6, 0.8) + childInfluence,
            candy: this.randomInRange(0.5, 0.8) + childInfluence,
            cookies: this.randomInRange(0.7, 0.9),
            gum: this.randomInRange(0.6, 0.8)
        };
    }

    generatePOPSensitivity() {
        return {
            discount: this.randomInRange(0.8, 0.95),
            familyPack: this.randomInRange(0.8, 0.95),
            character: this.randomInRange(0.7, 0.9),
            educational: this.randomInRange(0.6, 0.8),
            sharing: this.randomInRange(0.7, 0.9),
            bulk: this.randomInRange(0.8, 0.95),
            limited: this.randomInRange(0.5, 0.7),
            health: this.randomInRange(0.6, 0.8),
            eyeLevel: 1.0,
            readingTime: 0.8
        };
    }

    generateChildPreferences(childrenCount) {
        const preferences = [];
        for (let i = 0; i < childrenCount; i++) {
            preferences.push({
                age: this.randomInRange(3, 15),
                characterLove: this.randomInRange(0.7, 0.95),
                sweetness: this.randomInRange(0.8, 0.95),
                novelty: this.randomInRange(0.6, 0.9),
                colors: this.randomInRange(0.7, 0.9)
            });
        }
        return preferences;
    }

    generateBrandPreferences() {
        return {
            'lotte': this.randomInRange(0.6, 0.8),
            'meiji': this.randomInRange(0.6, 0.8),
            'glico': this.randomInRange(0.7, 0.9),
            'morinaga': this.randomInRange(0.6, 0.8),
            'bourbon': this.randomInRange(0.5, 0.7),
            'disney': this.randomInRange(0.7, 0.9)
        };
    }

    generatePurchaseHistory() {
        const items = [
            'koala_march', 'pucca', 'toppo', 'pie_no_mi',
            'ghana_chocolate', 'choco_pie', 'biscas'
        ];
        
        const history = [];
        const historyLength = this.randomInRange(15, 40);
        
        for (let i = 0; i < historyLength; i++) {
            history.push({
                id: items[Math.floor(Math.random() * items.length)],
                frequency: this.randomInRange(0.4, 0.8),
                recency: Math.random() * 14,
                bulkPurchase: Math.random() < 0.6
            });
        }
        
        return history;
    }

    getCharacteristics() {
        return {
            description: "時間制約下でコスパを重視し、子供の嗜好を考慮した購買",
            keyDrivers: ["コストパフォーマンス", "子供の好み", "時短", "ファミリーサイズ"],
            popResponse: "割引・キャラクター・ファミリーパック訴求に反応",
            decisionStyle: "効率重視で迅速な判断",
            loyaltyLevel: "中程度（コスパ次第）",
            ...this.characteristics
        };
    }

    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    addNoise(value, noiseLevel) {
        const noise = (Math.random() - 0.5) * 2 * noiseLevel;
        return Math.max(0, Math.min(1, value + noise));
    }
}

/**
 * シングル層 (20-40歳)
 * 特徴: 個人的嗜好重視、トレンド敏感、品質・体験重視
 */
class SingleSegment {
    constructor() {
        this.characteristics = {
            ageRange: [20, 40],
            decisionSpeed: 'medium-fast',
            pricesensitivity: 'medium',
            qualityFocus: 'high',
            trendSensitivity: 'high',
            experienceSeeking: 'high'
        };
        
        this.psychographics = {
            hedonic: 0.7,
            qualityPursuit: 0.7,
            safety: 0.6,
            efficiency: 0.7,
            price: 0.6
        };
        
        this.behavioralPatterns = {
            attentionCapacity: 0.8,
            goalFocus: 0.6,
            distractibility: 0.6,
            patience: 10.0,
            crowdingTolerance: 0.7,
            statusSensitivity: 0.7
        };
    }

    generateCustomer(customParams = {}) {
        const age = this.randomInRange(this.characteristics.ageRange[0], this.characteristics.ageRange[1]);
        const gender = Math.random() < 0.5 ? 'female' : 'male';
        
        const customer = {
            segment: 'single',
            age: age,
            gender: gender,
            
            psychographics: {
                hedonic: this.addNoise(this.psychographics.hedonic, 0.15),
                qualityPursuit: this.addNoise(this.psychographics.qualityPursuit, 0.15),
                safety: this.addNoise(this.psychographics.safety, 0.15),
                efficiency: this.addNoise(this.psychographics.efficiency, 0.15),
                price: this.addNoise(this.psychographics.price, 0.2)
            },
            
            behavioral: {
                attentionCapacity: this.addNoise(this.behavioralPatterns.attentionCapacity, 0.1),
                goalFocus: this.addNoise(this.behavioralPatterns.goalFocus, 0.15),
                distractibility: this.addNoise(this.behavioralPatterns.distractibility, 0.15),
                patience: this.addNoise(this.behavioralPatterns.patience, 3.0),
                crowdingTolerance: this.addNoise(this.behavioralPatterns.crowdingTolerance, 0.15),
                statusSensitivity: this.addNoise(this.behavioralPatterns.statusSensitivity, 0.2)
            },
            
            snackPreferences: this.generateSnackPreferences(),
            popSensitivity: this.generatePOPSensitivity(),
            
            budget: this.randomInRange(1500, 4000),
            planningLevel: this.randomInRange(0.3, 0.7),
            impulseLevel: this.randomInRange(0.4, 0.7),
            
            brandPreferences: this.generateBrandPreferences(),
            purchaseHistory: this.generatePurchaseHistory(),
            
            // シングル特有
            trendAwareness: this.randomInRange(0.7, 0.95),
            socialMediaInfluence: this.randomInRange(0.6, 0.9),
            premiumWillingness: this.randomInRange(0.5, 0.8),
            experienceSeeking: this.randomInRange(0.6, 0.9),
            
            ...customParams
        };
        
        return customer;
    }

    generateSnackPreferences() {
        return {
            premium: this.randomInRange(0.6, 0.9),
            artisanal: this.randomInRange(0.5, 0.8),
            limited: this.randomInRange(0.7, 0.9),
            instagrammable: this.randomInRange(0.6, 0.9),
            functional: this.randomInRange(0.5, 0.8),
            exotic: this.randomInRange(0.6, 0.8),
            
            chocolate: this.randomInRange(0.7, 0.9),
            cookies: this.randomInRange(0.6, 0.8),
            candy: this.randomInRange(0.4, 0.7),
            gum: this.randomInRange(0.5, 0.8)
        };
    }

    generatePOPSensitivity() {
        return {
            limited: this.randomInRange(0.8, 0.95),
            premium: this.randomInRange(0.7, 0.9),
            trend: this.randomInRange(0.8, 0.95),
            celebrity: this.randomInRange(0.6, 0.8),
            social: this.randomInRange(0.7, 0.9),
            experience: this.randomInRange(0.6, 0.9),
            discount: this.randomInRange(0.5, 0.7),
            health: this.randomInRange(0.6, 0.8),
            eyeLevel: 1.0,
            readingTime: 1.0
        };
    }

    generateBrandPreferences() {
        return {
            'lotte': this.randomInRange(0.5, 0.7),
            'meiji': this.randomInRange(0.6, 0.8),
            'godiva': this.randomInRange(0.7, 0.9),
            'royce': this.randomInRange(0.6, 0.8),
            'imported': this.randomInRange(0.6, 0.9),
            'artisan': this.randomInRange(0.5, 0.8)
        };
    }

    generatePurchaseHistory() {
        const items = [
            'ghana_chocolate', 'toppo', 'pie_no_mi',
            'premium_chocolate', 'limited_edition', 'craft_snacks'
        ];
        
        const history = [];
        const historyLength = this.randomInRange(10, 30);
        
        for (let i = 0; i < historyLength; i++) {
            history.push({
                id: items[Math.floor(Math.random() * items.length)],
                frequency: this.randomInRange(0.2, 0.6),
                recency: Math.random() * 21,
                premiumPurchase: Math.random() < 0.4
            });
        }
        
        return history;
    }

    getCharacteristics() {
        return {
            description: "個人的嗜好とトレンドを重視し、体験価値や品質を求める",
            keyDrivers: ["トレンド", "品質", "個性", "体験価値"],
            popResponse: "限定・プレミアム・トレンド訴求に反応",
            decisionStyle: "感情的で直感的",
            loyaltyLevel: "低-中程度（新奇性重視）",
            ...this.characteristics
        };
    }

    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    addNoise(value, noiseLevel) {
        const noise = (Math.random() - 0.5) * 2 * noiseLevel;
        return Math.max(0, Math.min(1, value + noise));
    }
}

/**
 * 若者層 (10-30歳)
 * 特徴: 新奇性追求、SNS影響、キャラクター愛、価格敏感
 */
class YouthSegment {
    constructor() {
        this.characteristics = {
            ageRange: [10, 30],
            decisionSpeed: 'fast',
            pricesensitivity: 'high',
            noveltySeking: 'very-high',
            socialInfluence: 'very-high',
            characterLove: 'high'
        };
        
        this.psychographics = {
            hedonic: 0.8,
            qualityPursuit: 0.4,
            safety: 0.4,
            efficiency: 0.5,
            price: 0.8
        };
        
        this.behavioralPatterns = {
            attentionCapacity: 0.6,
            goalFocus: 0.4,
            distractibility: 0.8,
            patience: 5.0,
            crowdingTolerance: 0.8,
            statusSensitivity: 0.8
        };
    }

    generateCustomer(customParams = {}) {
        const age = this.randomInRange(this.characteristics.ageRange[0], this.characteristics.ageRange[1]);
        const gender = Math.random() < 0.5 ? 'female' : 'male';
        
        const customer = {
            segment: 'youth',
            age: age,
            gender: gender,
            
            psychographics: {
                hedonic: this.addNoise(this.psychographics.hedonic, 0.1),
                qualityPursuit: this.addNoise(this.psychographics.qualityPursuit, 0.2),
                safety: this.addNoise(this.psychographics.safety, 0.2),
                efficiency: this.addNoise(this.psychographics.efficiency, 0.2),
                price: this.addNoise(this.psychographics.price, 0.15)
            },
            
            behavioral: {
                attentionCapacity: this.addNoise(this.behavioralPatterns.attentionCapacity, 0.15),
                goalFocus: this.addNoise(this.behavioralPatterns.goalFocus, 0.2),
                distractibility: this.addNoise(this.behavioralPatterns.distractibility, 0.15),
                patience: this.addNoise(this.behavioralPatterns.patience, 2.0),
                crowdingTolerance: this.addNoise(this.behavioralPatterns.crowdingTolerance, 0.15),
                statusSensitivity: this.addNoise(this.behavioralPatterns.statusSensitivity, 0.15)
            },
            
            snackPreferences: this.generateSnackPreferences(),
            popSensitivity: this.generatePOPSensitivity(),
            
            budget: this.randomInRange(500, 2500),
            planningLevel: this.randomInRange(0.1, 0.5),
            impulseLevel: this.randomInRange(0.6, 0.9),
            
            brandPreferences: this.generateBrandPreferences(),
            purchaseHistory: this.generatePurchaseHistory(),
            
            // 若者特有
            socialMediaActivity: this.randomInRange(0.8, 0.95),
            trendFollowing: this.randomInRange(0.7, 0.95),
            characterAttachment: this.randomInRange(0.6, 0.9),
            noveltySeek: this.randomInRange(0.8, 0.95),
            peerInfluence: this.randomInRange(0.7, 0.9),
            
            ...customParams
        };
        
        return customer;
    }

    generateSnackPreferences() {
        return {
            colorful: this.randomInRange(0.8, 0.95),
            character: this.randomInRange(0.8, 0.95),
            novelty: this.randomInRange(0.8, 0.95),
            social: this.randomInRange(0.7, 0.9),
            affordable: this.randomInRange(0.8, 0.95),
            trendy: this.randomInRange(0.8, 0.95),
            
            candy: this.randomInRange(0.8, 0.95),
            chocolate: this.randomInRange(0.7, 0.9),
            gum: this.randomInRange(0.7, 0.9),
            cookies: this.randomInRange(0.6, 0.8)
        };
    }

    generatePOPSensitivity() {
        return {
            character: this.randomInRange(0.9, 0.95),
            trendy: this.randomInRange(0.8, 0.95),
            social: this.randomInRange(0.8, 0.95),
            discount: this.randomInRange(0.8, 0.95),
            limited: this.randomInRange(0.8, 0.95),
            celebrity: this.randomInRange(0.7, 0.9),
            colorful: this.randomInRange(0.8, 0.95),
            gaming: this.randomInRange(0.7, 0.9),
            eyeLevel: 1.0,
            readingTime: 0.5
        };
    }

    generateBrandPreferences() {
        return {
            'lotte': this.randomInRange(0.6, 0.8),
            'glico': this.randomInRange(0.7, 0.9),
            'meiji': this.randomInRange(0.6, 0.8),
            'pokemon': this.randomInRange(0.8, 0.95),
            'disney': this.randomInRange(0.7, 0.9),
            'anime': this.randomInRange(0.8, 0.95)
        };
    }

    generatePurchaseHistory() {
        const items = [
            'pucca', 'koala_march', 'toppo', 'choco_pie',
            'character_candy', 'limited_snacks', 'trendy_sweets'
        ];
        
        const history = [];
        const historyLength = this.randomInRange(5, 20);
        
        for (let i = 0; i < historyLength; i++) {
            history.push({
                id: items[Math.floor(Math.random() * items.length)],
                frequency: this.randomInRange(0.1, 0.5),
                recency: Math.random() * 7,
                impulse: Math.random() < 0.7
            });
        }
        
        return history;
    }

    getCharacteristics() {
        return {
            description: "新奇性とキャラクターを愛し、SNSとトレンドに敏感で衝動的",
            keyDrivers: ["新奇性", "キャラクター", "トレンド", "価格", "SNS映え"],
            popResponse: "キャラクター・トレンド・カラフル訴求に強反応",
            decisionStyle: "衝動的で感情的",
            loyaltyLevel: "低（新しいもの好き）",
            ...this.characteristics
        };
    }

    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    addNoise(value, noiseLevel) {
        const noise = (Math.random() - 0.5) * 2 * noiseLevel;
        return Math.max(0, Math.min(1, value + noise));
    }
}

// グローバル公開
window.CustomerSegments = CustomerSegments;
window.SeniorSegment = SeniorSegment;
window.FamilySegment = FamilySegment;
window.SingleSegment = SingleSegment;
window.YouthSegment = YouthSegment;