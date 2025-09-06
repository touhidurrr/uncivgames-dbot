import { RequestMethod } from '@discordjs/rest';
import { env } from '@src/secrets.js';

const MAX_RETRIES = 5;
const BASE_URL = 'https://uncivserver.xyz/api';
const JWT_NAME = 'uncivgames-dbot';
const JWT_BASE_URL = 'https://uncivserver.xyz/jwt';

let jwtToken: string | null = null;

const getJWTToken = async (): Promise<string | Response> => {
  const syncToken = await env.SYNC_TOKEN.get();

  const url = `${JWT_BASE_URL}/${JWT_NAME}`;
  const config = {
    headers: {
      Authorization: `Bearer ${syncToken}`,
    },
  };

  let retries = 0;
  let res = await fetch(url, config);
  while (retries < MAX_RETRIES) {
    res = await fetch(url, config);

    if (!res.ok) {
      retries++;
      continue;
    }

    return res.text();
  }

  return res;
};

const apiFetch = async (
  method: `${RequestMethod}`,
  path: string,
  data?: any
) => {
  if (!jwtToken) {
    const token = await getJWTToken();
    if (typeof token !== 'string') return token;
    jwtToken = token;
  }

  const config: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
    config.headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}/${path}`, config);
  if (res.status === 401) {
    const token = await getJWTToken();
    if (typeof token !== 'string') return token;
    jwtToken = token;

    config.headers['Authorization'] = `Bearer ${jwtToken}`;
    return fetch(`${BASE_URL}/${path}`, config);
  }
  return res;
};

export type APIGame = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  currentPlayer?: string;
  name?: string;
  turns?: number;
};

export type APIProfile = {
  _id: string;
  games: {
    won: number;
    lost: number;
    played: number;
    winPercentage: number | null;
  };
  rating: number | null;
  uncivUserIds: string[];
  notifications: 'enabled' | 'disabled';
  dmChannel?: string;
  createdAt: string;
  updatedAt: string;
};

export const api = {
  getGameName: (gameId: string) => apiFetch('GET', `games/${gameId}/name`),
  clearGameName: (gameId: string) => apiFetch('DELETE', `games/${gameId}/name`),
  setGameName: (gameId: string, name: string) =>
    apiFetch('POST', `games/${gameId}/name`, { name }),

  getProfile: (id: string) => apiFetch('GET', `profiles/${id}`),
  getUserProfileId: (userId: string) =>
    apiFetch('GET', `users/${userId}/profileId`),

  getGamesByProfile: (
    id: string,
    options: { playing?: boolean; limit?: number } = {}
  ) => {
    const qs = new URLSearchParams();
    if (options.playing) qs.append('playing', 'true');
    if (options.limit) qs.append('limit', options.limit.toString());
    return apiFetch('GET', `profiles/${id}/games?${qs.toString()}`);
  },

  setNotificationStatus: (profileId: string, status: 'enabled' | 'disabled') =>
    apiFetch('POST', `profiles/${profileId}/notifications`, { status }),

  addUserIdToProfile: (profileId: string, userId: string) =>
    apiFetch('POST', `profiles/${profileId}/uncivUserIds`, { userId }),
  removeUserIdToProfile: (profileId: string, userId: string) =>
    apiFetch('DELETE', `profiles/${profileId}/uncivUserIds`, { userId }),

  filterUnregisteredUserIds: (userIds: string[]) =>
    apiFetch('POST', `filterUnregisteredUserIds`, { userIds }),
};
