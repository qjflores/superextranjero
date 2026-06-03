import { Guardrails, GuardrailError } from '../guardrails.js';

describe('Guardrails', () => {
  let guardrails: Guardrails;

  beforeEach(() => {
    guardrails = new Guardrails();
  });

  test('rejects high-stakes on live route', () => {
    const result = guardrails.validateRouting('live', 'high');
    expect(result).toBe(false);
  });

  test('allows low-stakes on live route', () => {
    const result = guardrails.validateRouting('live', 'low');
    expect(result).toBe(true);
  });

  test('allows high-stakes on non-live route', () => {
    const result = guardrails.validateRouting('staged', 'high');
    expect(result).toBe(true);
  });

  test('tracks violations', () => {
    guardrails.validateRouting('live', 'high');
    guardrails.validateRouting('live', 'high');
    guardrails.validateRouting('staged', 'high');

    const violations = guardrails.getViolations();
    expect(violations.length).toBe(2);
    expect(violations[0].error).toBe(GuardrailError.ROUTE_OVERRIDE);
  });

  test('calculates violation rate', () => {
    guardrails.validateRouting('live', 'high');
    guardrails.validateRouting('live', 'high');

    const rate = guardrails.getViolationRate();
    expect(rate).toBe(2);
  });

  test('clears violations on reset', () => {
    guardrails.validateRouting('live', 'high');
    guardrails.reset();

    expect(guardrails.getViolations().length).toBe(0);
  });
});
