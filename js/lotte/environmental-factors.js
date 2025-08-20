/**
 * 環境要因システム
 * 天気・季節・時間帯・社会的文脈が購買行動に与える影響をモデル化
 */

class EnvironmentalFactorsSystem {
    constructor() {
        this.weatherSystem = new WeatherImpactSystem();
        this.temporalSystem = new TemporalFactorsSystem();
        this.socialContext = new SocialContextSystem();
        this.storeEnvironment = new StoreEnvironmentSystem();
        
        // 現在の環境状態
        this.currentEnvironment = {
            weather: 'sunny',
            temperature: 20,
            season: this.getCurrentSeason(),
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: this.getDayOfWeek(),
            crowdingLevel: 0.5,
            promotionalContext: {}
        };
    }

    /**
     * 環境要因を統合して総合効果を計算
     */
    calculateEnvironmentalImpact(customer, product, popConfig) {
        const weatherImpact = this.weatherSystem.calculateImpact(
            this.currentEnvironment, customer, product
        );
        
        const temporalImpact = this.temporalSystem.calculateImpact(
            this.currentEnvironment, customer, product
        );
        
        const socialImpact = this.socialContext.calculateImpact(
            this.currentEnvironment, customer, product
        );
        
        const storeImpact = this.storeEnvironment.calculateImpact(
            this.currentEnvironment, customer, product, popConfig
        );
        
        return {
            overall: this.combineImpacts([weatherImpact, temporalImpact, socialImpact, storeImpact]),
            breakdown: {
                weather: weatherImpact,
                temporal: temporalImpact,
                social: socialImpact,
                store: storeImpact
            }
        };
    }

    /**
     * 複数の影響を統合
     */
    combineImpacts(impacts) {
        // 乗算的統合（相互作用を考慮）
        let combined = 1.0;
        impacts.forEach(impact => {
            combined *= impact.multiplier;
        });
        
        // 加算的要素も考慮
        const additiveBonus = impacts.reduce((sum, impact) => 
            sum + (impact.additiveBonus || 0), 0
        );
        
        return {
            multiplier: Math.max(0.1, Math.min(5.0, combined)),
            additiveBonus: Math.max(-0.5, Math.min(1.0, additiveBonus)),
            confidence: this.calculateConfidence(impacts)
        };
    }

    calculateConfidence(impacts) {
        const confidences = impacts.map(i => i.confidence || 0.8);
        return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    }

    /**
     * 環境状態を更新
     */
    updateEnvironment(newState) {
        this.currentEnvironment = { ...this.currentEnvironment, ...newState };
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 15) return 'afternoon';
        if (hour >= 15 && hour < 19) return 'evening';
        return 'night';
    }

    getDayOfWeek() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    }
}

/**
 * 天気影響システム
 */
class WeatherImpactSystem {
    constructor() {
        // 天気とお菓子カテゴリの相関データ
        this.weatherCorrelations = {
            sunny: {
                ice_products: 1.4,
                cold_drinks: 1.3,
                light_snacks: 1.2,
                chocolate: 0.8,
                warm_drinks: 0.7,
                comfort_food: 0.8
            },
            rainy: {
                chocolate: 1.3,
                comfort_food: 1.4,
                warm_drinks: 1.3,
                hot_snacks: 1.2,
                ice_products: 0.7,
                cold_drinks: 0.8
            },
            cloudy: {
                neutral_multiplier: 1.0
            },
            snowy: {
                chocolate: 1.4,
                comfort_food: 1.5,
                warm_drinks: 1.4,
                seasonal_treats: 1.3,
                ice_products: 0.5
            }
        };

        // 温度の影響
        this.temperatureEffects = {
            chocolate: { optimal: 15, sensitivity: -0.03 }, // 低温で好まれる
            ice_cream: { optimal: 25, sensitivity: 0.04 },  // 高温で好まれる
            hot_drinks: { optimal: 5, sensitivity: -0.02 }, // 低温で好まれる
            candy: { optimal: 20, sensitivity: 0.01 }       // 温度影響小
        };

        // 湿度の影響
        this.humidityEffects = {
            crispy_snacks: -0.02, // 湿度が高いとクリスピー系が不人気
            chocolate: -0.01,     // チョコレートも湿度で若干影響
            gum: 0.01            // ガムは湿度で若干人気
        };
    }

