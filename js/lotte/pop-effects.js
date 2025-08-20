/**
 * ロッテお菓子POP効果予測システム
 * 販促物の心理的効果と購買行動への影響をモデル化
 */

class POPEffectsSystem {
    constructor() {
        this.lotteProducts = new LotteProductCatalog();
        this.popTypes = new POPTypeDefinitions();
        this.effectCalculator = new POPEffectCalculator();
        this.environmentalModifiers = new EnvironmentalModifiers();
    }

    /**
     * POP効果を総合的に計算
     */
    calculatePOPEffect(product, popConfig, customer, environment) {
        // 基本POP効果
        const baseEffect = this.effectCalculator.calculateBaseEffect(
            product, popConfig, customer
        );
        
        // 環境による修正
        const environmentalEffect = this.environmentalModifiers.apply(
            baseEffect, environment, customer
        );
        
        // 客層による個別効果
        const segmentEffect = this.calculateSegmentSpecificEffect(
            environmentalEffect, customer, popConfig
        );
        
        return {
            totalEffect: segmentEffect,
            breakdown: {
                base: baseEffect,
                environmental: environmentalEffect - baseEffect,
                segment: segmentEffect - environmentalEffect
            },
            predictions: this.generatePredictions(segmentEffect, customer)
        };
    }

    /**
     * 客層別効果を計算
     */
    calculateSegmentSpecificEffect(baseEffect, customer, popConfig) {
        const segment = customer.segment;
        const segmentModifiers = this.getSegmentModifiers(segment);
        const popType = popConfig.type;
        
        const typeMultiplier = segmentModifiers[popType] || 1.0;
        const personalityEffect = this.calculatePersonalityEffect(customer, popConfig);
        
        return baseEffect * typeMultiplier * personalityEffect;
    }

    /**
     * セグメント別修正係数
     */
    getSegmentModifiers(segment) {
        const modifiers = {
            senior: {
                discount: 1.3,
                health: 1.4,
                traditional: 1.5,
                character: 0.3,
                celebrity: 0.4,
                limited: 1.1,
                premium: 1.2
            },
            family: {
                discount: 1.4,
                character: 1.3,
                familyPack: 1.5,
                educational: 1.2,
                sharing: 1.3,
                bulk: 1.4,
                celebrity: 0.7
            },
            single: {
                premium: 1.3,
                limited: 1.4,
                trend: 1.3,
                celebrity: 1.1,
                experience: 1.2,
                artisan: 1.3,
                discount: 0.8
            },
            youth: {
                character: 1.5,
                trendy: 1.4,
                social: 1.3,
                colorful: 1.4,
                gaming: 1.3,
                celebrity: 1.2,
                discount: 1.2
            }
        };
        
        return modifiers[segment] || {};
    }

    /**
     * 個人特性による効果
     */
    calculatePersonalityEffect(customer, popConfig) {
        const psycho = customer.psychographics;
        const popAttributes = popConfig.attributes || {};
        
        let effect = 1.0;
        
        // 快楽追求度の影響
        if (popAttributes.hedonic) {
            effect *= (1 + psycho.hedonic * 0.3);
        }
        
        // 品質重視度の影響
        if (popAttributes.quality) {
            effect *= (1 + psycho.qualityPursuit * 0.4);
        }
        
        // 価格感度の影響
        if (popAttributes.priceOriented) {
            effect *= (1 + psycho.price * 0.5);
        }
        
        // 安全志向の影響
        if (popAttributes.safety) {
            effect *= (1 + psycho.safety * 0.3);
        }
        
        return effect;
    }

    /**
     * 予測結果を生成
     */
    generatePredictions(effect, customer) {
        return {
            attentionProbability: Math.min(0.95, effect * 0.3),
            considerationProbability: Math.min(0.8, effect * 0.2),
            purchaseProbability: Math.min(0.6, effect * 0.15),
            expectedLiftInSales: effect * 0.1,
            confidenceInterval: [effect * 0.8, effect * 1.2]
        };
    }
}

/**
 * ロッテ商品カタログ
 */
