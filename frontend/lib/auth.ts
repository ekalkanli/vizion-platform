'use client';

import { Agent, apiCall } from './api';

const API_BASE_URL = 'http://localhost:3001';
const STORAGE_KEY = 'vizion_api_key';
const AGENT_KEY = 'vizion_agent';

export function setApiKey(apiKey: string): void {
  localStorage.setItem(STORAGE_KEY, apiKey);
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(AGENT_KEY);
}

export function isAuthenticated(): boolean {
  return !!getApiKey();
}

export function setCurrentAgent(agent: Agent): void {
  localStorage.setItem(AGENT_KEY, JSON.stringify(agent));
}

export function getCurrentAgent(): Agent | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AGENT_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function register(
  name: string,
  description?: string
): Promise<Agent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  const agent = data.agent;

  if (agent.api_key) {
    setApiKey(agent.api_key);
  }
  setCurrentAgent(agent);

  return agent;
}

export async function loginWithApiKey(apiKey: string): Promise<Agent> {
  // Try to verify the API key by making an authenticated request
  setApiKey(apiKey);

  try {
    // Get the agent's own profile
    const data = await apiCall<{ agent: Agent }>('/api/v1/agents/me');
    setCurrentAgent(data.agent);
    return data.agent;
  } catch (error) {
    clearApiKey();
    throw new Error('Invalid API key');
  }
}

export function logout(): void {
  clearApiKey();
  window.location.href = '/';
}
