/**
 * リアルタイム分析エンジン
 * STOP/HOLD/CLOSE KPI計算とビジネスインサイト生成
 */

class AnalyticsEngine {
    constructor() {
        this.metrics = new MetricsCollector();
        this.kpiCalculator = new KPICalculator();
        this.insightGenerator = new InsightGenerator();
        this.predictionEngine = new PredictionEngine();
        
        // リアルタイムデータストレージ
        this.realtimeData = {
            customers: [],
            interactions: [],
            purchases: [],
            popViews: [],
            sessionMetrics: {},
            hourlyStats: {}
        };
        
        // KPI履歴
        this.kpiHistory = {
            attention: [],
            consideration: [],
            conversion: [],
            revenue: []
        };
        
        this.updateInterval = null;
    }

    /**
     * リアルタイム分析を開始
     */
    startRealTimeAnalysis() {
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.calculateKPIs();
            this.generateInsights();
            this.updateDashboard();
        }, 5000); // 5秒ごとに更新
    }

    /**
     * 分析を停止
     */
    stopRealTimeAnalysis() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * 顧客インタラクションを記録
     */
    recordCustomerInteraction(customerId, interactionType, product, popConfig, result) {
        const interaction = {
            timestamp: Date.now(),
            customerId: customerId,
            type: interactionType, // 'view', 'consider', 'purchase', 'ignore'
            product: product,
            popConfig: popConfig,
            result: result,
            sessionId: this.getSessionId()
        };
        
        this.realtimeData.interactions.push(interaction);
        this.processInteractionForMetrics(interaction);
    }

    /**
     * 購入を記録
     */
    recordPurchase(customerId, product, price, popInfluence) {
        const purchase = {
            timestamp: Date.now(),
            customerId: customerId,
            product: product,
            price: price,
            popInfluence: popInfluence,
            sessionId: this.getSessionId()
        };
        
        this.realtimeData.purchases.push(purchase);
        this.updateRevenueMetrics(purchase);
    }

    /**
     * POP閲覧を記録
     */
    recordPOPView(customerId, popConfig, duration, engagement) {
        const popView = {
            timestamp: Date.now(),
            customerId: customerId,
            popConfig: popConfig,
            duration: duration,
            engagement: engagement, // 'high', 'medium', 'low'
            sessionId: this.getSessionId()
        };
        
        this.realtimeData.popViews.push(popView);
    }

    /**
     * KPIを計算
     */
    calculateKPIs() {
        const timeWindow = 300000; // 5分間のデータ
        const cutoffTime = Date.now() - timeWindow;
        
        // 最近のデータをフィルタ
        const recentInteractions = this.realtimeData.interactions
            .filter(i => i.timestamp > cutoffTime);
        const recentPurchases = this.realtimeData.purchases
            .filter(p => p.timestamp > cutoffTime);
        const recentPopViews = this.realtimeData.popViews
            .filter(v => v.timestamp > cutoffTime);
        
        // STOP - 注目率計算
        const attentionRate = this.kpiCalculator.calculateAttentionRate(
            recentInteractions, recentPopViews
        );
        
        // HOLD - 検討率計算  
        const considerationRate = this.kpiCalculator.calculateConsiderationRate(
            recentInteractions
        );
        
        // CLOSE - 購入率計算
        const conversionRate = this.kpiCalculator.calculateConversionRate(
            recentInteractions, recentPurchases
        );
        
        // 売上予測
        const revenueForecast = this.kpiCalculator.calculateRevenueForecast(
            recentPurchases, attentionRate, conversionRate
        );
        
        // KPI履歴に追加
        this.updateKPIHistory({
            attention: attentionRate,
            consideration: considerationRate,
            conversion: conversionRate,
            revenue: revenueForecast
        });
        
        return {
            attention: attentionRate,
            consideration: considerationRate,
            conversion: conversionRate,
            revenue: revenueForecast,
            timestamp: Date.now()
        };
    }

    /**
     * ビジネスインサイトを生成
     */
    generateInsights() {
        const currentKPIs = this.getCurrentKPIs();
        const historicalTrends = this.getHistoricalTrends();
        const segmentAnalysis = this.analyzeSegmentPerformance();
        const popEffectiveness = this.analyzePOPEffectiveness();
        
        const insights = this.insightGenerator.generateActionableInsights({
            currentKPIs,
            historicalTrends,
            segmentAnalysis,
            popEffectiveness
        });
        
        return insights;
    }

    /**
     * セグメント別パフォーマンス分析
     */
    analyzeSegmentPerformance() {
        const segments = ['senior', 'family', 'single', 'youth'];
        const analysis = {};
        
        segments.forEach(segment => {
            const segmentInteractions = this.realtimeData.interactions
                .filter(i => i.result?.customer?.segment === segment);
            const segmentPurchases = this.realtimeData.purchases
                .filter(p => p.customerId && this.getCustomerSegment(p.customerId) === segment);
            
            analysis[segment] = {
                totalInteractions: segmentInteractions.length,
                totalPurchases: segmentPurchases.length,
                conversionRate: segmentPurchases.length / Math.max(segmentInteractions.length, 1),
                averageOrderValue: this.calculateAverageOrderValue(segmentPurchases),
                topProducts: this.getTopProducts(segmentPurchases),
                responsivePOPs: this.getResponsivePOPs(segmentInteractions, segment)
            };
        });
        
        return analysis;
    }

    /**
     * POP効果分析
     */
    analyzePOPEffectiveness() {
        const popTypes = ['discount', 'limited', 'character', 'celebrity', 'health', 'premium'];
        const analysis = {};
        
        popTypes.forEach(popType => {
            const popInteractions = this.realtimeData.interactions
                .filter(i => i.popConfig?.type === popType);
            const popPurchases = this.realtimeData.purchases
                .filter(p => p.popInfluence?.type === popType);
            
            const views = this.realtimeData.popViews
                .filter(v => v.popConfig?.type === popType);
            
            analysis[popType] = {
                totalViews: views.length,
                totalInteractions: popInteractions.length,
                totalPurchases: popPurchases.length,
                viewToInteractionRate: popInteractions.length / Math.max(views.length, 1),
                interactionToConversionRate: popPurchases.length / Math.max(popInteractions.length, 1),
                averageViewDuration: this.calculateAverageViewDuration(views),
                revenueAttribution: this.calculateRevenueAttribution(popPurchases),
                effectivenessBySegment: this.analyzePOPBySegment(popType)
            };
        });
        
        return analysis;
    }

    /**
     * 予測エンジンによる将来予測
     */
    generatePredictions(timeHorizon = '1hour') {
        return this.predictionEngine.predict({
            historicalData: this.kpiHistory,
            currentTrends: this.getHistoricalTrends(),
            environmentalFactors: this.getCurrentEnvironment(),
            timeHorizon: timeHorizon
        });
    }

    /**
     * A/Bテスト結果分析
     */
    analyzeABTest(testConfig) {
        const controlGroup = this.getTestGroupData(testConfig.controlGroup);
        const treatmentGroup = this.getTestGroupData(testConfig.treatmentGroup);
        
        return this.kpiCalculator.calculateABTestResults(controlGroup, treatmentGroup);
    }

    /**
     * ダッシュボード更新
     */
    updateDashboard() {
        const currentKPIs = this.getCurrentKPIs();
        const insights = this.generateInsights();
        const predictions = this.generatePredictions();
        
        // UIエレメントを更新
        this.updateKPICards(currentKPIs);
        this.updateCharts();
        this.updateInsightCards(insights);
        this.updatePredictionPanel(predictions);
    }

    // ヘルパーメソッド
    processInteractionForMetrics(interaction) {
        const hour = new Date().getHours();
        if (!this.realtimeData.hourlyStats[hour]) {
            this.realtimeData.hourlyStats[hour] = {
                interactions: 0,
                views: 0,
                purchases: 0,
                revenue: 0
            };
        }
        this.realtimeData.hourlyStats[hour].interactions++;
    }

    updateRevenueMetrics(purchase) {
        const hour = new Date().getHours();
        if (!this.realtimeData.hourlyStats[hour]) {
            this.realtimeData.hourlyStats[hour] = {
                interactions: 0,
                views: 0,
                purchases: 0,
                revenue: 0
            };
        }
        this.realtimeData.hourlyStats[hour].purchases++;
        this.realtimeData.hourlyStats[hour].revenue += purchase.price;
    }

    updateKPIHistory(kpis) {
        const timestamp = Date.now();
        Object.keys(kpis).forEach(kpi => {
            this.kpiHistory[kpi].push({
                value: kpis[kpi],
                timestamp: timestamp
            });
            
            // 履歴を最大1000ポイントに制限
            if (this.kpiHistory[kpi].length > 1000) {
                this.kpiHistory[kpi].shift();
            }
        });
    }

    getCurrentKPIs() {
        return this.calculateKPIs();
    }

    getHistoricalTrends() {
        return {
            attention: this.calculateTrend(this.kpiHistory.attention),
            consideration: this.calculateTrend(this.kpiHistory.consideration),
            conversion: this.calculateTrend(this.kpiHistory.conversion),
            revenue: this.calculateTrend(this.kpiHistory.revenue)
        };
    }

    calculateTrend(dataPoints) {
        if (dataPoints.length < 2) return 0;
        
        const recent = dataPoints.slice(-10);
        const older = dataPoints.slice(-20, -10);
        
        const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
        const olderAvg = older.length > 0 ? 
            older.reduce((sum, p) => sum + p.value, 0) / older.length : recentAvg;
        
        return olderAvg !== 0 ? (recentAvg - olderAvg) / olderAvg : 0;
    }

    getSessionId() {
        return 'session_' + Date.now();
    }

    getCustomerSegment(customerId) {
        // 実装では顧客IDから セグメント情報を取得
        return 'single'; // プレースホルダー
    }

    calculateAverageOrderValue(purchases) {
        if (purchases.length === 0) return 0;
        const total = purchases.reduce((sum, p) => sum + p.price, 0);
        return total / purchases.length;
    }

    getTopProducts(purchases) {
        const productCounts = {};
        purchases.forEach(p => {
            const productId = p.product.id;
            productCounts[productId] = (productCounts[productId] || 0) + 1;
        });
        
        return Object.entries(productCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([productId, count]) => ({ productId, count }));
    }

    getResponsivePOPs(interactions, segment) {
        const popCounts = {};
        interactions.forEach(i => {
            if (i.type === 'purchase') {
                const popType = i.popConfig?.type;
                if (popType) {
                    popCounts[popType] = (popCounts[popType] || 0) + 1;
                }
            }
        });
        
        return Object.entries(popCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([popType, count]) => ({ popType, count }));
    }

    calculateAverageViewDuration(views) {
        if (views.length === 0) return 0;
        const total = views.reduce((sum, v) => sum + v.duration, 0);
        return total / views.length;
    }

    calculateRevenueAttribution(purchases) {
        return purchases.reduce((sum, p) => sum + p.price, 0);
    }

    analyzePOPBySegment(popType) {
        const segments = ['senior', 'family', 'single', 'youth'];
        const analysis = {};
        
        segments.forEach(segment => {
            const segmentViews = this.realtimeData.popViews
                .filter(v => v.popConfig?.type === popType && 
                       this.getCustomerSegment(v.customerId) === segment);
            const segmentPurchases = this.realtimeData.purchases
                .filter(p => p.popInfluence?.type === popType && 
                       this.getCustomerSegment(p.customerId) === segment);
            
            analysis[segment] = {
                conversionRate: segmentPurchases.length / Math.max(segmentViews.length, 1),
                revenue: segmentPurchases.reduce((sum, p) => sum + p.price, 0)
            };
        });
        
        return analysis;
    }

    getCurrentEnvironment() {
        // 現在の環境状態を返す
        return {
            weather: 'sunny',
            temperature: 22,
            timeOfDay: 'afternoon',
            crowdingLevel: 0.6
        };
    }

    getTestGroupData(groupConfig) {
        // A/Bテストグループのデータを取得
        return {
            interactions: [],
            purchases: [],
            metrics: {}
        };
    }

    // UI更新メソッド
    updateKPICards(kpis) {
        // 注目率カード
        const attentionElement = document.getElementById('attention-rate');
        if (attentionElement) {
            attentionElement.textContent = `${(kpis.attention * 100).toFixed(1)}%`;
        }
        
        // 検討率カード
        const considerationElement = document.getElementById('consideration-rate');
        if (considerationElement) {
            considerationElement.textContent = `${(kpis.consideration * 100).toFixed(1)}%`;
        }
        
        // 購入率カード
        const conversionElement = document.getElementById('conversion-rate');
        if (conversionElement) {
            conversionElement.textContent = `${(kpis.conversion * 100).toFixed(1)}%`;
        }
        
        // 売上予測カード
        const revenueElement = document.getElementById('revenue-forecast');
        if (revenueElement) {
            revenueElement.textContent = `¥${kpis.revenue.toLocaleString()}`;
        }
    }

    updateCharts() {
        // Chart.jsを使用してチャートを更新
        if (window.hourlyChart) {
            this.updateHourlyChart();
        }
        if (window.segmentChart) {
            this.updateSegmentChart();
        }
        if (window.categoryChart) {
            this.updateCategoryChart();
        }
        if (window.popComparisonChart) {
            this.updatePOPComparisonChart();
        }
    }

    updateHourlyChart() {
        const hourlyData = Object.entries(this.realtimeData.hourlyStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([hour, stats]) => ({
                hour: `${hour}:00`,
                attention: stats.views / Math.max(stats.interactions, 1),
                conversion: stats.purchases / Math.max(stats.views, 1)
            }));
        
        if (window.hourlyChart && hourlyData.length > 0) {
            window.hourlyChart.data.labels = hourlyData.map(d => d.hour);
            window.hourlyChart.data.datasets[0].data = hourlyData.map(d => d.attention * 100);
            window.hourlyChart.data.datasets[1].data = hourlyData.map(d => d.conversion * 100);
            window.hourlyChart.update();
        }
    }

    updateSegmentChart() {
        const segmentData = this.analyzeSegmentPerformance();
        
        if (window.segmentChart && Object.keys(segmentData).length > 0) {
            window.segmentChart.data.labels = Object.keys(segmentData);
            window.segmentChart.data.datasets[0].data = Object.values(segmentData)
                .map(s => s.conversionRate * 100);
            window.segmentChart.update();
        }
    }

    updateCategoryChart() {
        const categoryData = this.analyzeCategoryPerformance();
        
        if (window.categoryChart && Object.keys(categoryData).length > 0) {
            window.categoryChart.data.labels = Object.keys(categoryData);
            window.categoryChart.data.datasets[0].data = Object.values(categoryData)
                .map(c => c.revenue);
            window.categoryChart.update();
        }
    }

    updatePOPComparisonChart() {
        const popData = this.analyzePOPEffectiveness();
        
        if (window.popComparisonChart && Object.keys(popData).length > 0) {
            window.popComparisonChart.data.labels = Object.keys(popData);
            window.popComparisonChart.data.datasets[0].data = Object.values(popData)
                .map(p => p.interactionToConversionRate * 100);
            window.popComparisonChart.update();
        }
    }

    analyzeCategoryPerformance() {
        const categories = ['chocolate', 'cookies', 'candy', 'gum'];
        const analysis = {};
        
        categories.forEach(category => {
            const categoryPurchases = this.realtimeData.purchases
                .filter(p => p.product.category === category);
            
            analysis[category] = {
                revenue: categoryPurchases.reduce((sum, p) => sum + p.price, 0),
                count: categoryPurchases.length
            };
        });
        
        return analysis;
    }

    updateInsightCards(insights) {
        // インサイトカードの更新実装
        console.log('Insights updated:', insights);
    }

    updatePredictionPanel(predictions) {
        // 予測パネルの更新実装
        console.log('Predictions updated:', predictions);
    }
}

