import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import { createItem, getItems as fetchItems, newWebSocket, updateItem } from './itemApi';

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<void>;

export interface ItemsState {
  items?: ItemProps[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveItem?: SaveItemFn;
  getItems?: (page: number, limit: number) => Promise<{ items: ItemProps[]; totalPages: number }>; // Modificat pentru a reflecta tipul corect
  currentPage: number;
  pageSize: number;
  totalPages: number;
  changePage?: (page: number) => void;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: ItemsState = {
  fetching: false,
  saving: false,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const CHANGE_PAGE = 'CHANGE_PAGE';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState = (state, { type, payload }) => {
  switch (type) {
    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: true, fetchingError: null };

    case FETCH_ITEMS_SUCCEEDED:
      return {
        ...state,
        items: payload.items,
        fetching: false,
        totalPages: payload.totalPages,
        currentPage: payload.currentPage,
      };

    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };

    case CHANGE_PAGE:
      return {
        ...state,
        currentPage: payload.page,
      };

    case SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: true };

    case SAVE_ITEM_SUCCEEDED:
      const items = [...(state.items || [])];
      const item = payload.item;
      const index = items.findIndex(it => it.id === item.id);
      if (index === -1) {
        items.unshift(item);
      } else {
        items[index] = item;
      }
      return { ...state, items, saving: false };

    case SAVE_ITEM_FAILED:
      return { ...state, savingError: payload.error, saving: false };

    default:
      return state;
  }
};

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, fetching, fetchingError, saving, savingError, currentPage, totalPages } = state;

  const fetchAndSetItems = useCallback(async (page: number, limit: number): Promise<{ items: ItemProps[]; totalPages: number }> => {
    let canceled = false;
    try {
      log('fetchAndSetItems started');
      dispatch({ type: FETCH_ITEMS_STARTED });
      const { items, totalPages } = await fetchItems(page, limit); // Apel corect la funcția din itemApi
      log('fetchAndSetItems succeeded', items);
      if (!canceled) {
        dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items, totalPages, currentPage: page } });
      }
      return { items, totalPages }; // Returnează datele așteptate
    } catch (error) {
      log('fetchAndSetItems failed', error);
      if (!canceled) {
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
      }
      throw error; // Aruncă eroarea pentru a respecta tipul de returnare
    }
  }, []);

  const changePage = useCallback((page: number) => {
    dispatch({ type: CHANGE_PAGE, payload: { page } });
  }, [dispatch]);

  useEffect(() => {
    fetchAndSetItems(currentPage, state.pageSize);
  }, [currentPage, fetchAndSetItems]);

  useEffect(wsEffect, []);

  const value = {
    items,
    fetching,
    fetchingError,
    saving,
    savingError,
    saveItem: saveItemCallback,
    getItems: fetchAndSetItems, // Aici este corect acum
    pageSize: state.pageSize,
    currentPage,
    totalPages,
    changePage,
  };

  log('ItemProvider returns');

  return (
      <ItemContext.Provider value={value}>
        {children}
      </ItemContext.Provider>
  );

  async function saveItemCallback(item: ItemProps) {
    try {
      log('saveItem started', item);
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (item.id ? updateItem(item) : createItem(item));
      log('saveItem succeeded', savedItem);
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log('saveItem failed', error);
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) return;
      const { event, payload: { item }} = message;
      log(`ws message, item ${event}`, item);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    };
  }
};
