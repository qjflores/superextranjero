import axios, { AxiosInstance } from 'axios';

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  async register(email: string, password: string): Promise<{userId: string; email: string; token: string}> {
    const response = await this.client.post('/auth/register', { email, password });
    return response.data.data;
  }

  async login(email: string, password: string): Promise<{userId: string; email: string; token: string}> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data.data;
  }

  async generateMicroScenarioIntro(
    verbTarget: string,
    nativeLanguage: string,
    difficultyLevel?: number
  ): Promise<{text: string; verbTarget: string; level: number; guardrailPassed: boolean}> {
    const response = await this.client.post('/llm/generate', {
      capability: 'generate_micro_scenario_intro',
      verbTarget,
      nativeLanguage,
      difficultyLevel: difficultyLevel || 1,
    });
    return response.data.data;
  }

  async hello(): Promise<{message: string}> {
    const response = await this.client.get('/api/hello');
    return response.data;
  }

  async healthCheck(): Promise<{status: string; timestamp: string}> {
    const response = await this.client.get('/health');
    return response.data.data;
  }

  async seedVerbPool(nativeLanguage: string, seedTarget: number = 20): Promise<{
    seeded_verbs: string[];
    micro_scenarios_completed: number;
    mode: 'recognition';
    pool_ready_for_full: boolean;
  }> {
    const response = await this.client.post('/seed-verb-pool', {
      nativeLanguage,
      seedTarget,
    });
    return response.data.data;
  }

  async getSeedingStatus(): Promise<{
    pool_seeded: boolean;
    seeded_verbs_count: number;
    completed_scenarios: number;
    ready_for_full: boolean;
  }> {
    const response = await this.client.get('/seed-verb-pool/status');
    return response.data.data;
  }
}

export default new APIClient();
