// src/services/SearchAnalyticsService.ts

export const SearchAnalyticsService = {
  logSearchExecuted: (query: string, filters: any) => {
    fetch('/api/search/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SEARCH_EXECUTED',
        payload: { query, filters, timestamp: new Date().toISOString() }
      })
    }).catch(console.error);
  },

  logResultClicked: (partId: string, query: string, position: number) => {
    fetch('/api/search/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'RESULT_CLICKED',
        payload: { partId, query, position, timestamp: new Date().toISOString() }
      })
    }).catch(console.error);
  },

  logFilterApplied: (filterType: string, value: any) => {
    fetch('/api/search/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'FILTER_APPLIED',
        payload: { filterType, value, timestamp: new Date().toISOString() }
      })
    }).catch(console.error);
  }
};
