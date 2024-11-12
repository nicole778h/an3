import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

//const authUrl = `http://${baseUrl}/api/auth/login`;
//const authUrl = `http://${baseUrl}/auth/login`;
const authUrl = `http://localhost:3000/api/auth/login`;
//const authUrl = `${baseUrl}/api/auth/login`;


export interface AuthProps {
  token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  return withLogs(axios.post(authUrl, { username, password }, config), 'login');
}
