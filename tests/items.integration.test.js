const request = require('supertest');
const app = require('../app'); // Express app
const db = require('../testdb');

describe('Items Module Integration', () => {
  let newItemId;

  afterAll(async () => {
    if (newItemId) {
      await db.query('DELETE FROM items WHERE id = $1', [newItemId]);
    }
    await db.end();
  });

  test('User posts item → Item saved in DB', async () => {
    const itemData = {
      title: 'Laptop Bag',
      description: 'Durable and stylish',
      category: 'Accessories',
      user_id: 1
    };

    const response = await request(app)
      .post('/api/items')
      .send(itemData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(itemData.title);

    newItemId = response.body.id;

    const dbItem = await db.query('SELECT * FROM items WHERE id = $1', [newItemId]);
    expect(dbItem.rows[0].title).toBe(itemData.title);
  });

  test('Item appears in search results', async () => {
    const searchResponse = await request(app)
      .get('/api/items/search?query=Laptop')
      .expect(200);

    const foundItem = searchResponse.body.find(item => item.id === newItemId);
    expect(foundItem).toBeDefined();
    expect(foundItem.title).toContain('Laptop');
  });
});