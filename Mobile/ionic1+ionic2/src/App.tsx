import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { NetworkProvider } from './NetworkContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { ItemList } from './todo';
import { ItemProvider } from './todo/ItemProvider';
import ItemEdit from './todo/ItemEdit';
import { AuthProvider, Login, PrivateRoute } from './auth';

setupIonicReact();

import ItemSync from './todo/ItemSync'; // Import the sync component

const App: React.FC = () => {
    const [fetchedData, setFetchedData] = useState<any[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('fetchedData');
        if (storedData) {
            // If there is data in local storage, set it in state
            setFetchedData(JSON.parse(storedData));
        } else {
            // If not, fetch data from the server
            fetch('https://api.example.com/data') // Replace with your URL
                .then(response => response.json())
                .then(data => {
                    setFetchedData(data);
                    // Save the data in local storage
                    localStorage.setItem('fetchedData', JSON.stringify(data));
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }, []);

    return (
        <IonApp>
            <NetworkProvider>
                <ItemSync /> {/* Add the sync component here */}
                <IonReactRouter>
                    <IonRouterOutlet>
                        <AuthProvider>
                            <Route path="/login" component={Login} exact={true} />
                            <ItemProvider>
                                <PrivateRoute path="/items" component={ItemList} exact={true} />
                                <PrivateRoute path="/item" component={ItemEdit} exact={true} />
                                <PrivateRoute path="/item/:id" component={ItemEdit} exact={true} />
                            </ItemProvider>
                            <Route exact path="/" render={() => <Redirect to="/items" />} />
                        </AuthProvider>
                    </IonRouterOutlet>
                </IonReactRouter>
            </NetworkProvider>
        </IonApp>
    );
};

export default App;
