import { useState, useCallback } from 'react';
import apiClient from '../api/client.js';

export interface SeedingState {
  isLoading: boolean;
  isComplete: boolean;
  seededVerbs: string[];
  completedScenarios: number;
  readyForFull: boolean;
  error?: string;
}

export const useSeedingState = () => {
  const [seeding, setSeeding] = useState<SeedingState>({
    isLoading: false,
    isComplete: false,
    seededVerbs: [],
    completedScenarios: 0,
    readyForFull: false,
  });

  const checkStatus = useCallback(async () => {
    try {
      const status = await apiClient.getSeedingStatus();
      setSeeding((prev) => ({
        ...prev,
        isComplete: status.pool_seeded,
        readyForFull: status.ready_for_full,
        seededVerbs: [],
        completedScenarios: status.completed_scenarios,
      }));
    } catch (error) {
      console.error('Failed to check seeding status:', error);
    }
  }, []);

  const seedPool = useCallback(async (nativeLanguage: string, target: number = 20) => {
    setSeeding((prev) => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const result = await apiClient.seedVerbPool(nativeLanguage, target);
      setSeeding({
        isLoading: false,
        isComplete: result.pool_ready_for_full,
        seededVerbs: result.seeded_verbs,
        completedScenarios: result.micro_scenarios_completed,
        readyForFull: result.pool_ready_for_full,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Seeding failed';
      setSeeding((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  return {
    seeding,
    seedPool,
    checkStatus,
  };
};