/**
 * KPI計算器
 */
class KPICalculator {
    calculateAttentionRate(interactions, popViews) {
        const totalViews = popViews.length;
        const attentiveViews = popViews.filter(v => 
            v.engagement === 'high' || v.duration > 2000
        ).length;
        
        return totalViews > 0 ? attentiveViews / totalViews : 0;
    }

    calculateConsiderationRate(interactions) {
        const viewInteractions = interactions.filter(i => i.type === 'view');
        const considerInteractions = interactions.filter(i => i.type === 'consider');
        
        return viewInteractions.length > 0 ? 
            considerInteractions.length / viewInteractions.length : 0;
    }

    calculateConversionRate(interactions, purchases) {
        const considerInteractions = interactions.filter(i => i.type === 'consider');
        
        return considerInteractions.length > 0 ? 
            purchases.length / considerInteractions.length : 0;
    }

    calculateRevenueForecast(purchases, attentionRate, conversionRate) {
        const hourlyRevenue = purchases.reduce((sum, p) => sum + p.price, 0);
        const projectedHourlyRevenue = hourlyRevenue * (1 + attentionRate) * (1 + conversionRate);
        
        return projectedHourlyRevenue * 8; // 8時間営業と仮定
    }

    calculateABTestResults(controlGroup, treatmentGroup) {
        const controlConversion = this.calculateConversionRate(
            controlGroup.interactions, controlGroup.purchases
        );
        const treatmentConversion = this.calculateConversionRate(
            treatmentGroup.interactions, treatmentGroup.purchases
        );
        
        const lift = treatmentConversion - controlConversion;
        const liftPercent = controlConversion > 0 ? lift / controlConversion : 0;
        
        return {
            controlConversion,
            treatmentConversion,
            lift,
            liftPercent,
            significance: this.calculateSignificance(controlGroup, treatmentGroup)
        };
    }

