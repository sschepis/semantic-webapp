import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import WelcomePage from './components/WelcomePage';
import QuantumNetworkGeneratorContainer from './containers/QuantumNetworkGeneratorContainer';
import FieldConstructorContainer from './containers/FieldConstructorContainer';
import TemporalNetworkAnalyzerContainer from './containers/TemporalNetworkAnalyzerContainer';
import QuantumStateVisualizerContainer from './containers/QuantumStateVisualizerContainer';
import PatternDetectorContainer from './containers/PatternDetectorContainer';
import SemanticSearchContainer from './containers/SemanticSearchContainer';
import QuantumQueryContainer from './containers/QuantumQueryContainer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <WelcomePage />,
      },
      {
        path: 'generate',
        children: [
          {
            path: 'network',
            element: <QuantumNetworkGeneratorContainer />,
          },
          {
            path: 'fields',
            element: <FieldConstructorContainer />,
          },
        ],
      },
      {
        path: 'analyze',
        children: [
          {
            path: 'temporal',
            element: <TemporalNetworkAnalyzerContainer />,
          },
          {
            path: 'quantum',
            element: <QuantumStateVisualizerContainer />,
          },
          {
            path: 'patterns',
            element: <PatternDetectorContainer />,
          },
        ],
      },
      {
        path: 'query',
        children: [
          {
            path: 'semantic',
            element: <SemanticSearchContainer />,
          },
          {
            path: 'quantum',
            element: <QuantumQueryContainer />,
          },
        ],
      },
    ],
  },
]);
