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
    IonImg
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Capacitor Camera
import { Filesystem, Directory } from '@capacitor/filesystem';
import { NetworkContext } from '../NetworkContext';
import { ItemContext } from './ItemProvider';
import { ItemProps } from './ItemProps';
import { useHistory, useParams } from 'react-router-dom';
import MapComponent from "../MapComponent";

const ItemEdit: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const history = useHistory();
    const { items, saveItem } = useContext(ItemContext);
    const networkContext = useContext(NetworkContext);
    const isOnline = networkContext ? networkContext.isOnline : true;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [date, setDate] = useState<string>('');
    const [closed, setClosed] = useState(false);
    const [item, setItem] = useState<ItemProps>();
    const [photo, setPhoto] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number, lng: number }>({ lat: 37.7749, lng: -122.4194 }); // Locație implicită
    const [loading, setLoading] = useState<boolean>(false); // Stare pentru încărcare
    const [saveMessage, setSaveMessage] = useState<string | null>(null); // Mesaj de succes

    useEffect(() => {
        const currentItem = items.find(it => it.id === id);
        setItem(currentItem);
        if (currentItem) {
            setName(currentItem.name);
            setDescription(currentItem.description);
            setQuantity(currentItem.quantity);
            setDate(new Date(currentItem.date).toISOString());
            setClosed(currentItem.closed);
            setPhoto(currentItem.photo || null);
            setLocation(currentItem.location || { lat: 37.7749, lng: -122.4194 }); // Setează locația din item
        }
    }, [id, items]);

    const handleLocationSelect = (lat: number, lng: number) => {
        setLocation({ lat, lng }); // Actualizează locația
    };

    const handleSave = useCallback(() => {
        const editedItem: ItemProps = {
            id: item?.id,
            name,
            description,
            quantity,
            date: new Date(date),
            closed,
            photo,
            location, // Adaugă locația
        };

        if (saveItem) {
            saveItem(editedItem).then(() => {
                setSaveMessage("Item saved successfully!"); // Mesaj de succes
                setTimeout(() => setSaveMessage(null), 3000); // Ascunde mesajul după 3 secunde
                history.goBack();
            });
        }
    }, [item, saveItem, name, description, quantity, date, closed, photo, location, history]);

    const takePhoto = async () => {
        try {
            if (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNative) {
                const image = await Camera.getPhoto({
                    resultType: CameraResultType.DataUrl,
                    source: CameraSource.Camera,
                    quality: 100
                });
                setPhoto(image.dataUrl); // Salvează poza
            } else if (navigator.mediaDevices) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    setPhoto(dataUrl); // Setează poza capturată
                    stream.getTracks().forEach(track => track.stop());
                };
            } else {
                console.error('Camera is not available in this environment');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    const savePhotoToDevice = async () => {
        if (photo) {
            try {
                const data = photo.split(',')[1]; // elimină prefixul 'data:image/jpeg;base64,'

                const byteArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));
                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `${new Date().getTime()}.jpeg`; // Numele fișierului

                link.click();

                URL.revokeObjectURL(blobUrl);

                console.log('Photo saved to device');
            } catch (error) {
                console.error('Error saving photo:', error);
            }
        }
    };

    const uploadPhotoFromComputer = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setPhoto(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Page</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>Cancel</IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>Save</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Name"
                    value={name}
                    onIonChange={e => setName(e.detail.value || '')}
                />
                <IonInput
                    placeholder="Description"
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
                    onIonChange={e => setDate(e.detail.value || '')}
                    disabled={!isOnline}
                />
                <IonCheckbox
                    checked={!closed}
                    onIonChange={e => setClosed(!e.detail.checked)}
                    disabled={!isOnline}
                >
                    Is it open:
                </IonCheckbox>

                <IonButton onClick={takePhoto}>Take Photo</IonButton>
                <IonButton onClick={savePhotoToDevice} disabled={!photo}>Save Photo</IonButton>
                <IonButton>
                    <input type="file" accept="image/*" onChange={uploadPhotoFromComputer} />
                </IonButton>

                {photo && <IonImg src={photo} />} {/* Afișează poza dacă există */}

                {loading && <IonLoading isOpen={loading} message="Saving photo..." />} {/* Încărcare */}
                {saveMessage && <div>{saveMessage}</div>} {/* Mesaj de succes */}

                <MapComponent
                    onLocationSelect={handleLocationSelect}
                    initialLocation={[location.lat, location.lng]} // Setează locația inițială din `location` actualizat
                />


            </IonContent>
        </IonPage>
    );
};

export default ItemEdit;
