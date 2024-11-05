import React, { useContext, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonButton,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { NetworkContext } from '../NetworkContext';
import { AuthContext } from '../auth/AuthProvider';

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError, getItems, currentPage, totalPages } = useContext(ItemContext);
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const network = useContext(NetworkContext);
  const { logout } = useContext(AuthContext);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 10; // Setează câte item-uri vrei să încarci pe pagină

  // La montarea componentului, verifică localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('fetchedData');
    if (storedData) {
      setLocalItems(JSON.parse(storedData));
    }
  }, []);

  // Monitorizează item-urile și actualizează localStorage
  useEffect(() => {
    if (items && items.length > 0) {
      // Adaugă noi item-uri la localItems, fără a suprascrie
      const updatedItems = [...localItems, ...items.filter(item => !localItems.some(i => i.id === item.id))];
      setLocalItems(updatedItems);
      localStorage.setItem('fetchedData', JSON.stringify(updatedItems));
    }
  }, [items]);

  // Infinite Scroll Logic
  useEffect(() => {
    const loadMoreItems = async () => {
      if (getItems && !loadingMore && currentPage < totalPages) {
        setLoadingMore(true);
        try {
          const newItems = await getItems(currentPage + 1, itemsPerPage);
          const updatedItems = [...localItems, ...newItems.items.filter(item => !localItems.some(i => i.id === item.id))];
          setLocalItems(updatedItems);
          localStorage.setItem('fetchedData', JSON.stringify(updatedItems));
        } catch (error) {
          log('Failed to load items', error);
        } finally {
          setLoadingMore(false);
        }
      }
    };

    const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && currentPage < totalPages) {
            loadMoreItems();
          }
        },
        { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [currentPage, totalPages, loadingMore, getItems]);

  // Log pagina curentă
  useEffect(() => {
    console.log(`Pagina curentă: ${currentPage}`);
  }, [currentPage]);

  // Filtrarea și căutarea item-urilor
  const itemsToFilter = localItems.length > 0 ? localItems : items || [];
  const filteredItems = itemsToFilter.filter(item => {
    const matchesSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus ? (filterStatus === 'closed' ? item.closed : !item.closed) : true;

    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    logout?.();
    localStorage.removeItem('authToken');
    history.push('/login');
  };

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle style={{ textAlign: 'center' }}>Cofetarie</IonTitle>
            <IonButton slot="end" onClick={handleLogout}>
              Logout
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={fetching} message="Fetching items" />

          {network && !network.isOnline && (
              <div style={{ textAlign: 'center', color: 'red' }}>
                You are currently offline. Some features may be unavailable.
              </div>
          )}

          {/* Afișează pagina curentă */}
          <div style={{ textAlign: 'center', margin: '10px' }}>
            <h4>Pagina curentă: {currentPage}</h4>
          </div>

          {/* Search Bar */}
          <IonSearchbar
              value={searchText}
              onIonChange={e => setSearchText(e.detail.value!)}
              placeholder="Search items..."
          />

          {/* Filter Options */}
          <IonItem>
            <IonLabel>Filter by status:</IonLabel>
            <IonSelect
                value={filterStatus}
                placeholder="Select Status"
                onIonChange={e => setFilterStatus(e.detail.value)}
            >
              <IonSelectOption value="closed">Closed</IonSelectOption>
              <IonSelectOption value="open">Open</IonSelectOption>
              <IonSelectOption value="">All</IonSelectOption>
            </IonSelect>
          </IonItem>

          {filteredItems.length > 0 ? (
              <IonList inset={true}>
                <IonItem>
                  <IonLabel>Name</IonLabel>
                  <IonLabel>Description</IonLabel>
                  <IonLabel>Quantity</IonLabel>
                  <IonLabel>Date</IonLabel>
                  <IonLabel>Available Status</IonLabel>
                </IonItem>
                <IonGrid>
                  {filteredItems.map(({ id, name, description, quantity, date, closed }, index) => (
                      <IonRow key={`${id}-${index}`} onClick={() => history.push(`/item/${id}`)} style={{ cursor: 'pointer' }}>
                        <IonCol>
                          <IonLabel>{name}</IonLabel>
                        </IonCol>
                        <IonCol>
                          <IonLabel>{description}</IonLabel>
                        </IonCol>
                        <IonCol>
                          <IonLabel>{quantity}</IonLabel>
                        </IonCol>
                        <IonCol>
                          <IonLabel>{new Date(date).toLocaleDateString()}</IonLabel>
                        </IonCol>
                        <IonCol>
                          <IonLabel>{closed ? 'Closed' : 'Open'}</IonLabel>
                        </IonCol>
                      </IonRow>
                  ))}
                </IonGrid>
              </IonList>
          ) : (
              <div style={{ textAlign: 'center' }}>No items found</div>
          )}
          {fetchingError && (
              <div>{fetchingError.message || 'Failed to fetch items'}</div>
          )}

          {/* Indicator pentru încărcare suplimentară */}
          {loadingMore && <p>Loading more items...</p>}

          {/* Observator pentru Infinite Scroll */}
          <div ref={observerRef} style={{ height: '1px' }} />

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push('/item')}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
  );
};

export default ItemList;