    calculateSignificance(controlGroup, treatmentGroup) {
        // 簡易的な有意性検定
        const controlN = controlGroup.interactions.length;
        const treatmentN = treatmentGroup.interactions.length;
        
        if (controlN < 30 || treatmentN < 30) return 'insufficient_data';
        
        const controlRate = controlGroup.purchases.length / controlN;
        const treatmentRate = treatmentGroup.purchases.length / treatmentN;
        
        const pooledRate = (controlGroup.purchases.length + treatmentGroup.purchases.length) / 
                          (controlN + treatmentN);
        
        const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlN + 1/treatmentN));
        const zScore = Math.abs(treatmentRate - controlRate) / se;
        
        if (zScore > 2.58) return 'highly_significant'; // p < 0.01
        if (zScore > 1.96) return 'significant';        // p < 0.05
        return 'not_significant';
    }
}

/**
 * インサイト生成器
 */
class InsightGenerator {
    generateActionableInsights(data) {
        const insights = [];
        
        // パフォーマンス異常検知
        const performanceInsights = this.detectPerformanceAnomalies(data.currentKPIs, data.historicalTrends);
        insights.push(...performanceInsights);
        
        // セグメント最適化提案
        const segmentInsights = this.generateSegmentOptimizations(data.segmentAnalysis);
        insights.push(...segmentInsights);
        
        // POP効果最適化提案
        const popInsights = this.generatePOPOptimizations(data.popEffectiveness);
        insights.push(...popInsights);
        
        return insights.sort((a, b) => b.priority - a.priority);
    }

