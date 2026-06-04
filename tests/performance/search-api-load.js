import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to baseline
    { duration: '5m', target: 50 }, // Baseline load
    { duration: '1m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p95<300'], // SLA: p95 < 300ms
    http_req_failed: ['rate<0.001'], // SLA: error rate < 0.1%
  },
};

export default function () {
  const url = __ENV.API_URL || 'http://localhost:3000';
  const res = http.get(`${url}/api/search/parts?q=alternator`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