    calculateImpact(environment, customer, product) {
        const weather = environment.weather;
        const temperature = environment.temperature || 20;
        const humidity = environment.humidity || 60;

        let impact = 1.0;
        let confidence = 0.8;
        
        // 天気による基本影響
        const weatherEffect = this.calculateWeatherEffect(weather, product);
        impact *= weatherEffect;
        
        // 温度による影響
        const tempEffect = this.calculateTemperatureEffect(temperature, product);
        impact *= tempEffect;
        
        // 湿度による影響
        const humidityEffect = this.calculateHumidityEffect(humidity, product);
        impact *= humidityEffect;
        
        // 個人の天気感度
        const personalSensitivity = this.calculatePersonalWeatherSensitivity(customer);
        impact = 1 + (impact - 1) * personalSensitivity;

        return {
            multiplier: impact,
            confidence: confidence,
            factors: {
                weather: weatherEffect,
                temperature: tempEffect,
                humidity: humidityEffect,
                personalSensitivity: personalSensitivity
            }
        };
    }

    calculateWeatherEffect(weather, product) {
        const correlations = this.weatherCorrelations[weather];
        if (!correlations) return 1.0;

        const productCategory = this.getProductWeatherCategory(product);
        return correlations[productCategory] || correlations.neutral_multiplier || 1.0;
    }

    calculateTemperatureEffect(temperature, product) {
        const productCategory = this.getProductTemperatureCategory(product);
        const tempData = this.temperatureEffects[productCategory];
        
        if (!tempData) return 1.0;
        
        const deviation = temperature - tempData.optimal;
        const effect = 1 + (deviation * tempData.sensitivity);
        
        return Math.max(0.5, Math.min(2.0, effect));
    }

    calculateHumidityEffect(humidity, product) {
        const productCategory = this.getProductHumidityCategory(product);
        const sensitivity = this.humidityEffects[productCategory];
        
        if (!sensitivity) return 1.0;
        
        const normalizedHumidity = (humidity - 50) / 50; // -1 to 1
        return Math.max(0.8, Math.min(1.2, 1 + normalizedHumidity * sensitivity));
    }

    calculatePersonalWeatherSensitivity(customer) {
        // 年齢による天気感度の違い
        const age = customer.age || 30;
        let sensitivity = 1.0;
        
        if (age > 60) {
            sensitivity *= 1.2; // シニアは天気により敏感
        } else if (age < 25) {
            sensitivity *= 0.8; // 若者は天気に鈍感
        }
        
        // セグメント別の感度
        const segmentSensitivity = {
            senior: 1.2,
            family: 1.0,
            single: 0.9,
            youth: 0.7
        };
        
        sensitivity *= segmentSensitivity[customer.segment] || 1.0;
        
        return sensitivity;
    }

    getProductWeatherCategory(product) {
        const categoryMapping = {
            'chocolate': 'chocolate',
            'ice_cream': 'ice_products',
            'hot_drinks': 'warm_drinks',
            'cold_drinks': 'cold_drinks',
            'comfort_snacks': 'comfort_food',
            'light_snacks': 'light_snacks'
        };
        
        return categoryMapping[product.category] || 'neutral';
    }

    getProductTemperatureCategory(product) {
        if (product.attributes?.cold || product.category === 'ice_cream') return 'ice_cream';
        if (product.attributes?.warm || product.category === 'hot_drinks') return 'hot_drinks';
        if (product.category === 'chocolate') return 'chocolate';
        return 'candy';
    }