class LotteProductCatalog {
    constructor() {
        this.products = {
            // チョコレート系
            ghana_chocolate: {
                name: 'ガーナチョコレート',
                category: 'chocolate',
                subcategory: 'milk_chocolate',
                price: 150,
                attributes: {
                    premium: 0.6,
                    familiar: 0.9,
                    gifting: 0.7,
                    seasonal: 0.5
                },
                targetSegments: ['senior', 'family', 'single'],
                emotionalAppeals: ['nostalgia', 'indulgence', 'warmth']
            },
            
            toppo: {
                name: 'トッポ',
                category: 'chocolate',
                subcategory: 'stick_chocolate',
                price: 120,
                attributes: {
                    convenient: 0.8,
                    shareable: 0.7,
                    playful: 0.6,
                    portable: 0.9
                },
                targetSegments: ['youth', 'single', 'family'],
                emotionalAppeals: ['fun', 'convenience', 'social']
            },
            
            koala_march: {
                name: 'コアラのマーチ',
                category: 'cookies',
                subcategory: 'chocolate_cookies',
                price: 100,
                attributes: {
                    character: 0.9,
                    cute: 0.9,
                    kidfriendly: 0.9,
                    collectible: 0.6
                },
                targetSegments: ['youth', 'family'],
                emotionalAppeals: ['cuteness', 'playfulness', 'childhood']
            },
            
            pie_no_mi: {
                name: 'パイの実',
                category: 'cookies',
                subcategory: 'pie_cookies',
                price: 130,
                attributes: {
                    texture: 0.8,
                    premium: 0.6,
                    sophisticated: 0.7,
                    indulgent: 0.7
                },
                targetSegments: ['single', 'family', 'senior'],
                emotionalAppeals: ['sophistication', 'indulgence', 'quality']
            },
            
            pucca: {
                name: 'プッカ',
                category: 'cookies',
                subcategory: 'pretzel_chocolate',
                price: 110,
                attributes: {
                    salty_sweet: 0.8,
                    crunchy: 0.8,
                    satisfying: 0.7,
                    balanced: 0.7
                },
                targetSegments: ['youth', 'single'],
                emotionalAppeals: ['satisfaction', 'balance', 'craving']
            },
            
            xylitol_gum: {
                name: 'キシリトールガム',
                category: 'gum',
                subcategory: 'functional_gum',
                price: 140,
                attributes: {
                    health: 0.9,
                    functional: 0.9,
                    dental: 0.9,
                    longLasting: 0.8
                },
                targetSegments: ['senior', 'family', 'single'],
                emotionalAppeals: ['health', 'care', 'responsibility']
            },
            
            choco_pie: {
                name: 'チョコパイ',
                category: 'cakes',
                subcategory: 'chocolate_cake',
                price: 160,
                attributes: {
                    indulgent: 0.8,
                    satisfying: 0.9,
                    comforting: 0.8,
                    filling: 0.8
                },
                targetSegments: ['family', 'single', 'youth'],
                emotionalAppeals: ['comfort', 'satisfaction', 'indulgence']
            }
        };
    }

    getProduct(productId) {
        return this.products[productId];
    }

    getProductsByCategory(category) {
        return Object.entries(this.products)
            .filter(([id, product]) => product.category === category)
            .map(([id, product]) => ({ id, ...product }));
    }

    getProductsBySegment(segment) {
        return Object.entries(this.products)
            .filter(([id, product]) => product.targetSegments.includes(segment))
            .map(([id, product]) => ({ id, ...product }));
    }
}

/**
 * POP種類定義
 */
