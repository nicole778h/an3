import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonDatetime,
  IonCheckbox,
  IonLoading,
  IonButtons,
  IonButton,
  IonToast,
} from '@ionic/react';
import { NetworkContext } from '../NetworkContext';
import { ItemContext } from './ItemProvider';
import { ItemProps } from './ItemProps';
import { useHistory, useParams } from 'react-router-dom';
import Pagination from '../Pagination';

const ItemEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { items = [], saving, savingError, saveItem, currentPage, totalPages, changePage } = useContext(ItemContext);

  const networkContext = useContext(NetworkContext);
  const isOnline = networkContext ? networkContext.isOnline : true;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState<string>('');
  const [closed, setClosed] = useState(false);
  const [item, setItem] = useState<ItemProps>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const currentItem = items.find(it => it.id === id);
    setItem(currentItem);
    if (currentItem) {
      setName(currentItem.name);
      setDescription(currentItem.description);
      setQuantity(currentItem.quantity);

      if (typeof currentItem.date === 'string') {
        const parsedDate = new Date(currentItem.date);
        setDate(parsedDate.toISOString());
      } else if (currentItem.date instanceof Date) {
        setDate(currentItem.date.toISOString());
      } else {
        setDate('');
      }

      setClosed(currentItem.closed);
    }
  }, [id, items]);

  const handleSave = useCallback(() => {
    if (!isOnline) {
      setToastMessage("You are offline. Item will be saved locally.");
      setShowToast(true);

      // Salvează local itemul modificat
      const unsyncedItems = JSON.parse(localStorage.getItem('unsyncedItems') || '[]');
      const editedItem: ItemProps = {
        id: item?.id,
        name,
        description,
        quantity,
        date: new Date(date).toISOString(), // Convertim în string
        closed,
      };

      unsyncedItems.push({ ...editedItem, unsynced: true });
      localStorage.setItem('unsyncedItems', JSON.stringify(unsyncedItems));

      return;
    }

    const editedItem: ItemProps = {
      id: item?.id,
      name,
      description,
      quantity,
      date: new Date(date), // Convertește înapoi în Date
      closed,
    };

    if (saveItem) {
      saveItem(editedItem)
          .then(() => {
            // Actualizează localStorage...
            const existingItems = JSON.parse(localStorage.getItem('fetchedData') || '[]');
            const updatedItems = existingItems.filter((it: ItemProps) => it.id !== editedItem.id);
            updatedItems.push(editedItem);
            localStorage.setItem('fetchedData', JSON.stringify(updatedItems));
            history.goBack();
          })
          .catch(error => {
            console.error("Error saving item:", error);
            setToastMessage('Item not synced. It will be saved locally.');
            setShowToast(true);

            // Salvează local itemul în caz de eroare
            const unsyncedItems = JSON.parse(localStorage.getItem('unsyncedItems') || '[]');
            unsyncedItems.push({ ...editedItem, unsynced: true });
            localStorage.setItem('unsyncedItems', JSON.stringify(unsyncedItems));
          });
    }
  }, [item, saveItem, name, description, quantity, date, closed, history, isOnline]);

  const handleCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle style={{ textAlign: 'center' }}>Edit Page</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={5000}
            onDidDismiss={() => setShowToast(false)}
        />
        <IonContent>
          <IonInput
              placeholder="name"
              value={name}
              onIonChange={e => setName(e.detail.value || '')}
          />
          <IonInput
              placeholder="description"
              value={description}
              onIonChange={e => setDescription(e.detail.value || '')}
          />
          <IonInput
              type="number"
              value={quantity}
              onIonChange={e => setQuantity(parseInt(e.detail.value!, 10) || 0)}
              min={0}
          />
          <IonDatetime
              value={date}
              onIonChange={e => {
                const value = e.detail.value;
                if (value && typeof value === 'string') { // Check if value is a string
                  setDate(value);
                }
              }}
              disabled={!isOnline}
          />
          <IonCheckbox
              checked={!closed}
              onIonChange={e => setClosed(!e.detail.checked)}
              disabled={!isOnline}
          >
            Is it open:
          </IonCheckbox>

          <IonLoading isOpen={saving} />

          {savingError && (
              <div>{savingError.message || 'Failed to save item'}</div>
          )}

          {/* Includem componenta Pagination */}
          <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              changePage={changePage}
          />

          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleCancel}>Cancel</IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>Save</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonContent>
      </IonPage>
  );
};

export default ItemEdit;
