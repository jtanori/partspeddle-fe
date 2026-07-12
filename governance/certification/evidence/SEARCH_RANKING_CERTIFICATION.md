# Search Ranking Certification (PR #2C.1)

## 1. Objective
Certify the deterministic behavior of the `RankingEngine` before integration into the `SpecificationCompiler` pipeline.

## 2. Acceptance Criteria
| Metric | Acceptance Criteria |
| :--- | :--- |
| **Top10 Overlap** | >= 95% vs Algolia Baseline |
| **Top20 Overlap** | >= 90% vs Algolia Baseline |
| **Count Parity** | 100% |
| **Facet Parity** | 100% |
| **Determinism** | 100% (Identical output on repeat runs) |

## 3. Methodology
1. Execute `RankingEngine.rank()` using the fixed query corpus.
2. Compare outputs against the `governance/certification/reports/search-parity-baseline.json` captured during the shadow-read phase.
3. Verify that `RankingExplanation` fields match the expected contribution patterns for top-ranked items.

## 4. Stability Guarantees
- Ranking logic is locked in `src/domain/specification/scgs/ranking/ranking.engine.ts`.
- Changes to ranking logic require a full re-run of this certification suite.
- Replay events (`RANKING_COMPUTED`) must be emitted for all test cases.