    detectPerformanceAnomalies(currentKPIs, trends) {
        const insights = [];
        
        // 注目率の急激な低下を検知
        if (trends.attention < -0.1) {
            insights.push({
                type: 'performance_alert',
                priority: 0.9,
                title: 'POP注目率の低下を検知',
                description: `注目率が${(trends.attention * 100).toFixed(1)}%低下しています。POP配置やデザインの見直しを推奨します。`,
                recommendations: [
                    'POP位置を目線の高さに調整',
                    'より鮮やかな色彩の使用を検討',
                    'サイズの大型化を検討'
                ],
                expectedImpact: '注目率15-25%改善'
            });
        }
        
        // 購入率の異常低下を検知
        if (trends.conversion < -0.15) {
            insights.push({
                type: 'conversion_alert',
                priority: 0.95,
                title: '購入率の急激な低下',
                description: `購入率が${(trends.conversion * 100).toFixed(1)}%低下しています。商品魅力度や価格設定の見直しが必要です。`,
                recommendations: [
                    '割引POPの導入検討',
                    '商品の機能性訴求強化',
                    '競合商品との差別化要素の明確化'
                ],
                expectedImpact: '購入率10-20%改善'
            });
        }
        
        return insights;
    }

    generateSegmentOptimizations(segmentAnalysis) {
        const insights = [];
        
        Object.entries(segmentAnalysis).forEach(([segment, data]) => {
            if (data.conversionRate < 0.1) {
                const segmentNames = {
                    senior: 'シニア層',
                    family: '子あり世代',
                    single: 'シングル層',
                    youth: '若者層'
                };
                
                insights.push({
                    type: 'segment_optimization',
                    priority: 0.7,
                    title: `${segmentNames[segment]}の購入率向上施策`,
                    description: `${segmentNames[segment]}の購入率が${(data.conversionRate * 100).toFixed(1)}%と低水準です。`,
                    recommendations: this.getSegmentSpecificRecommendations(segment),
                    expectedImpact: '該当セグメント売上20-35%向上'
                });
            }
        });
        
        return insights;
    }

