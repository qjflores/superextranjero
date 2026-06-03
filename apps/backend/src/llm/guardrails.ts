export enum GuardrailError {
  ROUTE_OVERRIDE = 'E_ROUTE_OVERRIDE',
  INVALID_CAPABILITY = 'E_INVALID_CAPABILITY',
  PROVIDER_FAILED = 'E_PROVIDER_FAILED',
}

export interface GuardrailViolation {
  error: GuardrailError;
  message: string;
  timestamp: Date;
}

export class Guardrails {
  private violations: GuardrailViolation[] = [];

  // Reject high-stakes on live path
  validateRouting(route: string, stakes: string): boolean {
    if (route === 'live' && stakes === 'high') {
      this.violations.push({
        error: GuardrailError.ROUTE_OVERRIDE,
        message: 'High-stakes content cannot run on live path',
        timestamp: new Date(),
      });
      return false;
    }
    return true;
  }

  // Get violation metrics for monitoring
  getViolationRate(): number {
    if (this.violations.length === 0) return 0;
    const recentWindow = 3600000; // 1 hour
    const now = Date.now();
    const recent = this.violations.filter((v) => now - v.timestamp.getTime() < recentWindow);
    return recent.length;
  }

  // Clear old violations
  clearOldViolations(ageMs: number = 3600000): void {
    const now = Date.now();
    this.violations = this.violations.filter((v) => now - v.timestamp.getTime() < ageMs);
  }

  getViolations(): GuardrailViolation[] {
    return [...this.violations];
  }

  reset(): void {
    this.violations = [];
  }
}