    getProductHumidityCategory(product) {
        if (product.attributes?.crispy || product.subcategory === 'cookies') return 'crispy_snacks';
        if (product.category === 'chocolate') return 'chocolate';
        if (product.category === 'gum') return 'gum';
        return null;
    }
}

/**
 * 時間的要因システム
 */
class TemporalFactorsSystem {
    constructor() {
        // 時間帯別消費パターン
        this.timeOfDayPatterns = {
            morning: {
                functional: 1.3,    // 機能性（エナジー、ビタミン等）
                convenient: 1.2,    // 手軽さ
                caffeinated: 1.4,   // カフェイン含有
                light: 1.2,         // 軽いスナック
                heavy: 0.7          // 重いスナック
            },
            afternoon: {
                social: 1.2,        // 職場でのシェア
                premium: 1.1,       // プレミアム商品
                indulgent: 1.1,     // 贅沢品
                functional: 0.9
            },
            evening: {
                comfort: 1.3,       // コンフォートフード
                family: 1.2,        // ファミリー向け
                sharing: 1.3,       // 分け合い
                gift: 1.2,          // 手土産
                premium: 1.1
            },
            night: {
                indulgent: 1.4,     // 贅沢・ご褒美
                comfort: 1.3,       // コンフォート
                guilty_pleasure: 1.5, // 罪悪感のある楽しみ
                functional: 0.7,
                light: 0.8
            }
        };

        // 曜日パターン
        this.dayOfWeekPatterns = {
            monday: {
                energy_boost: 1.3,  // 週始めのエネルギー補給
                comfort: 1.2,       // 月曜の憂鬱対策
                functional: 1.2
            },
            tuesday: { neutral: 1.0 },
            wednesday: {
                midweek_treat: 1.1, // 週中のご褒美
                energy_boost: 1.1
            },
            thursday: { neutral: 1.0 },
            friday: {
                celebration: 1.2,   // 週末前の祝い
                social: 1.2,        // 職場での共有
                premium: 1.1
            },
            saturday: {
                family: 1.3,        // 家族時間
                leisure: 1.2,       // 余暇
                indulgent: 1.2,
                bulk: 1.2           // まとめ買い
            },
            sunday: {
                comfort: 1.2,       // 日曜の安らぎ
                traditional: 1.1,   // 伝統的
                family: 1.2,
                preparation: 1.1    // 週の準備
            }
        };

        // 季節パターン
        this.seasonalPatterns = {
            spring: {
                fresh: 1.3,
                light: 1.2,
                seasonal_limited: 1.4,
                renewal: 1.2,
                healthy: 1.1
            },
            summer: {
                cold: 1.5,
                refreshing: 1.3,
                light: 1.2,
                ice: 1.6,
                tropical: 1.3,
                hydrating: 1.2
            },
            autumn: {
                warm: 1.3,
                traditional: 1.2,
                seasonal_limited: 1.5,
                harvest: 1.3,
                comfort: 1.2
            },
            winter: {
                warm: 1.4,
                comfort: 1.4,
                indulgent: 1.3,
                seasonal_limited: 1.6,
                gift: 1.5,
                premium: 1.2
            }
        };
    }

    calculateImpact(environment, customer, product) {
        let impact = 1.0;
        
        // 時間帯の影響
        const timeEffect = this.calculateTimeOfDayEffect(
            environment.timeOfDay, product, customer
        );
        impact *= timeEffect;
        
        // 曜日の影響
        const dayEffect = this.calculateDayOfWeekEffect(
            environment.dayOfWeek, product, customer
        );
        impact *= dayEffect;
        
        // 季節の影響
        const seasonEffect = this.calculateSeasonalEffect(
            environment.season, product, customer
        );
        impact *= seasonEffect;
        
        // 特別な日・イベントの影響
        const eventEffect = this.calculateEventEffect(
            environment, product, customer
        );
        impact *= eventEffect;

        return {
            multiplier: impact,
            confidence: 0.85,
            factors: {
                timeOfDay: timeEffect,
                dayOfWeek: dayEffect,
                seasonal: seasonEffect,
                events: eventEffect
            }
        };
    }