    generatePOPOptimizations(popEffectiveness) {
        const insights = [];
        
        // 最も効果的なPOPを特定
        const popPerformance = Object.entries(popEffectiveness)
            .map(([type, data]) => ({
                type,
                effectiveness: data.interactionToConversionRate,
                revenue: data.revenueAttribution
            }))
            .sort((a, b) => b.effectiveness - a.effectiveness);
        
        if (popPerformance.length > 0) {
            const bestPOP = popPerformance[0];
            const worstPOP = popPerformance[popPerformance.length - 1];
            
            insights.push({
                type: 'pop_optimization',
                priority: 0.8,
                title: 'POP種別効果の最適化',
                description: `${bestPOP.type}POPが最高効果（購入率${(bestPOP.effectiveness * 100).toFixed(1)}%）、${worstPOP.type}POPの改善が必要です。`,
                recommendations: [
                    `効果の高い${bestPOP.type}POPの展開拡大`,
                    `${worstPOP.type}POPのデザインや配置を見直し`,
                    'A/Bテストによる最適化実施'
                ],
                expectedImpact: '全体売上10-15%向上'
            });
        }
        
        return insights;
    }

    getSegmentSpecificRecommendations(segment) {
        const recommendations = {
            senior: [
                '健康訴求POPの強化',
                '大きく読みやすいフォントの使用',
                '信頼できるブランド情報の表示'
            ],
            family: [
                'ファミリーサイズ商品の訴求',
                'キャラクター要素の追加',
                'お得感のある価格表示'
            ],
            single: [
                'プレミアム感の演出',
                '限定商品の訴求強化',
                '個人向けサイズの提案'
            ],
            youth: [
                'SNS映えするビジュアル',
                'トレンド要素の取り入れ',
                'インフルエンサー起用検討'
            ]
        };
        
        return recommendations[segment] || [];
    }
}

