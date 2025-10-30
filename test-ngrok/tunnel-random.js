const ngrok = require('@ngrok/ngrok');

// Create tunnel for Next.js app on port 3000 with random domain
ngrok.connect({
    addr: 3000,
    authtoken: '34mv93ERSZFBQOOYczfhBsJzIAA_6P6Hz6End7oVCxcqnvmZU',
    // Don't specify domain - let ngrok assign a random one
})
.then(listener => {
    console.log('\n=================================');
    console.log('Next.js App Public URL:');
    console.log(listener.url());
    console.log('=================================\n');
    console.log('Use this URL for your WordPress webhook!');
    console.log('Copy the full webhook URL with token from your IQLead dashboard');
    console.log('\nTunnel is active. Press Ctrl+C to stop.\n');

    // Keep the process running
    process.stdin.resume();
})
.catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