    calculateTimeOfDayEffect(timeOfDay, product, customer) {
        const patterns = this.timeOfDayPatterns[timeOfDay];
        if (!patterns) return 1.0;

        const productCharacteristics = this.getProductTimeCharacteristics(product);
        let effect = 1.0;

        productCharacteristics.forEach(char => {
            if (patterns[char]) {
                effect *= patterns[char];
            }
        });

        // 個人の時間パターンによる調整
        const personalTimePattern = this.getPersonalTimePattern(customer, timeOfDay);
        effect = 1 + (effect - 1) * personalTimePattern;

        return effect;
    }

    calculateDayOfWeekEffect(dayOfWeek, product, customer) {
        const patterns = this.dayOfWeekPatterns[dayOfWeek];
        if (!patterns || patterns.neutral) return 1.0;

        const productCharacteristics = this.getProductDayCharacteristics(product);
        let effect = 1.0;

        productCharacteristics.forEach(char => {
            if (patterns[char]) {
                effect *= patterns[char];
            }
        });

        return effect;
    }

    calculateSeasonalEffect(season, product, customer) {
        const patterns = this.seasonalPatterns[season];
        if (!patterns) return 1.0;

        const productCharacteristics = this.getProductSeasonalCharacteristics(product);
        let effect = 1.0;

        productCharacteristics.forEach(char => {
            if (patterns[char]) {
                effect *= patterns[char];
            }
        });

        // 季節感度による個人差
        const seasonalSensitivity = customer.seasonalSensitivity || 1.0;
        effect = 1 + (effect - 1) * seasonalSensitivity;

        return effect;
    }

    calculateEventEffect(environment, product, customer) {
        const events = environment.specialEvents || [];
        let effect = 1.0;

        events.forEach(event => {
            const eventMultiplier = this.getEventMultiplier(event, product);
            effect *= eventMultiplier;
        });

        return effect;
    }

    getEventMultiplier(event, product) {
        const eventEffects = {
            'valentines': { chocolate: 2.0, gift: 1.8, romantic: 1.5 },
            'mothers_day': { gift: 1.6, premium: 1.3, traditional: 1.2 },
            'christmas': { seasonal: 2.0, gift: 1.8, premium: 1.4 },
            'halloween': { candy: 1.8, character: 1.5, colorful: 1.3 },
            'golden_week': { family: 1.3, leisure: 1.2, travel: 1.4 }
        };

        const effects = eventEffects[event.type];
        if (!effects) return 1.0;

        const productEventChars = this.getProductEventCharacteristics(product);
        let multiplier = 1.0;

        productEventChars.forEach(char => {
            if (effects[char]) {
                multiplier *= effects[char];
            }
        });

        return multiplier;
    }

    getProductTimeCharacteristics(product) {
        const chars = [];
        
        if (product.attributes?.functional) chars.push('functional');
        if (product.attributes?.convenient) chars.push('convenient');
        if (product.attributes?.caffeinated) chars.push('caffeinated');
        if (product.attributes?.light) chars.push('light');
        if (product.attributes?.heavy) chars.push('heavy');
        if (product.attributes?.social) chars.push('social');
        if (product.attributes?.premium) chars.push('premium');
        if (product.attributes?.indulgent) chars.push('indulgent');
        if (product.attributes?.comfort) chars.push('comfort');
        if (product.attributes?.family) chars.push('family');
        if (product.attributes?.sharing) chars.push('sharing');
        if (product.attributes?.gift) chars.push('gift');
        
        return chars;
    }