/**
 * 予測エンジン
 */
class PredictionEngine {
    predict(data) {
        const { historicalData, currentTrends, environmentalFactors, timeHorizon } = data;
        
        return {
            attention: this.predictKPI(historicalData.attention, currentTrends.attention, timeHorizon),
            consideration: this.predictKPI(historicalData.consideration, currentTrends.consideration, timeHorizon),
            conversion: this.predictKPI(historicalData.conversion, currentTrends.conversion, timeHorizon),
            revenue: this.predictRevenue(historicalData.revenue, environmentalFactors, timeHorizon)
        };
    }

    predictKPI(historical, trend, timeHorizon) {
        if (historical.length === 0) return 0;
        
        const latest = historical[historical.length - 1].value;
        const trendAdjustment = trend * this.getTimeHorizonMultiplier(timeHorizon);
        
        return Math.max(0, Math.min(1, latest + trendAdjustment));
    }

    predictRevenue(historical, environmentalFactors, timeHorizon) {
        if (historical.length === 0) return 0;
        
        const latest = historical[historical.length - 1].value;
        const seasonalMultiplier = this.getSeasonalMultiplier(environmentalFactors);
        const weatherMultiplier = this.getWeatherMultiplier(environmentalFactors);
        
        return latest * seasonalMultiplier * weatherMultiplier;
    }

