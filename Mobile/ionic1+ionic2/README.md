Cofetarie:

id?: string; (id-ul itemului)

name: string; (numele itemului)

description: string; (descrierea itemului)

quantity: number; (cantitatea fiecarui produs)

date: Date; (data de fabricare a fiecarui produs)

closed: boolean; (este cofetaria deschisa)


Ionic1 DONE

Assignments
Define the features of your apps (write them in README)
Implement a master-detail user interface
Use a REST service to fetch data
Use web sockets to receive server-side notifications



Ionic2

Assignments
Use the local storage for storing data fetched from server
Use lists with pagination (infinite scrolling)
Authenticate user using JWT
Use secured REST services
Use secured web sockets

Assessment
Show the network status (online/offline), 1p DONE
Authenticate users, 1p DONE
After login, app stores the auth token in local storage DONE
When app starts, the login page is not opened if the user is authenticated DONE
App allows users to logout DONE
Link the resource instances to the authenticated user, 1p
REST services return only the resources linked to the authenticated user
Web socket notifications are sent only if the modified resources are linked to the authenticated user
Online/offline behaviour, 2p DONE
In online mode, the app tries first to use the REST services when new items are created/updated DONE
In offline mode or if the REST calls fail, the app stores data locally DONE
Inform user about the items not sent to the server 
When entering the online mode, the app automatically tries to send data to the server, 1p
Use pagination, 2p
Use search & filter, 1p