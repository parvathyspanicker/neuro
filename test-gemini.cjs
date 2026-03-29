const https = require('https');

const listModels = async () => {
    const apiKey = 'AIzaSyCsOLuhhMLpmJoB-i6S7XzjzSYb3pszZu8';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Listing models...`);
    console.log(`URL: ${url}`);

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                console.log(`Status Code: ${res.statusCode}`);
                try {
                    const data = JSON.parse(responseBody);
                    if (data.models) {
                        console.log("Available Models:");
                        data.models.forEach(m => console.log(`- ${m.name}`));
                    } else {
                        console.log('Response Body:', responseBody);
                    }
                } catch (e) {
                    console.log('Response Body:', responseBody);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('Error:', error);
            resolve();
        });

        req.end();
    });
};

(async () => {
    await listModels();
})();
