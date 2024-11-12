import React, { memo } from 'react';
import { IonItem, IonLabel, IonCheckbox, IonInput } from '@ionic/react';
import { ItemProps } from './ItemProps';

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({ id, name, description, quantity, date, closed, onEdit }) => {
    // Formatează data pentru afișare
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{description}</IonLabel>
            <IonInput>{quantity}</IonInput>
            <IonLabel>{formattedDate}</IonLabel> {/* Afișează data formatată */}
            <IonCheckbox checked={!closed}></IonCheckbox>
        </IonItem>
    );
};

export default memo(Item);
