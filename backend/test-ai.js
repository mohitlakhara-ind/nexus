
async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Hello',
        history: [],
        mapContext: { nodes: [], edges: [] },
        graphId: '69ad2654ee091f4e3bc0db12' // Valid ID from screenshot
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', data);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

test();
