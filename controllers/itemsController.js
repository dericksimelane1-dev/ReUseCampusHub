export const getItems = (req, res) => {
  res.json([
    { id: 1, name: 'Laptop' },
    { id: 2, name: 'Monitor' },
    { id: 3, name: 'Keyboard' }
  ]);
};