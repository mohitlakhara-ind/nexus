async function testSave() {
  try {
    const res = await fetch('http://localhost:5000/api/graphs/69ad914d4153f516e8a237b4/save', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        // Missing token might return 401, but let's try
      },
      body: JSON.stringify({
        title: 'Test',
        nodes: [{ id: 'test-1', type: 'problem', position: {x:0,y:0}, data: { label: 'Test' } }],
        edges: [],
        viewport: {x:0,y:0,zoom:1}
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
  } catch (err) {
    console.log('Err:', err);
  }
}
testSave();