    getProductDayCharacteristics(product) {
        const chars = [];
        
        if (product.emotionalAppeals?.includes('energy')) chars.push('energy_boost');
        if (product.emotionalAppeals?.includes('comfort')) chars.push('comfort');
        if (product.attributes?.functional) chars.push('functional');
        if (product.emotionalAppeals?.includes('celebration')) chars.push('celebration');
        if (product.attributes?.social) chars.push('social');
        if (product.attributes?.premium) chars.push('premium');
        if (product.attributes?.family) chars.push('family');
        if (product.attributes?.indulgent) chars.push('indulgent');
        
        return chars;
    }

    getProductSeasonalCharacteristics(product) {
        const chars = [];
        
        if (product.attributes?.fresh) chars.push('fresh');
        if (product.attributes?.light) chars.push('light');
        if (product.attributes?.seasonal) chars.push('seasonal_limited');
        if (product.attributes?.cold) chars.push('cold');
        if (product.attributes?.refreshing) chars.push('refreshing');
        if (product.attributes?.warm) chars.push('warm');
        if (product.attributes?.traditional) chars.push('traditional');
        if (product.attributes?.indulgent) chars.push('indulgent');
        if (product.attributes?.gift) chars.push('gift');
        if (product.attributes?.premium) chars.push('premium');
        
        return chars;
    }

    getProductEventCharacteristics(product) {
        const chars = [];
        
        if (product.category === 'chocolate') chars.push('chocolate');
        if (product.attributes?.gift) chars.push('gift');
        if (product.attributes?.romantic) chars.push('romantic');
        if (product.attributes?.premium) chars.push('premium');
        if (product.attributes?.traditional) chars.push('traditional');
        if (product.category === 'candy') chars.push('candy');
        if (product.attributes?.character) chars.push('character');
        if (product.attributes?.colorful) chars.push('colorful');
        if (product.attributes?.family) chars.push('family');
        
        return chars;
    }

    getPersonalTimePattern(customer, timeOfDay) {
        // 個人のライフスタイルパターン
        const lifestyle = customer.lifestyle || 'regular';
        
        const patterns = {
            'early_bird': {
                morning: 1.2,
                afternoon: 1.0,
                evening: 0.9,
                night: 0.7
            },
            'night_owl': {
                morning: 0.7,
                afternoon: 1.0,
                evening: 1.1,
                night: 1.3
            },
            'regular': {
                morning: 1.0,
                afternoon: 1.0,
                evening: 1.0,
                night: 1.0
            }
        };

        return patterns[lifestyle]?.[timeOfDay] || 1.0;
    }
}

/**
 * 社会的文脈システム
 */
class SocialContextSystem {
    calculateImpact(environment, customer, product) {
        let impact = 1.0;
        
        // 同行者の影響
        const companionEffect = this.calculateCompanionEffect(customer, product);
        impact *= companionEffect;
        
        // 社会的状況の影響
        const socialSituationEffect = this.calculateSocialSituationEffect(environment, customer, product);
        impact *= socialSituationEffect;
        
        // 文化的文脈の影響
        const culturalEffect = this.calculateCulturalEffect(environment, product);
        impact *= culturalEffect;

        return {
            multiplier: impact,
            confidence: 0.7,
            factors: {
                companions: companionEffect,
                socialSituation: socialSituationEffect,
                cultural: culturalEffect
            }
        };
    }

    calculateCompanionEffect(customer, product) {
        const companions = customer.companions || [];
        if (companions.length === 0) return 1.0;

        let effect = 1.0;
        
        companions.forEach(companion => {
            // 同行者の嗜好の影響
            const companionPreference = this.getCompanionPreference(companion, product);
            effect *= companionPreference;
            
            // 同行者タイプによる影響
            const companionTypeEffect = this.getCompanionTypeEffect(companion, product);
            effect *= companionTypeEffect;
        });

        return effect;
    }