class POPTypeDefinitions {
    constructor() {
        this.types = {
            // 価格・プロモーション系
            discount: {
                name: '割引POP',
                description: '特価・セール表示',
                psychologicalMechanisms: ['loss_aversion', 'scarcity', 'anchoring'],
                visualElements: ['red_color', 'percentage', 'strikethrough'],
                effectivePositions: ['eye_level', 'endcap', 'register'],
                baseAttention: 0.8,
                universalAppeal: 0.9
            },
            
            limited: {
                name: '限定商品POP',
                description: '期間・数量限定表示',
                psychologicalMechanisms: ['scarcity', 'fomo', 'exclusivity'],
                visualElements: ['special_frame', 'countdown', 'limited_text'],
                effectivePositions: ['eye_level', 'endcap'],
                baseAttention: 0.7,
                universalAppeal: 0.7
            },
            
            // キャラクター・エンターテイメント系
            character: {
                name: 'キャラクターPOP',
                description: 'アニメ・キャラクター訴求',
                psychologicalMechanisms: ['parasocial_relationship', 'nostalgia', 'identification'],
                visualElements: ['character_image', 'bright_colors', 'playful_design'],
                effectivePositions: ['child_eye_level', 'endcap'],
                baseAttention: 0.6,
                segmentVariance: 0.8
            },
            
            celebrity: {
                name: '著名人POP',
                description: 'タレント・インフルエンサー起用',
                psychologicalMechanisms: ['social_proof', 'halo_effect', 'aspiration'],
                visualElements: ['celebrity_photo', 'endorsement', 'lifestyle'],
                effectivePositions: ['eye_level', 'register'],
                baseAttention: 0.5,
                segmentVariance: 0.7
            },
            
            // 健康・機能性系
            health: {
                name: '健康訴求POP',
                description: '栄養・機能性表示',
                psychologicalMechanisms: ['health_consciousness', 'rational_appeal', 'guilt_reduction'],
                visualElements: ['health_icons', 'nutritional_info', 'clinical_design'],
                effectivePositions: ['eye_level', 'shelf'],
                baseAttention: 0.4,
                segmentVariance: 0.9
            },
            
            functional: {
                name: '機能性POP',
                description: '特定機能・効果訴求（カフェイン、リラックス等）',
                psychologicalMechanisms: ['problem_solution', 'rational_appeal', 'self_care'],
                visualElements: ['function_icons', 'before_after', 'scientific_backing'],
                effectivePositions: ['eye_level', 'register'],
                baseAttention: 0.5,
                segmentVariance: 0.6
            },
            
            // 体験・感情系
            premium: {
                name: 'プレミアムPOP',
                description: '高級感・特別感訴求',
                psychologicalMechanisms: ['status_signaling', 'quality_heuristic', 'self_reward'],
                visualElements: ['elegant_design', 'gold_accents', 'premium_materials'],
                effectivePositions: ['eye_level', 'special_display'],
                baseAttention: 0.6,
                segmentVariance: 0.8
            },
            
            seasonal: {
                name: '季節POP',
                description: '季節・イベント訴求',
                psychologicalMechanisms: ['temporal_relevance', 'social_norms', 'tradition'],
                visualElements: ['seasonal_colors', 'event_symbols', 'time_sensitive'],
                effectivePositions: ['endcap', 'entrance'],
                baseAttention: 0.5,
                temporalVariance: 0.9
            },
            
            // 社会・共有系
            sharing: {
                name: 'シェア訴求POP',
                description: '分け合い・みんなで楽しむ訴求',
                psychologicalMechanisms: ['social_connection', 'reciprocity', 'group_identity'],
                visualElements: ['group_imagery', 'sharing_scenes', 'family_photos'],
                effectivePositions: ['eye_level', 'family_section'],
                baseAttention: 0.4,
                contextVariance: 0.7
            },
            
            gift: {
                name: 'ギフトPOP',
                description: '贈り物・手土産訴求',
                psychologicalMechanisms: ['social_reciprocity', 'relationship_building', 'occasion_matching'],
                visualElements: ['gift_wrapping', 'occasion_scenes', 'elegant_presentation'],
                effectivePositions: ['entrance', 'register'],
                baseAttention: 0.5,
                contextVariance: 0.8
            }
        };
    }

    getPOPType(typeId) {
        return this.types[typeId];
    }

    getEffectivePOPsForSegment(segment) {
        const preferences = {
            senior: ['discount', 'health', 'traditional', 'premium'],
            family: ['discount', 'character', 'sharing', 'bulk', 'educational'],
            single: ['premium', 'limited', 'celebrity', 'functional'],
            youth: ['character', 'trendy', 'social', 'limited', 'celebrity']
        };
        
        return preferences[segment] || [];
    }

    getEffectivePOPsForProduct(product) {
        const categoryMappings = {
            chocolate: ['premium', 'seasonal', 'gift', 'indulgent'],
            cookies: ['character', 'sharing', 'family', 'playful'],
            gum: ['health', 'functional', 'convenient', 'dental'],
            candy: ['character', 'colorful', 'sweet', 'fun']
        };
        
        return categoryMappings[product.category] || [];
    }
}

/**
 * POP効果計算エンジン
 */
class POPEffectCalculator {
    constructor() {
        this.baselineAttention = 0.3;
        this.maxAttentionBoost = 2.5;
        this.decayFactors = {
            novelty: 0.05,  // 新鮮さの減衰
            frequency: 0.02, // 頻度による慣れ
            competition: 0.1 // 競合POPによる阻害
        };
    }

