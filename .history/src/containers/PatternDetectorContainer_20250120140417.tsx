import { FC, useState, useCallback } from 'react';
import PatternDetector, { Pattern } from '../components/PatternDetector';

interface DetectionSettings {
  threshold: number;
  patternType: string;
  showStrength: boolean;
  highlightNodes: boolean;
  showConfidence: boolean;
}

const PatternDetectorContainer: FC = () => {
  const [, setSettings] = useState<DetectionSettings>({
    threshold: 0.7,
    patternType: 'resonance',
    showStrength: true,
    highlightNodes: true,
    showConfidence: true,
  });

  const [, setPatterns] = useState<Pattern[]>([]);

  const handlePatternDetected = useCallback((pattern: Pattern) => {
    setPatterns(prev => [...prev, pattern]);
    console.log('New pattern detected:', pattern);
  }, []);

  const handleThresholdChange = useCallback((threshold: number) => {
    setSettings(prev => ({
      ...prev,
      threshold,
    }));
    console.log('Detection threshold changed:', threshold);
  }, []);

  const handlePatternTypeChange = useCallback((type: string) => {
    setSettings(prev => ({
      ...prev,
      patternType: type,
    }));
    console.log('Pattern type changed:', type);
  }, []);

  return (
    <PatternDetector
      onPatternDetected={handlePatternDetected}
      onThresholdChange={handleThresholdChange}
      onPatternTypeChange={handlePatternTypeChange}
    />
  );
};

export default PatternDetectorContainer;
