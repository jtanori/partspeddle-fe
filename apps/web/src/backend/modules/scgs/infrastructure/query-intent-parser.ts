import type { SearchIntent, VehicleEntity } from '../domain/search-intent';

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

function looksLikeVin(token: string): boolean {
  // VIN is 17 chars, excludes I, O, Q (case-insensitive).
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(token);
}

function looksLikeOemPartNumber(token: string): boolean {
  // Common OEM patterns: alphanumeric with optional dashes/slashes, at least 6 chars,
  // and must contain at least one digit.
  return /^[A-Z0-9][A-Z0-9\-/]{4,}[A-Z0-9]$/i.test(token) && token.length >= 6 && /\d/.test(token);
}

function extractYear(input: string): number | undefined {
  const match = input.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : undefined;
}

function extractVehicle(input: string): VehicleEntity | undefined {
  const year = extractYear(input);
  // Heuristic: after the year, take the next two words as make and model.
  const withoutYear = input.replace(/\b(19|20)\d{2}\b/, ' ').trim();
  const tokens = withoutYear.split(/\s+/).filter(Boolean);

  if (tokens.length >= 2) {
    return { year, make: tokens[0], model: tokens.slice(1).join(' ') };
  }
  if (tokens.length === 1) {
    return { year, make: tokens[0] };
  }
  return year ? { year } : undefined;
}

function isYmm(input: string): boolean {
  return /\b(19|20)\d{2}\b/.test(input) && input.split(/\s+/).length >= 2;
}

export function parseQueryIntent(raw: string): SearchIntent {
  const normalized = normalize(raw);
  const singleToken = normalized.replace(/\s+/g, '');

  if (looksLikeVin(singleToken)) {
    return {
      type: 'VIN',
      raw: normalized,
      entities: { vin: singleToken.toUpperCase() },
    };
  }

  if (looksLikeOemPartNumber(singleToken) && normalized.split(/\s+/).length <= 2) {
    return {
      type: 'OEM_PART_NUMBER',
      raw: normalized,
      entities: { oemPartNumber: singleToken.toUpperCase() },
    };
  }

  if (isYmm(normalized)) {
    return {
      type: 'YMM',
      raw: normalized,
      entities: { vehicle: extractVehicle(normalized) },
    };
  }

  return {
    type: 'PART_NAME',
    raw: normalized,
    entities: { partName: normalized },
  };
}
