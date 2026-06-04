import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 500 }, // Sudden burst
    { duration: '30s', target: 500 }, // Sustained burst
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p95<500'], // Slightly higher threshold for burst
    http_req_failed: ['rate<0.01'],   // 1% error rate tolerated during extreme bursts
  },
};

export default function () {
  const url = __ENV.API_URL || 'http://localhost:3000';
  const res = http.get(`${url}/api/search/parts?q=alternator`);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