    getTimeHorizonMultiplier(timeHorizon) {
        const multipliers = {
            '15min': 0.25,
            '1hour': 1.0,
            '1day': 8.0,
            '1week': 56.0
        };
        
        return multipliers[timeHorizon] || 1.0;
    }

    getSeasonalMultiplier(factors) {
        // 季節による売上補正
        const seasonMultipliers = {
            spring: 1.0,
            summer: 0.9,
            autumn: 1.1,
            winter: 1.3
        };
        
        return seasonMultipliers[factors.season] || 1.0;
    }

    getWeatherMultiplier(factors) {
        // 天気による売上補正
        const weatherMultipliers = {
            sunny: 1.0,
            rainy: 1.1,
            cloudy: 1.0,
            hot: 0.8,
            cold: 1.2
        };
        
        return weatherMultipliers[factors.weather] || 1.0;
    }
}

/**
 * メトリクス収集器
 */
class MetricsCollector {
    constructor() {
        this.collectors = {
            performance: new PerformanceMetrics(),
            user: new UserMetrics(),
            business: new BusinessMetrics()
        };
    }

    collectAll() {
        return {
            performance: this.collectors.performance.collect(),
            user: this.collectors.user.collect(),
            business: this.collectors.business.collect()
        };
    }
}

class PerformanceMetrics {
    collect() {
        return {
            renderTime: performance.now(),
            memoryUsage: this.getMemoryUsage(),
            fps: this.getFPS()
        };
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getFPS() {
        // FPS計算の実装
        return 60; // プレースホルダー
    }
}

class UserMetrics {
    collect() {
        return {
            sessionDuration: this.getSessionDuration(),
            interactions: this.getInteractionCount(),
            engagement: this.getEngagementLevel()
        };
    }

    getSessionDuration() {
        return Date.now() - (window.sessionStartTime || Date.now());
    }

    getInteractionCount() {
        return window.interactionCount || 0;
    }

    getEngagementLevel() {
        // エンゲージメントレベルの計算
        return 'high'; // プレースホルダー
    }
}

class BusinessMetrics {
    collect() {
        return {
            conversionFunnel: this.getConversionFunnel(),
            revenueMetrics: this.getRevenueMetrics(),
            customerSegments: this.getSegmentMetrics()
        };
    }

    getConversionFunnel() {
        return {
            impressions: 1000,
            clicks: 150,
            conversions: 25
        };
    }

    getRevenueMetrics() {
        return {
            totalRevenue: 5000,
            averageOrderValue: 200,
            transactionCount: 25
        };
    }

    getSegmentMetrics() {
        return {
            senior: { count: 10, revenue: 1500 },
            family: { count: 8, revenue: 1200 },
            single: { count: 5, revenue: 800 },
            youth: { count: 2, revenue: 300 }
        };
    }
}

// グローバル公開
window.AnalyticsEngine = AnalyticsEngine;
window.KPICalculator = KPICalculator;
window.InsightGenerator = InsightGenerator;
window.PredictionEngine = PredictionEngine;
window.MetricsCollector = MetricsCollector;