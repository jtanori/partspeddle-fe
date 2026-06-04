import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '60s', target: 200 },
    { duration: '30s', target: 10 },
  ],
};

export default function () {
  http.get('http://localhost:3000/api/search?q=brake');
  sleep(1);
}
