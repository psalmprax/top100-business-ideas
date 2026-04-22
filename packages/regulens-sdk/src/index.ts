/**
 * Regulens AI Compliance Hub SDK
 * EU AI Act Compliance Tools
 * 
 * @package @regulens/sdk
 * @version 1.0.0
 */

import axios, { AxiosInstance } from 'axios';

// Types
export interface ComplianceConfig {
    apiKey: string;
    endpoint?: string;
}

export interface AIArticle {
    id: string;
    number: number;
    title: string;
    description: string;
    requirements: string[];
    risk_level?: 'unacceptable' | 'high' | 'limited' | 'minimal';
}

export interface ComplianceScan {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at: Date;
    completed_at?: Date;
    results: ComplianceResult[];
}

export interface ComplianceResult {
    article_id: string;
    article_number: number;
    status: 'compliant' | 'non_compliant' | 'needs_review';
    score: number;
    findings: Finding[];
    recommendations: string[];
}

export interface Finding {
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location?: string;
    remediation?: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    version: string;
    risk_category: 'unacceptable' | 'high' | 'limited' | 'minimal';
    last_trained: Date;
    training_data?: TrainingDataInfo;
}

export interface TrainingDataInfo {
    size: number;
    sources: string[];
    date_range: { start: Date; end: Date };
    bias_assessment?: string;
}

export interface IntegrationConfig {
    type: 'cicd' | 'training_data' | 'model_registry' | 'monitoring';
    provider: string;
    config: Record<string, string>;
}

export interface ComplianceReport {
    id: string;
    generated_at: Date;
    summary: {
        total_articles: number;
        compliant: number;
        non_compliant: number;
        needs_review: number;
        overall_score: number;
    };
    articles: ComplianceResult[];
}

/**
 * RegulensClient
 * Main SDK client for interacting with AI Compliance Hub
 */
export class RegulensClient {
    private client: AxiosInstance;

    constructor(config: ComplianceConfig) {
        const baseURL = config.endpoint || 'https://api.regulens.dev';

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        this.client.interceptors.response.use(
            response => response,
            error => {
                console.error('[Regulens] API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get all EU AI Act articles
     */
    async getArticles(): Promise<AIArticle[]> {
        const response = await this.client.get('/compliance/articles');
        return response.data;
    }

    /**
     * Get specific article by number
     */
    async getArticle(article_number: number): Promise<AIArticle> {
        const response = await this.client.get(`/compliance/articles/${article_number}`);
        return response.data;
    }

    /**
     * Run compliance scan on a model or system
     */
    async runScan(model_id: string, options?: { articles?: number[] }): Promise<ComplianceScan> {
        const response = await this.client.post('/compliance/scans', {
            model_id,
            articles: options?.articles,
        });
        return response.data;
    }

    /**
     * Get scan results
     */
    async getScanResults(scan_id: string): Promise<ComplianceScan> {
        const response = await this.client.get(`/compliance/scans/${scan_id}`);
        return response.data;
    }

    /**
     * List all scans
     */
    async listScans(): Promise<ComplianceScan[]> {
        const response = await this.client.get('/compliance/scans');
        return response.data;
    }

    /**
     * Register a model for compliance tracking
     */
    async registerModel(model: Omit<ModelInfo, 'id' | 'last_trained'>): Promise<ModelInfo> {
        const response = await this.client.post('/models', model);
        return response.data;
    }

    /**
     * Get model information
     */
    async getModel(model_id: string): Promise<ModelInfo> {
        const response = await this.client.get(`/models/${model_id}`);
        return response.data;
    }

    /**
     * List all registered models
     */
    async listModels(): Promise<ModelInfo[]> {
        const response = await this.client.get('/models');
        return response.data;
    }

    /**
     * Update model training data info
     */
    async updateTrainingData(model_id: string, training_data: TrainingDataInfo): Promise<void> {
        await this.client.patch(`/models/${model_id}/training-data`, training_data);
    }

    /**
     * Configure integration
     */
    async configureIntegration(config: IntegrationConfig): Promise<void> {
        await this.client.post('/integrations', config);
    }

    /**
     * List integrations
     */
    async listIntegrations(): Promise<IntegrationConfig[]> {
        const response = await this.client.get('/integrations');
        return response.data;
    }

    /**
     * Test integration
     */
    async testIntegration(integration_id: string): Promise<{ success: boolean; message: string }> {
        const response = await this.client.post(`/integrations/${integration_id}/test`);
        return response.data;
    }

    /**
     * Generate compliance report
     */
    async generateReport(model_id: string): Promise<ComplianceReport> {
        const response = await this.client.post(`/reports/generate`, { model_id });
        return response.data;
    }

    /**
     * Get compliance summary dashboard
     */
    async getComplianceSummary(): Promise<{
        totalModels: number;
        compliantModels: number;
        highRiskModels: number;
        overallScore: number;
    }> {
        const response = await this.client.get('/compliance/summary');
        return response.data;
    }

    /**
     * Get risk assessment for a model
     */
    async getRiskAssessment(model_id: string): Promise<{
        category: 'unacceptable' | 'high' | 'limited' | 'minimal';
        factors: string[];
        mitigationSuggestions: string[];
    }> {
        const response = await this.client.get(`/models/${model_id}/risk-assessment`);
        return response.data;
    }
}

// Convenience function to create client
export function createRegulensClient(config: ComplianceConfig): RegulensClient {
    return new RegulensClient(config);
}

export default RegulensClient;
