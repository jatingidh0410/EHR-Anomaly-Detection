import { useState, useCallback } from 'react';

export type FillStrategy = 'random' | 'zero' | 'mean';

interface FeatureConfig {
  totalRequired: number;
  minValue: number;
  maxValue: number;
  fillStrategy: FillStrategy;
}

interface FeatureState {
  features: number[];
  originalCount: number;
  normalizedCount: number;
  status: string;
}

const DEFAULT_CONFIG: FeatureConfig = {
  totalRequired: 102,
  minValue: 0,
  maxValue: 1,
  fillStrategy: 'random',
};

export const normalizeFeaturesArray = (inputFeatures: number[], config: FeatureConfig): number[] => {
  const { totalRequired, minValue, maxValue, fillStrategy } = config;
  const normalizedFeatures = [...inputFeatures];

  // Calculate mean if needed
  const calculateMean = (features: number[]): number => {
    if (features.length === 0) return 0;
    const sum = features.reduce((a, b) => a + b, 0);
    return sum / features.length;
  };
  const meanValue = calculateMean(inputFeatures);

  // Generate feature helper
  const generateFeature = (): number => {
    switch (fillStrategy) {
      case 'zero':
        return 0;
      case 'mean':
        return meanValue;
      case 'random':
      default:
        return minValue + Math.random() * (maxValue - minValue);
    }
  };

  // Pad
  while (normalizedFeatures.length < totalRequired) {
    normalizedFeatures.push(generateFeature());
  }

  // Truncate
  if (normalizedFeatures.length > totalRequired) {
    normalizedFeatures.splice(totalRequired);
  }

  return normalizedFeatures;
};

export const useFeatureNormalization = (config: Partial<FeatureConfig> = {}) => {
  const [currentConfig, setCurrentConfig] = useState<FeatureConfig>({ ...DEFAULT_CONFIG, ...config });

  const updateConfig = (newConfig: Partial<FeatureConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...newConfig }));
  };
  
  const [state, setState] = useState<FeatureState>({
    features: [],
    originalCount: 0,
    normalizedCount: 0,
    status: 'Ready to normalize',
  });

  const normalizeFeatures = useCallback(
    (inputFeatures: number[]): number[] => {
      const normalizedFeatures = normalizeFeaturesArray(inputFeatures, currentConfig);

      setState({
        features: normalizedFeatures,
        originalCount: inputFeatures.length,
        normalizedCount: normalizedFeatures.length,
        status: `Processed ${inputFeatures.length} features → Normalized to ${normalizedFeatures.length}`,
      });

      return normalizedFeatures;
    },
    [currentConfig]
  );

  /**
   * Auto-fill from partially filled input
   */
  const autoFillFromPartial = useCallback(
    (partialFeatures: number[]): number[] => {
      return normalizeFeatures(partialFeatures);
    },
    [normalizeFeatures]
  );

  /**
   * Generate all random features (for blank predictions)
   */
  const generateAllRandom = useCallback((): number[] => {
    const randomFeatures = normalizeFeaturesArray([], { ...currentConfig, fillStrategy: 'random' });

    setState({
      features: randomFeatures,
      originalCount: 0,
      normalizedCount: randomFeatures.length,
      status: `Generated ${randomFeatures.length} features using ${currentConfig.fillStrategy} strategy`,
    });

    return randomFeatures;
  }, [currentConfig]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      features: [],
      originalCount: 0,
      normalizedCount: 0,
      status: 'Ready to normalize',
    });
  }, []);

  return {
    ...state,
    normalizeFeatures,
    autoFillFromPartial,
    generateAllRandom,
    reset,
    config: currentConfig,
    updateConfig, 
  };
};

export default useFeatureNormalization;
