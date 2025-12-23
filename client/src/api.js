/**
 * API client for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Improve a website idea prompt
 */
export async function improvePrompt(idea) {
    const response = await fetch(`${API_BASE_URL}/api/improve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to improve prompt');
    }

    return response.json();
}

/**
 * Health check
 */
export async function healthCheck() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
}

