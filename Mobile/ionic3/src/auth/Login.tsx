import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';
import Pagination from '../Pagination';

const log = getLogger('Login');

interface LoginState {
  username?: string;
  password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const { isAuthenticated, isAuthenticating, login, logout, authenticationError } = useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const { username, password } = state;

  const handlePasswordChange = useCallback((e: any) => setState({
    ...state,
    password: e.detail.value || ''
  }), [state]);

  const handleUsernameChange = useCallback((e: any) => setState({
    ...state,
    username: e.detail.value || ''
  }), [state]);

  const handleLogin = useCallback(() => {
    log('handleLogin...');
    login?.(username, password);
  }, [username, password, login]);

  const handleLogout = useCallback(() => {
    log('handleLogout...');
    logout?.();
    history.push('/login'); // Redirect to login after logout
  }, [logout, history]);

  log('render');
  useEffect(() => {
    // Check if user is authenticated and redirect
    if (isAuthenticated) {
      log('redirecting to home');
      history.push('/'); // Redirect to home
    }
  }, [isAuthenticated, history]);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Token găsit în localStorage:', token);
    } else {
      console.log('Token nu este salvat în localStorage');
    }
  }, []);
  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {!isAuthenticated ? (
              <>
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={handleUsernameChange} />
                <IonInput
                    type="password"
                    placeholder="Password"
                    value={password}
                    onIonChange={handlePasswordChange} />
                <IonLoading isOpen={isAuthenticating} />
                {authenticationError && (
                    <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
              </>
          ) : (
              <IonButton onClick={handleLogout}>Logout</IonButton>
          )}
          <Pagination />
        </IonContent>
      </IonPage>
  );
};
