import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  IonImg,
  IonButton,
  IonModal,
  IonInput,
  IonLabel,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonItem
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import "../theme/variables.css";
import { enterAnimation, leaveAnimation } from '../theme/modalAnimation';
import { RouteComponentProps } from 'react-router';
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Stare pentru modal
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [newItemDate, setNewItemDate] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    const storedData = localStorage.getItem('fetchedData');
    if (storedData) {
      setLocalItems(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      const updatedItems = [...localItems, ...items.filter(item => !localItems.some(i => i.id === item.id))];
      setLocalItems(updatedItems);
      localStorage.setItem('fetchedData', JSON.stringify(updatedItems));
    }
  }, [items]);

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

  const handleLogout = () => {
    logout?.();
    localStorage.removeItem('authToken');
    history.push('/login');
  };

  const handleDeleteItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setLocalItems(prevItems => prevItems.filter(item => item.id !== id));
    localStorage.setItem('fetchedData', JSON.stringify(localItems.filter(item => item.id !== id)));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      description: newItemDescription,
      quantity: newItemQuantity,
      date: newItemDate,
      closed: false,
    };

    setLocalItems(prevItems => [...prevItems, newItem]);
    localStorage.setItem('fetchedData', JSON.stringify([...localItems, newItem]));
    setIsModalOpen(false); // Închide modalul după adăugare
  };

  const itemsToFilter = localItems.length > 0 ? localItems : items || [];
  const filteredItems = itemsToFilter.filter(item => {
    const matchesSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus ? (filterStatus === 'closed' ? item.closed : !item.closed) : true;

    return matchesSearch && matchesStatus;
  });

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle style={{ textAlign: 'center' }}>Cofetarie</IonTitle>
            <IonButton slot="end" onClick={handleLogout}>Logout</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={fetching} message="Fetching items" />

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
                  <TransitionGroup component={null}>
                    {filteredItems.map(({ id, name, description, quantity, date, closed, photo }) => (
                        <CSSTransition key={id} timeout={300} classNames="fade" unmountOnExit>
                          <IonRow onClick={() => history.push(`/item/${id}`)} style={{ cursor: 'pointer' }}>
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
                            <IonCol>
                              {photo ? (
                                  <IonImg src={photo} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                              ) : (
                                  <IonLabel>No Image</IonLabel>
                              )}
                            </IonCol>
                            <IonCol>
                              <IonButton color="danger" onClick={(event) => handleDeleteItem(id, event)}>Delete</IonButton>
                            </IonCol>
                          </IonRow>
                        </CSSTransition>
                    ))}
                  </TransitionGroup>
                </IonGrid>
              </IonList>
          ) : (
              <div style={{ textAlign: 'center' }}>No items found</div>
          )}

          {loadingMore && <p>Loading more items...</p>}
          <div ref={observerRef} style={{ height: '1px' }} />

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setIsModalOpen(true)}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {/* Modal pentru adăugare item */}
          <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)} cssClass="my-custom-class">
            <IonHeader>
              <IonToolbar>
                <IonTitle>Add Item</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonInput
                  value={newItemName}
                  onIonChange={(e) => setNewItemName(e.detail.value!)}
                  placeholder="Item Name"
              />
              <IonInput
                  value={newItemDescription}
                  onIonChange={(e) => setNewItemDescription(e.detail.value!)}
                  placeholder="Item Description"
              />
              <IonInput
                  value={newItemQuantity}
                  onIonChange={(e) => setNewItemQuantity(Number(e.detail.value!))}
                  type="number"
                  placeholder="Item Quantity"
              />
              <IonInput
                  value={newItemDate}
                  onIonChange={(e) => setNewItemDate(e.detail.value!)}
                  type="date"
                  placeholder="Item Date"
              />
              <IonButton expand="full" onClick={handleAddItem}>Add Item</IonButton>
            </IonContent>
          </IonModal>
        </IonContent>
      </IonPage>
  );
};

export default ItemList;
