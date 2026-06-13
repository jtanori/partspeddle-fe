import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  // Targeting the search API with query parameters to hit the instrumented logic
  const res = http.get('http://localhost:3000/api/search/parts?q=alternator&makeId=Toyota&modelId=Tacoma&year=2019');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(0.5);
}
