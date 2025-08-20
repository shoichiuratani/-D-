/**
 * 認知計算モデル: STOP/HOLD/CLOSE
 * 心理学的購買行動の数理モデル実装
 */

class CognitiveModels {
    constructor() {
        this.models = {
            attention: new AttentionModel(),
            decision: new DecisionModel(),
            queue: new QueueModel()
        };
    }
}

/**
 * STOP - 注意配分モデル
 * 視覚的サリエンスと目標指向注意の統合
 */
class AttentionModel {
    constructor() {
        this.parameters = {
            // 視覚サリエンス基本パラメータ
            luminanceWeight: 0.3,
            colorContrastWeight: 0.4,
            popEffectWeight: 0.3,
            
            // 注意配分パラメータ
            goalMatchWeight: 2.0,
            bottomUpWeight: 1.0,
            topDownWeight: 1.5,
            
            // 個人差パラメータ
            attentionCapacity: 1.0,
            distractibility: 0.5,
            goalFocus: 1.0
        };
    }

    /**
     * 視覚サリエンスを計算
     * σ_i = f(luminance, color_contrast, β_POP)
     */
    calculateVisualSalience(item, environment) {
        const luminance = this.calculateLuminance(item);
        const colorContrast = this.calculateColorContrast(item, environment);
        const popEffect = this.calculatePOPEffect(item);
        
        const salience = 
            this.parameters.luminanceWeight * luminance +
            this.parameters.colorContrastWeight * colorContrast +
            this.parameters.popEffectWeight * popEffect;
            
        return Math.max(0, Math.min(1, salience));
    }

    /**
     * 輝度値を計算
     */
    calculateLuminance(item) {
        const baseSize = item.size || 1.0;
        const lighting = item.lighting || 0.7;
        const position = item.position || { height: 1.0, visibility: 1.0 };
        
        return baseSize * lighting * position.visibility;
    }

    /**
     * 色コントラストを計算
     */
    calculateColorContrast(item, environment) {
        const itemColor = item.color || { r: 128, g: 128, b: 128 };
        const bgColor = environment.backgroundColor || { r: 200, g: 200, b: 200 };
        
        // 色差を計算 (簡易版)
        const colorDiff = Math.sqrt(
            Math.pow(itemColor.r - bgColor.r, 2) +
            Math.pow(itemColor.g - bgColor.g, 2) +
            Math.pow(itemColor.b - bgColor.b, 2)
        ) / (255 * Math.sqrt(3));
        
        return colorDiff;
    }

    /**
     * POP効果を計算
     */
    calculatePOPEffect(item) {
        const popType = item.popType || 'none';
        const popSize = item.popSize || 1.0;
        const popPosition = item.popPosition || 'shelf';
        
        const typeEffects = {
            'none': 0.0,
            'discount': 0.8,
            'limited': 0.7,
            'seasonal': 0.6,
            'character': 0.5,
            'premium': 0.4
        };
        
        const positionEffects = {
            'eye-level': 1.0,
            'shelf': 0.8,
            'endcap': 1.2,
            'register': 1.1,
            'floor': 0.6
        };
        
        const baseEffect = typeEffects[popType] || 0.0;
        const positionMultiplier = positionEffects[popPosition] || 0.8;
        
        return baseEffect * positionMultiplier * popSize;
    }

    /**
     * 注意配分確率を計算
     * p(look_at_i) ∝ σ_i · (1 + λ · goal_match_i)
     */
    calculateAttentionProbability(item, customer, allItems) {
        const salience = this.calculateVisualSalience(item, customer.environment);
        const goalMatch = this.calculateGoalMatch(item, customer);
        
        const rawAttention = salience * (1 + this.parameters.goalMatchWeight * goalMatch);
        
        // ソフトマックス正規化
        const totalAttention = allItems.reduce((sum, otherItem) => {
            const otherSalience = this.calculateVisualSalience(otherItem, customer.environment);
            const otherGoalMatch = this.calculateGoalMatch(otherItem, customer);
            return sum + otherSalience * (1 + this.parameters.goalMatchWeight * otherGoalMatch);
        }, 0);
        
        return totalAttention > 0 ? rawAttention / totalAttention : 0;
    }