    /**
     * 基本POP効果を計算
     */
    calculateBaseEffect(product, popConfig, customer) {
        const popType = popConfig.type;
        const popDefinition = new POPTypeDefinitions().getPOPType(popType);
        
        if (!popDefinition) return this.baselineAttention;
        
        // 基本注目度
        let attention = popDefinition.baseAttention;
        
        // 視覚的要素による強化
        attention *= this.calculateVisualImpact(popConfig);
        
        // 位置による効果
        attention *= this.calculatePositionEffect(popConfig.position, customer);
        
        // 商品との適合性
        attention *= this.calculateProductMatch(product, popDefinition);
        
        // 心理的メカニズムの効果
        attention *= this.calculatePsychologicalEffect(popDefinition, customer);
        
        // 減衰要因の適用
        attention *= this.applyDecayFactors(popConfig, customer);
        
        return Math.min(attention, this.maxAttentionBoost);
    }

    /**
     * 視覚的インパクトを計算
     */
    calculateVisualImpact(popConfig) {
        let impact = 1.0;
        
        // サイズ効果
        const size = popConfig.size || 1.0;
        impact *= Math.pow(size, 0.3);
        
        // 色彩効果
        const colorIntensity = popConfig.colorIntensity || 0.5;
        impact *= (1 + colorIntensity * 0.4);
        
        // 動きの効果（デジタルサイネージ等）
        if (popConfig.animated) {
            impact *= 1.3;
        }
        
        // 立体効果
        if (popConfig.threedimensional) {
            impact *= 1.2;
        }
        
        return impact;
    }

    /**
     * 位置効果を計算
     */
    calculatePositionEffect(position, customer) {
        const positionEffects = {
            eye_level: 1.0,
            above_eye: 0.8,
            below_eye: 0.7,
            endcap: 1.2,
            register: 1.1,
            entrance: 0.9,
            aisle_end: 1.1,
            shelf_edge: 0.9
        };
        
        let effect = positionEffects[position] || 0.8;
        
        // 個人の身長による調整
        if (customer.segment === 'senior') {
            // シニアは少し低い位置が見やすい
            if (position === 'below_eye') effect *= 1.2;
            if (position === 'above_eye') effect *= 0.7;
        }
        
        if (customer.segment === 'youth') {
            // 若者は高い位置も比較的見やすい
            if (position === 'above_eye') effect *= 1.1;
        }
        
        return effect;
    }

    /**
     * 商品適合性を計算
     */
    calculateProductMatch(product, popDefinition) {
        const productAttributes = product.attributes || {};
        const popMechanisms = popDefinition.psychologicalMechanisms || [];
        
        let match = 0.5; // ベースライン
        
        // 商品属性とPOPメカニズムのマッチング
        popMechanisms.forEach(mechanism => {
            switch (mechanism) {
                case 'scarcity':
                    if (productAttributes.limited || productAttributes.seasonal) match += 0.3;
                    break;
                case 'quality_heuristic':
                    if (productAttributes.premium || productAttributes.sophisticated) match += 0.3;
                    break;
                case 'health_consciousness':
                    if (productAttributes.health || productAttributes.functional) match += 0.4;
                    break;
                case 'social_proof':
                    if (productAttributes.popular || productAttributes.trending) match += 0.2;
                    break;
                case 'nostalgia':
                    if (productAttributes.traditional || productAttributes.familiar) match += 0.3;
                    break;
            }
        });
        
        return Math.min(match, 2.0);
    }

    /**
     * 心理的効果を計算
     */
    calculatePsychologicalEffect(popDefinition, customer) {
        const mechanisms = popDefinition.psychologicalMechanisms || [];
        const customerPsycho = customer.psychographics || {};
        
        let totalEffect = 1.0;
        
        mechanisms.forEach(mechanism => {
            let mechanismEffect = 1.0;
            
            switch (mechanism) {
                case 'loss_aversion':
                    // 損失回避：価格感度の高い人により効果的
                    mechanismEffect = 1 + (customerPsycho.price || 0.5) * 0.5;
                    break;
                case 'scarcity':
                    // 希少性：衝動性の高い人により効果的
                    mechanismEffect = 1 + (customer.impulseLevel || 0.5) * 0.4;
                    break;
                case 'social_proof':
                    // 社会的証明：ステータス感度の高い人により効果的
                    mechanismEffect = 1 + (customer.behavioral?.statusSensitivity || 0.5) * 0.3;
                    break;
                case 'health_consciousness':
                    // 健康意識：安全志向の人により効果的
                    mechanismEffect = 1 + (customerPsycho.safety || 0.5) * 0.6;
                    break;
                case 'quality_heuristic':
                    // 品質ヒューリスティック：品質追求の人により効果的
                    mechanismEffect = 1 + (customerPsycho.qualityPursuit || 0.5) * 0.4;
                    break;
            }
            
            totalEffect *= mechanismEffect;
        });
        
        return totalEffect;
    }

