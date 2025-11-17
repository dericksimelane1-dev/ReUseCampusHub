// routes/items.test.js
jest.mock('multer', () => {
    const fn = () => ({ single: () => (req, res, next) => next() });
    fn.memoryStorage = () => ({});
    return fn;
});
const mockQuery = jest.fn();
jest.mock('../db.js', () => ({ query: (...args) => mockQuery(...args) }));
const mockVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({ verify: (...args) => mockVerify(...args) }));
const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();
jest.mock('axios', () => ({ get: (...args) => mockAxiosGet(...args), post: (...args) => mockAxiosPost(...args) }));
const mockUpdatePoints = jest.fn();
jest.mock('../routes/updatePoints.js', () => mockUpdatePoints);

let router;

beforeAll(async () => {
    // import after mocks are declared
    const mod = await import('./items.js');
    router = mod.default;
});

beforeEach(() => {
    jest.clearAllMocks();
});

function getRouteHandler(router, path, method, pickLast = false) {
    const layers = router.stack.filter((l) => l.route && l.route.path === path);
    if (!layers.length) throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
    const route = layers[0].route;
    const matches = route.stack.filter((s) => s.method === method.toLowerCase());
    if (!matches.length) throw new Error(`Handler for ${method.toUpperCase()} ${path} not found`);
    return pickLast ? matches[matches.length - 1].handle : matches[0].handle;
}

function makeRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
}

test('GET / returns items joined with poster_name', async () => {
    mockQuery.mockImplementationOnce(() =>
        Promise.resolve({ rows: [{ id: 1, title: 'Item1', poster_name: 'Bob' }] })
    );
    const handler = getRouteHandler(router, '/', 'get');
    const req = {};
    const res = makeRes();
    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, title: 'Item1', poster_name: 'Bob' }]);
});

test('GET /items returns items with exchange status', async () => {
    mockQuery.mockImplementationOnce(() =>
        Promise.resolve({ rows: [{ id: 2, title: 'Item2', status: 'completed' }] })
    );
    const handler = getRouteHandler(router, '/items', 'get');
    const req = {};
    const res = makeRes();
    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 2, title: 'Item2', status: 'completed' }]);
});

test('GET /:id/image returns image when found', async () => {
    const buf = Buffer.from('pngdata');
    mockQuery.mockImplementationOnce(() => Promise.resolve({ rows: [{ image: buf }] }));
    const handler = getRouteHandler(router, '/:id/image', 'get');
    const req = { params: { id: '5' } };
    const res = makeRes();
    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.send).toHaveBeenCalledWith(buf);
});

test('GET /:id/image returns 404 when not found', async () => {
    mockQuery.mockImplementationOnce(() => Promise.resolve({ rows: [] }));
    const handler = getRouteHandler(router, '/:id/image', 'get');
    const req = { params: { id: '999' } };
    const res = makeRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Image not found');
});

test('POST / creates item, awards points, and returns 201', async () => {
    mockVerify.mockImplementationOnce(() => ({ id: 1 }));
    mockQuery
        .mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 42 }] })) // insert
        .mockImplementationOnce(() => Promise.resolve({ rows: [{ full_name: 'Alice' }] })); // lookup full_name
    const handler = getRouteHandler(router, '/', 'post', true); // pick last handler (after multer)
    const req = {
        headers: { authorization: 'Bearer token' },
        body: { title: 'T', description: 'D', location: 'L', exchangeCondition: 'C', category: 'cat' },
        file: { buffer: Buffer.from('img') },
    };
    const res = makeRes();
    await handler(req, res);
    expect(mockQuery).toHaveBeenCalled();
    expect(mockUpdatePoints).toHaveBeenCalledWith('Alice', 2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item posted successfully', itemId: 42 });
});

test('POST / returns 401 if token missing', async () => {
    const handler = getRouteHandler(router, '/', 'post', true);
    const req = { headers: {}, body: {} };
    const res = makeRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
});

test('POST / returns 401 on TokenExpiredError', async () => {
    mockVerify.mockImplementationOnce(() => { const e = new Error('expired'); e.name = 'TokenExpiredError'; throw e; });
    const handler = getRouteHandler(router, '/', 'post', true);
    const req = { headers: { authorization: 'Bearer t' }, body: {} };
    const res = makeRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Session expired. Please log in again.' });
});

test('POST / returns 403 on invalid token', async () => {
    mockVerify.mockImplementationOnce(() => { throw new Error('invalid'); });
    const handler = getRouteHandler(router, '/', 'post', true);
    const req = { headers: { authorization: 'Bearer bad' }, body: {} };
    const res = makeRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
});

test('GET /recommendations proxies token and returns external data', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { recs: [1, 2, 3] } });
    const handler = getRouteHandler(router, '/recommendations', 'get');
    const req = { headers: { authorization: 'Bearer tok' } };
    const res = makeRes();
    await handler(req, res);
    expect(mockAxiosGet).toHaveBeenCalledWith('http://localhost:5001/recommendations', {
        headers: { Authorization: `Bearer tok`.split(' ')[0] === 'Bearer' ? `Bearer tok` : `Bearer tok` }, // kept generic
    });
    expect(res.json).toHaveBeenCalledWith({ recs: [1, 2, 3] });
});

test('GET /recommendations returns 401 when token missing', async () => {
    const handler = getRouteHandler(router, '/recommendations', 'get');
    const req = { headers: {} };
    const res = makeRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing token' });
});

test('POST /nearby proxies coordinates and returns external data', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: { nearby: [9, 8] } });
    const handler = getRouteHandler(router, '/nearby', 'post');
    const req = { body: { latitude: 1.1, longitude: 2.2 } };
    const res = makeRes();
    await handler(req, res);
    expect(mockAxiosPost).toHaveBeenCalledWith('http://localhost:5000/nearby', { latitude: 1.1, longitude: 2.2 });
    expect(res.json).toHaveBeenCalledWith({ nearby: [9, 8] });
});