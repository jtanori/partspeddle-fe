import http from 'k6/http';
import { check, sleep, group } from 'k6';
import thresholds from './thresholds.json';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, 
    { duration: '3m', target: 50 }, 
    { duration: '1m', target: 0 },   
  ],
  thresholds: {
    http_req_duration: [`p(95)<${thresholds.p95_latency_ms}`],
    http_req_failed: [`rate<${thresholds.error_rate_threshold}`],
  },
};

export default function () {
  const url = __ENV.API_URL || 'http://localhost:3000';

  group('Simultaneous Search and Indexing', () => {
    // 50% chance to search
    if (Math.random() > 0.5) {
      const res = http.post(`${url}/api/search/parts`, JSON.stringify({ query: 'alternator' }));
      check(res, { 'search status 200': (r) => r.status === 200 });
    } else {
      // 50% chance to create a part (triggering index event)
      const res = http.post(`${url}/api/parts`, JSON.stringify({ title: 'New Part', price_mxn: 100 }));
      check(res, { 'create status 200/201': (r) => r.status === 200 || r.status === 201 });
    }
  });

  sleep(0.1);
}
