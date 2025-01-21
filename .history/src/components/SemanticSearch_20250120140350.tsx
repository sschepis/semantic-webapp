import { FC, useState } from 'react';
import './SemanticSearch.css';

export interface SearchResult {
  id: string;
  relevance: number;
  content: string;
  context: string[];
  confidence: number;
}

export interface SemanticSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  relevanceThreshold: number;
  contextDepth: number;
  searchMode: 'semantic' | 'hybrid' | 'exact';
}

const SemanticSearch: FC<SemanticSearchProps> = ({
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    relevanceThreshold: 0.7,
    contextDepth: 2,
    searchMode: 'semantic',
  });

  return (
    <div className="semantic-search">
      <h2>Semantic Search</h2>

      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter your semantic query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button
            className="search-button"
            onClick={() => onSearch(query, filters)}
          >
            Search
          </button>
        </div>

        <div className="search-filters">
          <div className="filter-group">
            <h3>Search Parameters</h3>
            <div className="filter">
              <label>Relevance Threshold</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.relevanceThreshold}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    relevanceThreshold: Number(e.target.value)
                  }))
                }
              />
              <span className="value">{filters.relevanceThreshold}</span>
            </div>
            <div className="filter">
              <label>Context Depth</label>
              <select
                value={filters.contextDepth}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    contextDepth: Number(e.target.value)
                  }))
                }
              >
                <option value="1">Minimal</option>
                <option value="2">Moderate</option>
                <option value="3">Deep</option>
              </select>
            </div>
            <div className="filter">
              <label>Search Mode</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="searchMode"
                    value="semantic"
                    checked={filters.searchMode === 'semantic'}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        searchMode: e.target.value as 'semantic' | 'hybrid' | 'exact'
                      }))
                    }
                  />
                  Semantic
                </label>
                <label>
                  <input
                    type="radio"
                    name="searchMode"
                    value="hybrid"
                    checked={filters.searchMode === 'hybrid'}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        searchMode: e.target.value as 'semantic' | 'hybrid' | 'exact'
                      }))
                    }
                  />
                  Hybrid
                </label>
                <label>
                  <input
                    type="radio"
                    name="searchMode"
                    value="exact"
                    checked={filters.searchMode === 'exact'}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        searchMode: e.target.value as 'semantic' | 'hybrid' | 'exact'
                      }))
                    }
                  />
                  Exact Match
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="results-area">
        <div className="results-placeholder">
          Enter a query to see semantic search results
        </div>
      </div>

      <div className="visualization-area">
        <div className="visualization-placeholder">
          Result relationships will be visualized here
        </div>
      </div>
    </div>
  );
};

export default SemanticSearch;