    /**
     * 目標マッチ度を計算
     */
    calculateGoalMatch(item, customer) {
        const shoppingGoals = customer.shoppingList || [];
        const itemCategory = item.category || 'unknown';
        
        // 直接的なマッチ
        const directMatch = shoppingGoals.some(goal => 
            goal.category === itemCategory || goal.name === item.name
        ) ? 1.0 : 0.0;
        
        // カテゴリ関連性
        const categoryRelevance = this.calculateCategoryRelevance(itemCategory, shoppingGoals);
        
        // 個人の嗜好性
        const personalPreference = this.calculatePersonalPreference(item, customer);
        
        return directMatch * 0.6 + categoryRelevance * 0.3 + personalPreference * 0.1;
    }

    /**
     * カテゴリ関連性を計算
     */
    calculateCategoryRelevance(itemCategory, shoppingGoals) {
        const categoryRelations = {
            'snacks': ['sweets', 'candy', 'chocolate', 'cookies'],
            'sweets': ['snacks', 'candy', 'chocolate'],
            'chocolate': ['sweets', 'candy', 'snacks'],
            'candy': ['sweets', 'chocolate', 'snacks']
        };
        
        const relatedCategories = categoryRelations[itemCategory] || [];
        const hasRelatedGoal = shoppingGoals.some(goal => 
            relatedCategories.includes(goal.category)
        );
        
        return hasRelatedGoal ? 0.5 : 0.0;
    }

    /**
     * 個人嗜好性を計算
     */
    calculatePersonalPreference(item, customer) {
        const preferences = customer.preferences || {};
        const itemAttributes = item.attributes || {};
        
        let preferenceScore = 0;
        let attributeCount = 0;
        
        Object.keys(itemAttributes).forEach(attr => {
            if (preferences[attr] !== undefined) {
                preferenceScore += preferences[attr] * itemAttributes[attr];
                attributeCount++;
            }
        });
        
        return attributeCount > 0 ? preferenceScore / attributeCount : 0;
    }
}

/**
 * HOLD/CLOSE - 意思決定モデル
 * ドリフトディフュージョンモデルによる購買決定
 */
class DecisionModel {
    constructor() {
        this.parameters = {
            // ドリフトディフュージョン基本パラメータ
            noiseLevel: 0.1,
            baseThreshold: 1.0,
            
            // 効用計算パラメータ
            priceWeight: -0.5,
            brandWeight: 0.3,
            habitWeight: 0.4,
            socialWeight: 0.2,
            
            // 閾値調整パラメータ
            impulseEffect: -0.3,
            budgetPressureEffect: 0.4,
            timeConstraintEffect: 0.2
        };
    }

    /**
     * ドリフト率を計算
     * v = Δutility / noise
     */
    calculateDriftRate(item, customer, alternatives = []) {
        const itemUtility = this.calculateUtility(item, customer);
        const bestAlternativeUtility = alternatives.length > 0 ? 
            Math.max(...alternatives.map(alt => this.calculateUtility(alt, customer))) : 0;
        
        const utilityDifference = itemUtility - bestAlternativeUtility;
        const driftRate = utilityDifference / this.parameters.noiseLevel;
        
        return driftRate;
    }

    /**
     * 効用を計算
     * utility = u(price, brand, habit, social)
     */
    calculateUtility(item, customer) {
        const priceUtility = this.calculatePriceUtility(item, customer);
        const brandUtility = this.calculateBrandUtility(item, customer);
        const habitUtility = this.calculateHabitUtility(item, customer);
        const socialUtility = this.calculateSocialUtility(item, customer);
        
        const totalUtility = 
            this.parameters.priceWeight * priceUtility +
            this.parameters.brandWeight * brandUtility +
            this.parameters.habitWeight * habitUtility +
            this.parameters.socialWeight * socialUtility;
            
        return totalUtility;
    }

