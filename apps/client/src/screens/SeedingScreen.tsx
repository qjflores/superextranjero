import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../state/AuthContext.js';
import apiClient from '../api/client.js';

const CORE_VERBS = [
  'ser',
  'estar',
  'tener',
  'hacer',
  'ir',
  'poder',
  'decir',
  'dar',
  'saber',
  'querer',
  'llegar',
  'pasar',
  'deber',
  'poner',
  'parecer',
  'dejar',
  'seguir',
  'encontrar',
  'llamar',
  'venir',
];

interface Scenario {
  verb: string;
  text: string;
  level: number;
  completed: boolean;
}

export const SeedingScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { auth } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const initialScenarios = CORE_VERBS.map((verb) => ({
        verb,
        text: '',
        level: 1,
        completed: false,
      }));
      setScenarios(initialScenarios);

      // Load first scenario
      if (initialScenarios.length > 0) {
        loadScenarioText(initialScenarios[0]);
      }
    } catch (err) {
      setError('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const loadScenarioText = async (scenario: Scenario) => {
    setIsLoadingScenario(true);
    try {
      const response = await apiClient.generateMicroScenarioIntro(
        scenario.verb,
        'en',
        scenario.level
      );

      setScenarios((prev) =>
        prev.map((s) =>
          s.verb === scenario.verb
            ? { ...s, text: response.text }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to load scenario text:', err);
      // Use fallback text
      setScenarios((prev) =>
        prev.map((s) =>
          s.verb === scenario.verb
            ? { ...s, text: `Learn the verb "${scenario.verb}" in context.` }
            : s
        )
      );
    } finally {
      setIsLoadingScenario(false);
    }
  };

  const handleRecognized = async () => {
    const updatedScenarios = [...scenarios];
    updatedScenarios[currentIndex] = {
      ...updatedScenarios[currentIndex],
      completed: true,
    };
    setScenarios(updatedScenarios);

    if (currentIndex < scenarios.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      loadScenarioText(updatedScenarios[nextIndex]);
    } else {
      // All scenarios completed
      onComplete?.();
    }
  };

  const currentScenario = scenarios[currentIndex];
  const completedCount = scenarios.filter((s) => s.completed).length;
  const progress = scenarios.length > 0 ? (completedCount / scenarios.length) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!currentScenario) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No scenarios available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Learn Spanish Verbs</Text>
        <Text style={styles.subtitle}>
          {completedCount} of {scenarios.length} verbs learned
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Current Scenario */}
      <View style={styles.scenarioContainer}>
        <Text style={styles.verbLabel}>Verb: {currentScenario.verb}</Text>

        {isLoadingScenario ? (
          <ActivityIndicator size="small" color="#0066cc" style={styles.loading} />
        ) : (
          <Text style={styles.scenarioText}>
            {currentScenario.text || `Learn how to use "${currentScenario.verb}"`}
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRecognized}
            disabled={isLoadingScenario}
          >
            <Text style={styles.buttonText}>I Recognize It</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => loadScenarioText(currentScenario)}
            disabled={isLoadingScenario}
          >
            <Text style={styles.buttonTextSecondary}>Replay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Completed Verbs */}
      {completedCount > 0 && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>Learned:</Text>
          <View style={styles.verbsList}>
            {scenarios
              .filter((s) => s.completed)
              .map((s) => (
                <View key={s.verb} style={styles.verbBadge}>
                  <Text style={styles.verbBadgeText}>{s.verb}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  scenarioContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  verbLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 12,
  },
  scenarioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  loading: {
    marginVertical: 16,
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    marginTop: 24,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  verbsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verbBadge: {
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  verbBadgeText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 16,
  },
});
