import { SearchSuggestion, SearchCommand } from '../types/search-types';
import { useRouter } from 'next/navigation';

export const useSearchCommandRegistry = () => {
  const router = useRouter();

  const registry: Record<string, SearchCommand> = {
    product: {
      type: 'product',
      execute: (s: SearchSuggestion) => router.push(`/listing/${s.id}`),
    },
    vehicle: {
      type: 'vehicle',
      execute: (s: SearchSuggestion) => router.push(`/search?${s.metadata as string}`),
    },
    system: {
      type: 'system',
      execute: (s: SearchSuggestion) =>
        router.push(`/search?system=${encodeURIComponent(s.label)}`),
    },
    part_type: {
      type: 'part_type',
      execute: (s: SearchSuggestion) =>
        router.push(`/search?partType=${encodeURIComponent(s.label)}`),
    },
    manufacturer: {
      type: 'manufacturer',
      execute: (s: SearchSuggestion) =>
        router.push(`/search?fitmentMake=${encodeURIComponent(s.label)}`),
    },
    vin: {
      type: 'vin',
      execute: (s: SearchSuggestion) => router.push(`/search?q=${encodeURIComponent(s.label)}`),
    },
    part_number: {
      type: 'part_number',
      execute: (s: SearchSuggestion) => router.push(`/search?q=${encodeURIComponent(s.label)}`),
    },
  };

  return {
    executeCommand: (suggestion: SearchSuggestion) => {
      const command = registry[suggestion.type];
      if (command) {
        command.execute(suggestion);
      }
    },
  };
};