    /**
     * 減衰要因を適用
     */
    applyDecayFactors(popConfig, customer) {
        let decay = 1.0;
        
        // 新鮮さの減衰
        const daysSinceDeployment = popConfig.daysSinceDeployment || 0;
        decay *= Math.exp(-this.decayFactors.novelty * daysSinceDeployment);
        
        // 頻度による慣れ
        const exposureCount = customer.popExposureHistory?.[popConfig.type] || 0;
        decay *= Math.exp(-this.decayFactors.frequency * exposureCount);
        
        // 競合POPによる阻害
        const competingPOPCount = popConfig.competingPOPCount || 0;
        decay *= Math.exp(-this.decayFactors.competition * competingPOPCount);
        
        return Math.max(decay, 0.1); // 最低10%の効果は保持
    }
}

/**
 * 環境修正要因
 */
class EnvironmentalModifiers {
    constructor() {
        this.weatherEffects = {
            sunny: { chocolate: 0.8, ice: 1.3, cold_drinks: 1.2 },
            rainy: { chocolate: 1.2, warm_drinks: 1.3, comfort_food: 1.2 },
            cloudy: { neutral: 1.0 },
            hot: { chocolate: 0.7, ice: 1.4, cold_drinks: 1.3 },
            cold: { chocolate: 1.3, warm_drinks: 1.4, comfort_food: 1.3 }
        };
        
        this.timeEffects = {
            morning: { functional: 1.2, energy: 1.3, convenient: 1.2 },
            afternoon: { indulgent: 1.1, social: 1.1 },
            evening: { comfort: 1.2, premium: 1.1, gift: 1.2 },
            night: { indulgent: 1.3, comfort: 1.3 }
        };
        
        this.seasonalEffects = {
            spring: { fresh: 1.2, light: 1.1, seasonal: 1.3 },
            summer: { cold: 1.3, refreshing: 1.2, ice: 1.4 },
            autumn: { traditional: 1.2, warm: 1.1, seasonal: 1.3 },
            winter: { warm: 1.3, comfort: 1.3, premium: 1.2, gift: 1.4 }
        };
    }

    apply(baseEffect, environment, customer) {
        let modifiedEffect = baseEffect;
        
        // 天気による修正
        if (environment.weather && this.weatherEffects[environment.weather]) {
            const weatherMod = this.getRelevantModifier(
                this.weatherEffects[environment.weather], customer
            );
            modifiedEffect *= weatherMod;
        }
        
        // 時間帯による修正
        if (environment.timeOfDay && this.timeEffects[environment.timeOfDay]) {
            const timeMod = this.getRelevantModifier(
                this.timeEffects[environment.timeOfDay], customer
            );
            modifiedEffect *= timeMod;
        }
        
        // 季節による修正
        if (environment.season && this.seasonalEffects[environment.season]) {
            const seasonMod = this.getRelevantModifier(
                this.seasonalEffects[environment.season], customer
            );
            modifiedEffect *= seasonMod;
        }
        
        // 混雑度による修正
        const crowdingEffect = this.calculateCrowdingEffect(environment.crowding, customer);
        modifiedEffect *= crowdingEffect;
        
        return modifiedEffect;
    }

    getRelevantModifier(modifiers, customer) {
        // 顧客の嗜好に最も関連する修正要因を選択
        let maxModifier = 1.0;
        
        Object.entries(modifiers).forEach(([key, value]) => {
            if (customer.snackPreferences && customer.snackPreferences[key]) {
                const relevance = customer.snackPreferences[key];
                const weightedModifier = 1 + (value - 1) * relevance;
                maxModifier = Math.max(maxModifier, weightedModifier);
            }
        });
        
        return maxModifier;
    }

    calculateCrowdingEffect(crowdingLevel, customer) {
        const tolerance = customer.behavioral?.crowdingTolerance || 0.7;
        const crowdingStress = Math.max(0, crowdingLevel - tolerance);
        
        // 混雑によるストレスがPOP効果を減衰
        return Math.exp(-crowdingStress * 0.5);
    }
}

// グローバル公開
window.POPEffectsSystem = POPEffectsSystem;
window.LotteProductCatalog = LotteProductCatalog;
window.POPTypeDefinitions = POPTypeDefinitions;
window.POPEffectCalculator = POPEffectCalculator;
window.EnvironmentalModifiers = EnvironmentalModifiers;