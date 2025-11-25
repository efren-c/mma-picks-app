const API_KEY = process.env.RAPID_API_KEY;
const API_HOST = 'mma-stats.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

if (!API_KEY) {
    console.warn('RAPID_API_KEY is not set. API calls will fail.');
}

export async function getUpcomingEvents() {
    const url = `${BASE_URL}/events`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY!,
            'x-rapidapi-host': API_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Mock data for development if API fails or limit reached
export const MOCK_EVENTS = [
    {
        id: "mock-1",
        name: "UFC 310: Pantoja vs. Asakura",
        date: "2025-12-07T03:00:00.000Z",
        image: "https://www.theorychicago.com/wp-content/uploads/2024/12/UFC_12.7_710x375.png",
        fights: [
            { fighterA: "Alexandre Pantoja", fighterB: "Kai Asakura", order: 1 },
            { fighterA: "Shavkat Rakhmonov", fighterB: "Ian Machado Garry", order: 2 },
            { fighterA: "Ciryl Gane", fighterB: "Alexander Volkov", order: 3 },
        ]
    }
];
