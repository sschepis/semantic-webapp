import { FC, useState, useCallback } from 'react';
import FieldConstructor from '../components/FieldConstructor';

interface FieldParameters {
  dimensions: number;
  coherence: number;
  baseFreq: number;
  harmonicCount: number;
}

const FieldConstructorContainer: FC = () => {
  const [, setParameters] = useState<FieldParameters>({
    dimensions: 512,
    coherence: 0.5,
    baseFreq: 10,
    harmonicCount: 3,
  });

  const handleParameterChange = useCallback((param: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
    console.log(`Parameter ${param} changed to ${value}`);
  }, []);

  const handleFieldCreated = useCallback((field: {
    id: string;
    dimensions: number;
    harmonics: number[];
    coherence: number;
  }) => {
    // Here we'll handle the field creation, potentially dispatching to a store
    // or passing to a parent component
    console.log('Field created:', field);
  }, []);

  return (
    <FieldConstructor
      onParameterChange={handleParameterChange}
      onFieldCreated={handleFieldCreated}
    />
  );
};

export default FieldConstructorContainer;