    /**
     * 価格効用を計算
     */
    calculatePriceUtility(item, customer) {
        const price = item.price || 0;
        const referencePrice = customer.referencePrice || item.referencePrice || price;
        const budget = customer.budget || 1000;
        
        // 損失回避とアンカリング効果
        const priceRatio = price / referencePrice;
        const budgetRatio = price / budget;
        
        let priceUtility = 0;
        
        if (priceRatio < 1) {
            // 割引時の効用（参照点依存効果）
            priceUtility = Math.log(2 - priceRatio);
        } else {
            // 通常価格以上の効用（損失回避）
            priceUtility = -2 * Math.log(priceRatio);
        }
        
        // 予算制約の影響
        if (budgetRatio > 0.5) {
            priceUtility *= (1 - budgetRatio) * 2;
        }
        
        return priceUtility;
    }

    /**
     * ブランド効用を計算
     */
    calculateBrandUtility(item, customer) {
        const brand = item.brand || 'unknown';
        const brandPreferences = customer.brandPreferences || {};
        const brandFamiliarity = customer.brandFamiliarity || {};
        
        const preference = brandPreferences[brand] || 0;
        const familiarity = brandFamiliarity[brand] || 0.5;
        
        // ブランド効用 = 選好度 × 親しみやすさ
        return preference * familiarity;
    }

    /**
     * 習慣効用を計算
     */
    calculateHabitUtility(item, customer) {
        const purchaseHistory = customer.purchaseHistory || [];
        const itemId = item.id || item.name;
        
        // 過去の購入頻度
        const purchaseCount = purchaseHistory.filter(p => p.id === itemId).length;
        const totalPurchases = purchaseHistory.length;
        
        const habitStrength = totalPurchases > 0 ? purchaseCount / totalPurchases : 0;
        
        // 習慣強度による効用
        return Math.log(1 + habitStrength * 10);
    }

    /**
     * 社会的効用を計算
     */
    calculateSocialUtility(item, customer) {
        const socialContext = customer.socialContext || {};
        const itemSocialValue = item.socialValue || {};
        
        let socialUtility = 0;
        
        // 同行者の影響
        if (socialContext.companions) {
            const companionPreference = socialContext.companions.reduce((sum, companion) => {
                return sum + (companion.preferences[item.category] || 0);
            }, 0) / socialContext.companions.length;
            
            socialUtility += companionPreference * 0.5;
        }
        
        // 社会的評価の影響
        if (itemSocialValue.statusSymbol) {
            socialUtility += customer.statusSensitivity * itemSocialValue.statusSymbol;
        }
        
        // 贈答用途の影響
        if (customer.giftPurpose && itemSocialValue.giftAppeal) {
            socialUtility += itemSocialValue.giftAppeal;
        }
        
        return socialUtility;
    }

    /**
     * 購入閾値を計算
     * θ = θ_0 - η · impulse + γ · budget_pressure
     */
    calculatePurchaseThreshold(customer, item) {
        const baseThreshold = this.parameters.baseThreshold;
        const impulseLevel = customer.impulseLevel || 0;
        const budgetPressure = this.calculateBudgetPressure(customer, item);
        const timeConstraint = customer.timeConstraint || 0;
        
        const threshold = baseThreshold 
            + this.parameters.impulseEffect * impulseLevel
            + this.parameters.budgetPressureEffect * budgetPressure
            + this.parameters.timeConstraintEffect * timeConstraint;
            
        return Math.max(0.1, threshold);
    }

    /**
     * 予算圧迫度を計算
     */
    calculateBudgetPressure(customer, item) {
        const remainingBudget = customer.remainingBudget || customer.budget || 1000;
        const itemPrice = item.price || 0;
        const plannedSpending = customer.plannedSpending || 0;
        
        const budgetUtilization = (plannedSpending + itemPrice) / remainingBudget;
        
        return Math.max(0, budgetUtilization - 0.7); // 70%を超えると圧迫感
    }

    /**
     * 意思決定時間を計算（ドリフトディフュージョンモデル）
     */
    calculateDecisionTime(driftRate, threshold) {
        if (Math.abs(driftRate) < 0.01) return Infinity;
        
        // 簡略化された決定時間近似
        const meanTime = threshold / Math.abs(driftRate);
        const variance = threshold / (driftRate * driftRate);
        
        // ガンマ分布からのサンプリング近似
        const shape = (meanTime * meanTime) / variance;
        const scale = variance / meanTime;
        
        return Math.max(0.1, meanTime + (Math.random() - 0.5) * scale);
    }

