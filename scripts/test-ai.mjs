// Quick test: hit the chat endpoint to verify Gemini is working
const body = JSON.stringify({
  messages: [{ role: 'user', content: 'Who should I reach out to today?' }]
});

async function test() {
  console.log('Testing Gemini AI integration...\n');
  
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      console.error('HTTP Error:', res.status, res.statusText);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullText += chunk;
      process.stdout.write(chunk);
    }

    console.log('\n\n---');
    console.log('Total chars received:', fullText.length);
    console.log('✅ AI integration is working!');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    console.log('Make sure the dev server is running (npm run dev)');
  }
}

test();
