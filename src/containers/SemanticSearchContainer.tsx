import { FC, useState, useCallback } from 'react';
import SemanticSearch, { SearchResult } from '../components/SemanticSearch';

interface SearchState {
  results: SearchResult[];
  isSearching: boolean;
  selectedResult: string | null;
}

const SemanticSearchContainer: FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    isSearching: false,
    selectedResult: null,
  });

  const handleSearch = useCallback((query: string, filters: {
    relevanceThreshold: number;
    contextDepth: number;
    searchMode: 'semantic' | 'hybrid' | 'exact';
  }) => {
    setSearchState(prev => ({ ...prev, isSearching: true }));
    
    // Here we'll implement the actual search logic
    // For now, just log the search parameters
    console.log('Performing search with:', {
      query,
      filters,
    });

    // Simulate search completion
    setTimeout(() => {
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: [
          {
            id: '1',
            relevance: 0.95,
            content: 'Sample search result',
            context: ['Related context 1', 'Related context 2'],
            confidence: 0.89,
          },
        ],
      }));
    }, 1000);
  }, []);

  const handleResultSelect = useCallback((resultId: string) => {
    setSearchState(prev => ({
      ...prev,
      selectedResult: resultId,
    }));
    console.log('Selected result:', resultId);
  }, []);

  return (
    <SemanticSearch
      onSearch={handleSearch}
      onResultSelect={handleResultSelect}
    />
  );
};

export default SemanticSearchContainer;
