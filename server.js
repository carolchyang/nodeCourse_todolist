const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json'
};
const todos = [];

const requestListener = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  if(req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success',
      data: todos,
    }));
    res.end();
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        if(title !== undefined) {
          const todo = {
            title,
            id: uuidv4(),
          };
          todos.push(todo);
          
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: 'success',
            data: todos,
          }));
          res.end();
        } else {
          console.log('post 無 title');
          errorHandle(res);          
        }
      } catch(error) {
        console.log('post 程式碼異常');
        errorHandle(res);
      }
    });
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0;

    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success',
      data: todos,
    }));
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todos.findIndex( element => element.id === id);
    if (index !== -1) {
      todos.splice(index, 1);

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: 'success',
        data: todos,
      }));
      res.end();
    } else {
      console.log('delete 無此 id');
      errorHandle(res);
    }
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        const id = req.url.split('/').pop();
        const index = todos.findIndex( element => element.id === id);
          if(title !== undefined && index !== -1) {
            todos[index].title = title;
            
            res.writeHead(200, headers);
            res.write(JSON.stringify({
              status: 'success',
              data: todos,
            }));
            res.end();
          } else {
            console.log('patch 無此 id 或 無 title');
            errorHandle(res);      
          }
      } catch(error) {
        console.log('patch 程式碼錯誤');
        errorHandle(res);
      }
    });
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      status: 'false',
      message: '此網站無此路由',
    }));
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
