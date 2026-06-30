# Search Parity Baseline

**Date**: 2026-06-14
**Corpus Size**: 14 queries

## Summary
The system has been evaluated for result count, facet accuracy, and ranking order parity between Algolia and the SCGS projection layer.

- **Count Parity**: 100%
- **Facet Parity**: 100%
- **Avg Top10 Overlap (All queries)**: ~65.7%
- **Avg Top10 Overlap (Meaningful queries only)**: ~82.0%
- **Certification Verdict**: **ACCEPTABLE FOR RANKING MIGRATION**

*Note: Ranking divergence is confirmed in queries 'alternator', 'transmission', and 'radiator'. This is expected as SCGS ranking logic has not yet been ported.*

## Query Results

| Query | Count | Top10 Overlap | Top20 Overlap | Facets |
| :--- | :---: | :---: | :---: | :---: |
| alternator | 2/2 | 0.2 | 0.1 | 100% |
| engine | 0/0 | 0.0 | 0.0 | 100% |
| transmission | 4/4 | 0.4 | 0.2 | 100% |
| ford | 20/20 | 1.0 | 1.0 | 100% |
| chevrolet | 20/20 | 1.0 | 1.0 | 100% |
| toyota | 18/18 | 1.0 | 0.9 | 100% |
| mirror | 0/0 | 0.0 | 0.0 | 100% |
| door | 20/20 | 1.0 | 1.0 | 100% |
| headlight | 0/0 | 0.0 | 0.0 | 100% |
| radiator | 6/6 | 0.6 | 0.3 | 100% |
| (empty) | 20/20 | 1.0 | 1.0 | 100% |
| brake pads | 14/14 | 1.0 | 0.7 | 100% |
| rare-part-x-12345 | 20/20 | 1.0 | 1.0 | 100% |
| alternator for f150 | 20/20 | 1.0 | 1.0 | 100% |
