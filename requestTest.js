import http from 'k6/http';
import { check } from 'k6';
export const options = {
    scenarios: {
        high_load: {
            executor: 'constant-arrival-rate',
            rate: 1000,
            timeUnit: '1s',
            duration: '60s',
            preAllocatedVUs: 500
        },
    },
};

export function setup() {
    const payload = JSON.stringify({
        email: 'user@email.com',
        password: 'password'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    const url = "http://localhost:3001/api/auth/login"

    const response = http.post(url, payload, params)

    if (response.status !== 201) {
        throw new Error(JSON.stringify(response));
    }
    check(response, {
        'Access token retrieved': (r) => r.status === 201,
    });

    const json = JSON.parse(response.body);
    return { accessToken: json.accessToken };
}
export default function (data) {
    const accessToken = data.accessToken;
    const participantIds = ['e0435c28-7ef1-4e05-9e7e-1f8fa29ff45f', '02a50075-8928-4361-9460-e777ea0f050e']
    const pollId = '483cabc0-e942-419a-92a8-6a532c38a14b'

    const randomIndex = Math.floor(Math.random() * participantIds.length); 
    const participantId = participantIds[randomIndex];

    const url = `http://localhost:3001/api/polls/${pollId}/vote`
    const payload = JSON.stringify({
        participantId
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    }

    const response = http.post(url, payload, params);

    check(response, {
        'Process vote with success': (r) => r.status === 201,
    });
}