    getCompanionPreference(companion, product) {
        const preferences = companion.preferences || {};
        const productCategory = product.category;
        
        return preferences[productCategory] || 1.0;
    }

    getCompanionTypeEffect(companion, product) {
        const companionType = companion.type;
        const productAttributes = product.attributes || {};
        
        const typeEffects = {
            'child': {
                character: 1.5,
                colorful: 1.3,
                sweet: 1.4,
                playful: 1.3
            },
            'partner': {
                sharing: 1.2,
                premium: 1.1,
                romantic: 1.3
            },
            'friend': {
                social: 1.3,
                trendy: 1.2,
                sharing: 1.2
            },
            'elderly': {
                traditional: 1.3,
                gentle: 1.2,
                familiar: 1.2
            }
        };

        const effects = typeEffects[companionType] || {};
        let multiplier = 1.0;

        Object.entries(effects).forEach(([attr, mult]) => {
            if (productAttributes[attr]) {
                multiplier *= mult;
            }
        });

        return multiplier;
    }

    calculateSocialSituationEffect(environment, customer, product) {
        const situation = environment.socialSituation || 'normal_shopping';
        
        const situationEffects = {
            'gift_shopping': {
                gift: 1.5,
                premium: 1.3,
                packaging: 1.2
            },
            'party_preparation': {
                sharing: 1.4,
                bulk: 1.3,
                colorful: 1.2
            },
            'business_purchase': {
                professional: 1.2,
                neutral: 1.1,
                premium: 1.1
            },
            'stress_shopping': {
                comfort: 1.4,
                indulgent: 1.3,
                familiar: 1.2
            }
        };

        const effects = situationEffects[situation] || {};
        const productAttributes = product.attributes || {};
        
        let multiplier = 1.0;
        Object.entries(effects).forEach(([attr, mult]) => {
            if (productAttributes[attr]) {
                multiplier *= mult;
            }
        });

        return multiplier;
    }

    calculateCulturalEffect(environment, product) {
        // 文化的イベント・トレンドの影響
        const culturalContext = environment.culturalContext || {};
        let effect = 1.0;

        // メディア・SNSトレンドの影響
        if (culturalContext.trendingProducts?.includes(product.id)) {
            effect *= 1.3;
        }

        // 文化的価値観の影響
        const culturalValues = culturalContext.values || {};
        if (culturalValues.health_conscious && product.attributes?.healthy) {
            effect *= 1.2;
        }
        if (culturalValues.sustainability && product.attributes?.sustainable) {
            effect *= 1.1;
        }

        return effect;
    }
}

/**
 * 店舗環境システム
 */
class StoreEnvironmentSystem {
    calculateImpact(environment, customer, product, popConfig) {
        let impact = 1.0;
        
        // 混雑度の影響
        const crowdingEffect = this.calculateCrowdingEffect(environment.crowdingLevel, customer);
        impact *= crowdingEffect;
        
        // 店舗レイアウトの影響
        const layoutEffect = this.calculateLayoutEffect(environment, customer, product);
        impact *= layoutEffect;
        
        // 競合商品の影響
        const competitionEffect = this.calculateCompetitionEffect(environment, product);
        impact *= competitionEffect;
        
        // 店舗雰囲気の影響
        const atmosphereEffect = this.calculateAtmosphereEffect(environment, customer);
        impact *= atmosphereEffect;

        return {
            multiplier: impact,
            confidence: 0.8,
            factors: {
                crowding: crowdingEffect,
                layout: layoutEffect,
                competition: competitionEffect,
                atmosphere: atmosphereEffect
            }
        };
    }

    calculateCrowdingEffect(crowdingLevel, customer) {
        const tolerance = customer.behavioral?.crowdingTolerance || 0.7;
        
        if (crowdingLevel <= tolerance) {
            return 1.0;
        }
        
        const stress = crowdingLevel - tolerance;
        const effect = Math.exp(-stress * 2.0);
        
        return Math.max(0.3, effect);
    }

