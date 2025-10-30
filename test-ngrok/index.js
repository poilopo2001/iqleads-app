const http = require('http');
const ngrok = require('@ngrok/ngrok');

// Create webserver
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Congrats you have created an ngrok web server');
}).listen(8080, () => console.log('Node.js web server at 8080 is running...'));

// Get your endpoint online with hardcoded authtoken
ngrok.connect({
    addr: 8080,
    authtoken: '34mv93ERSZFBQOOYczfhBsJzIAA_6P6Hz6End7oVCxcqnvmZU'
})
.then(listener => console.log(`Ingress established at: ${listener.url()}`))
.catch(err => console.error('Error:', err));
