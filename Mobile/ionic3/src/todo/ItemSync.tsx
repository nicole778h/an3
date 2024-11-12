// ItemSync.tsx
import React, { useCallback, useContext, useEffect } from 'react';
import { NetworkContext } from '../NetworkContext';
import { ItemContext } from './ItemProvider';
import { ItemProps } from './ItemProps';

const ItemSync: React.FC = () => {
    const networkContext = useContext(NetworkContext);
    const { isOnline } = networkContext || { isOnline: false }; // Default to offline if context is undefined
    const { saveItem } = useContext(ItemContext);

    const syncUnsyncedItems = useCallback(async () => {
        const unsyncedItems: ItemProps[] = JSON.parse(localStorage.getItem('unsyncedItems') || '[]');

        if (unsyncedItems.length > 0) {
            for (const item of unsyncedItems) {
                try {
                    //await saveItem(item); // Attempt to save each unsynced item to the server
                    console.log(`Successfully synced item: ${item.id}`);

                    // If successful, remove the item from local storage (or handle it as needed)
                } catch (error) {
                    console.error("Error syncing item:", error);
                    // Handle error if needed (e.g., show a toast)
                }
            }

            // Clear unsynced items if all were successfully synced
            localStorage.setItem('unsyncedItems', JSON.stringify([]));
        }
    }, [saveItem]);

    useEffect(() => {
        if (isOnline) {
            syncUnsyncedItems(); // Sync items when the app goes online
        }
    }, [isOnline, syncUnsyncedItems]);

    return null; // This component doesn’t render anything
};

export default ItemSync;
