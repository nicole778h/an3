const Koa = require('koa');
const http = require('http');
const WebSocket = require('ws');
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

// Crearea instanței Koa
const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });
const router = new Router();

// Configurarea middleware-urilor
app.use(bodyparser());
app.use(cors());

// Middleware pentru logging
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

// Middleware pentru gestionarea erorilor
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = { message: err.message || 'Unexpected error' };
        ctx.response.status = 500;
        console.error(err); // Log error in console
    }
});

// Clasa pentru Item
class Item {
    constructor({ id, name, description, quantity, date, version }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.date = date;
        this.version = version;
    }
}

// Inițializare items cu mai multe elemente pentru testare
const items = [];
for (let i = 0; i < 50; i++) { // creăm 50 de elemente în loc de 3
    items.push(new Item({
        id: `${i}`,
        name: `Name ${i}`,
        description: `Description ${i}`,
        quantity: i + 1,
        date: new Date(Date.now() + i * 1000 * 60 * 60),
        version: 1
    }));
}
let lastId = items.length ? parseInt(items[items.length - 1].id) : 0;

// Funcție de broadcast pentru WebSocket
const broadcast = data =>
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

// Endpoint pentru obținerea itemelor cu paginare
router.get('/api/item', ctx => {
    const page = parseInt(ctx.query.page) || 1; // pagina curentă
    const limit = parseInt(ctx.query.limit) || 10; // numărul de iteme per pagină
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / limit);

    ctx.response.body = {
        items: paginatedItems,
        totalPages: totalPages
    };
    ctx.response.status = 200;
});

// Endpoint pentru crearea unui nou item
// Endpoint pentru crearea unui nou item
router.post('/api/item', async ctx => {
    const { name, description, quantity } = ctx.request.body;

    // Validarea datelor primite
    if (!name || !description || quantity == null) {
        ctx.response.body = { message: 'Name, description, and quantity are required' };
        ctx.response.status = 400; // Bad Request
        return;
    }

    // Crearea unui nou item folosind clasa Item
    const newItem = new Item({
        id: `${++lastId}`, // Incrementăm lastId și îl folosim ca ID pentru noul item
        name,
        description,
        quantity,
        date: new Date(), // Setăm data curentă
        version: 1
    });

    // Adăugarea noului item în lista de item-uri
    items.push(newItem);

    // Răspuns de succes
    ctx.response.body = newItem;
    ctx.response.status = 201; // Created

    // Broadcast pentru WebSocket
    broadcast({ event: 'created', payload: { item: newItem } });
});


// Endpoint pentru actualizarea unui item
router.put('/api/item/:id', async ctx => {
    const id = ctx.params.id;
    const item = ctx.request.body;

    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
        ctx.response.body = { message: `Item with id ${id} not found` };
        ctx.response.status = 404; // Not Found
        return;
    }
    item.id = id;
    item.version = items[index].version + 1;
    items[index] = item;
    ctx.response.body = item;
    ctx.response.status = 200; // OK
    broadcast({ event: 'updated', payload: { item } });
});

// Endpoint pentru ștergerea unui item
router.del('/api/item/:id', ctx => {
    const id = ctx.params.id;
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        const item = items[index];
        items.splice(index, 1);
        ctx.response.status = 204; // No Content
        broadcast({ event: 'deleted', payload: { item } });
    } else {
        ctx.response.body = { message: `Item with id ${id} not found` };
        ctx.response.status = 404; // Not Found
    }
});

// Endpoint de autentificare
router.post('/api/auth/login', async ctx => {
    console.log('Received request for login');
    const { username, password } = ctx.request.body;
    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { message: 'Username and password are required' };
        return;
    }
    if (username === 'user' && password === 'pass') {
        ctx.status = 200;
        ctx.body = {
            token: 'dummy-token',
            redirectUrl: '/api/item'
        };
    } else {
        ctx.status = 401;
        ctx.body = { message: 'Invalid credentials' };
    }
});

// Aplică rutele
app.use(router.routes());
app.use(router.allowedMethods());

// Pornește serverul pe portul 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
app.use(cors({
    origin: '*',
}));
