import { RequestMethod } from '@discordjs/rest';
import { env } from '@src/secrets.js';

const baseURL = 'https://uncivserver.xyz/api';

const apiFetch = (method: `${RequestMethod}`, path: string, data?: any) =>
  env.SYNC_TOKEN.get().then(token => {
    const config: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
      config.headers['Content-Type'] = 'application/json';
    }

    return fetch(`${baseURL}/${path}`, config);
  });

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
};
