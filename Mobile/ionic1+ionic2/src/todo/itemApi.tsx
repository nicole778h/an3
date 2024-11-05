import axios from 'axios';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';

const log = getLogger('itemApi');

// Asigură-te că protocolul http:// este inclus
const baseUrl = 'http://localhost:3000';
const itemUrl = `${baseUrl}/api/item`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
      .then(res => {
        log(`${fnName} - succeeded`);
        return Promise.resolve(res.data);
      })
      .catch(err => {
        log(`${fnName} - failed`, err);
        return Promise.reject(err);
      });
}

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getItems: (page: number, limit: number) => Promise<{ items: ItemProps[]; totalPages: number }> = (page, limit) => {
  const url = `${itemUrl}?page=${page}&limit=${limit}`;
  return withLogs(axios.get(url, config), 'getItems')
      .then(response => ({
        items: response.items,          // Asigură-te că ai acces la response.data.items
        totalPages: response.totalPages, // Asigură-te că ai acces la response.data.totalPages
      }));
};

export const createItem: (item: ItemProps) => Promise<ItemProps> = async item => {
  const newItem = await withLogs(axios.post(itemUrl, item, config), 'createItem');
  // Adaugă noul item în localStorage
  const currentItems = JSON.parse(localStorage.getItem('fetchedData') || '[]');
  localStorage.setItem('fetchedData', JSON.stringify([...currentItems, newItem]));
  return newItem;
};


export const updateItem: (item: ItemProps) => Promise<ItemProps> = item => {
  return withLogs(axios.put(`${itemUrl}/${item.id}`, item, config), 'updateItem');
};

interface MessageData {
  event: string;
  payload: {
    item: ItemProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://localhost:3000`);
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  };
};