    calculateLayoutEffect(environment, customer, product) {
        const position = environment.productPosition || 'shelf';
        const visibility = environment.visibility || 1.0;
        
        const positionEffects = {
            'eye_level': 1.0,
            'above_eye': 0.8,
            'below_eye': 0.7,
            'endcap': 1.3,
            'checkout': 1.2,
            'entrance': 1.1
        };
        
        let effect = positionEffects[position] || 1.0;
        effect *= visibility;
        
        // 個人の身体特性による調整
        if (customer.height) {
            const heightAdjustment = this.getHeightAdjustment(customer.height, position);
            effect *= heightAdjustment;
        }
        
        return effect;
    }

    getHeightAdjustment(height, position) {
        // 身長による商品位置の見やすさ調整
        const averageHeight = 165; // cm
        const heightDiff = (height - averageHeight) / 30; // 正規化
        
        if (position === 'above_eye') {
            return 1 + Math.max(0, heightDiff) * 0.3;
        } else if (position === 'below_eye') {
            return 1 + Math.max(0, -heightDiff) * 0.2;
        }
        
        return 1.0;
    }

    calculateCompetitionEffect(environment, product) {
        const competitorCount = environment.nearbyCompetitors || 0;
        const competitorStrength = environment.competitorStrength || 0.5;
        
        // 競合が多いほど注目を奪われる
        const competitionPressure = competitorCount * competitorStrength;
        const effect = Math.exp(-competitionPressure * 0.1);
        
        return Math.max(0.5, effect);
    }

    calculateAtmosphereEffect(environment, customer) {
        const atmosphere = environment.storeAtmosphere || {};
        let effect = 1.0;
        
        // 照明の影響
        if (atmosphere.lighting) {
            const lightingEffect = this.getLightingEffect(atmosphere.lighting, customer);
            effect *= lightingEffect;
        }
        
        // 音楽の影響
        if (atmosphere.music) {
            const musicEffect = this.getMusicEffect(atmosphere.music, customer);
            effect *= musicEffect;
        }
        
        // 香りの影響
        if (atmosphere.scent) {
            const scentEffect = this.getScentEffect(atmosphere.scent, customer);
            effect *= scentEffect;
        }
        
        return effect;
    }

    getLightingEffect(lighting, customer) {
        const lightingPreferences = {
            senior: { bright: 1.2, dim: 0.8 },
            family: { bright: 1.1, natural: 1.1 },
            single: { modern: 1.1, atmospheric: 1.1 },
            youth: { colorful: 1.2, dynamic: 1.1 }
        };
        
        const prefs = lightingPreferences[customer.segment] || {};
        return prefs[lighting] || 1.0;
    }

    getMusicEffect(music, customer) {
        const musicPreferences = {
            senior: { classical: 1.1, quiet: 1.2, loud: 0.8 },
            family: { pleasant: 1.1, moderate: 1.1 },
            single: { modern: 1.1, trendy: 1.1 },
            youth: { upbeat: 1.2, trendy: 1.2, quiet: 0.9 }
        };
        
        const prefs = musicPreferences[customer.segment] || {};
        return prefs[music] || 1.0;
    }

    getScentEffect(scent, customer) {
        // 香りは一般的に購買意欲を高めるが、個人差が大きい
        const baseScentEffect = 1.05;
        const personalSensitivity = customer.scentSensitivity || 1.0;
        
        return baseScentEffect * personalSensitivity;
    }
}

// グローバル公開
window.EnvironmentalFactorsSystem = EnvironmentalFactorsSystem;
window.WeatherImpactSystem = WeatherImpactSystem;
window.TemporalFactorsSystem = TemporalFactorsSystem;
window.SocialContextSystem = SocialContextSystem;
window.StoreEnvironmentSystem = StoreEnvironmentSystem;