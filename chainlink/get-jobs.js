const http = require('http');

module.exports = async () => {
  return getJobID(await getSessionCookie());
};

function getSessionCookie() {
  return new Promise((resolve, reject) => {
    const opts = {
      host: 'localhost',
      port: '6688',
      path: '/sessions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(opts, (res) => {
      res.setEncoding('utf-8');
      
      res.on('data', () => { /* DO NOTHING */ });
      res.on('end', () => {
        resolve(res.headers["set-cookie"][0]);
      });

      res.on('error', (err) => {
        reject(err);
      });
    });

    const reqBody = JSON.stringify({
      email: 'user@example.com',
      password: 'password'
    });

    req.write(reqBody);
    req.end();
  });
}

function getJobID(sessionCookie) {
  return new Promise((resolve, reject) => {
    const opts = {
      host: 'localhost',
      port: '6688',
      path: '/v2/jobs',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };
    
    const req = http.request(opts, (res) => {
      res.setEncoding('utf-8')
      
      let resBody = '';
      res.on('data', (chunk) => {
        resBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(resBody).data);
      });

      res.on('error', (err) => {
        reject(err);
      });
    });

    req.end();
  });
}