    /**
     * 購入確率を計算
     */
    calculatePurchaseProbability(item, customer, alternatives = []) {
        const driftRate = this.calculateDriftRate(item, customer, alternatives);
        const threshold = this.calculatePurchaseThreshold(customer, item);
        
        if (driftRate <= 0) return 0;
        
        // ドリフトディフュージョンモデルによる購入確率
        const probability = 1 / (1 + Math.exp(-2 * driftRate * threshold));
        
        return Math.max(0, Math.min(1, probability));
    }
}

/**
 * やめたくなるペナルティ - キュー迂回モデル
 */
class QueueModel {
    constructor() {
        this.parameters = {
            patienceThreshold: 10.0, // τ_s
            waitingSensitivity: 0.1,
            crowdingEffect: 0.05,
            alternativeAttractiveness: 0.3
        };
    }

    /**
     * キュー迂回確率を計算
     * p(balk) = 1 - e^(-q_wait / τ_s)
     */
    calculateBalkingProbability(queueLength, customer) {
        const personalPatience = customer.patience || this.parameters.patienceThreshold;
        const waitingTime = this.estimateWaitingTime(queueLength);
        const crowdingStress = this.calculateCrowdingStress(queueLength, customer);
        
        const adjustedWaitTime = waitingTime + crowdingStress;
        const balkingProb = 1 - Math.exp(-adjustedWaitTime / personalPatience);
        
        return Math.max(0, Math.min(1, balkingProb));
    }

    /**
     * 待ち時間を推定
     */
    estimateWaitingTime(queueLength) {
        const serviceTimePerCustomer = 2.0; // 平均サービス時間（分）
        const serviceVariability = 0.5; // サービス時間のばらつき
        
        const baseWaitTime = queueLength * serviceTimePerCustomer;
        const variabilityEffect = serviceVariability * Math.sqrt(queueLength);
        
        return baseWaitTime + variabilityEffect;
    }

    /**
     * 混雑ストレスを計算
     */
    calculateCrowdingStress(queueLength, customer) {
        const crowdingTolerance = customer.crowdingTolerance || 1.0;
        const personalSpace = customer.personalSpaceNeed || 1.0;
        
        const crowdingLevel = queueLength / 10.0; // 正規化
        const stressLevel = crowdingLevel * personalSpace / crowdingTolerance;
        
        return stressLevel * this.parameters.crowdingEffect;
    }

    /**
     * 代替案の魅力度を評価
     */
    evaluateAlternatives(customer, currentStore) {
        const alternatives = customer.knownAlternatives || [];
        
        if (alternatives.length === 0) return 0;
        
        const alternativeValues = alternatives.map(alt => {
            const travelCost = alt.distance * customer.travelCostSensitivity;
            const expectedWaitTime = alt.expectedQueueLength * 2.0;
            const productAvailability = alt.productAvailability || 0.9;
            
            return productAvailability - travelCost - expectedWaitTime * 0.1;
        });
        
        const bestAlternative = Math.max(...alternativeValues);
        const currentValue = 1.0 - (currentStore.queueLength * 0.1);
        
        return Math.max(0, bestAlternative - currentValue);
    }

    /**
     * 総合的な離脱確率
     */
    calculateOverallExitProbability(customer, currentSituation) {
        const queueBalkingProb = this.calculateBalkingProbability(
            currentSituation.queueLength, customer
        );
        
        const alternativeAttractiveness = this.evaluateAlternatives(
            customer, currentSituation
        );
        
        const timeConstraintPressure = customer.timeRemaining < 10 ? 0.3 : 0;
        
        const overallExitProb = Math.min(1.0, 
            queueBalkingProb + 
            alternativeAttractiveness * this.parameters.alternativeAttractiveness +
            timeConstraintPressure
        );
        
        return overallExitProb;
    }
}

// グローバル公開
window.CognitiveModels = CognitiveModels;
window.AttentionModel = AttentionModel;
window.DecisionModel = DecisionModel;
window.QueueModel = QueueModel;