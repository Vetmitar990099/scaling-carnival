const net = require('net');
const fs = require('fs');

let nextId = 0;

const server = net.createServer((socket) => {
  
  let id = nextId++;
  let originalId = nextId;
  console.log('Client '+id+' connected');
  clients[id] = socket;
  clientIds.push(id);

  Object.values(clients).forEach((client) => {
    if(client == socket){
        client.write("Your id is "+id)
    }
    else{
        client.write(`[${id}] joined the chat`);
        
    }
    
  });

  fs.appendFile('chat.log', `[${id}] joined the chat\n`, (err) => {
    if (err) throw err;
  });

  socket.on('data', (data) => {
    console.log(`ID:${id} ${data}`);
    going = true
    trim = data.toString().trim()
    if(trim == '/clientlist'){
      Object.values(clients).forEach((client) => {
        if(client == socket){
            fs.appendFile('chat.log', `${clientIds}\n`, (err) => {
              if (err) throw err;
          });
            client.write("Connected clients: "+clientIds);
            going = false
        }
      
    });
    }
    else if (trim.startsWith('/username')) {
      const newId = trim.split(' ')[1];
      console.log(`${newId}\n`)
      if (clientIds.includes(newId)) {
        socket.write(`ID "${newId}" is already taken`);
      } else {
        Object.values(clients).forEach((client) => {
          client.write(`[${id}] Has changed their name to [${newId}]`)
        });

        clientIds[clientIds.indexOf(id)] = newId;
        id = newId;
        
      }
      going = false
    }
    else if (trim.startsWith('/w')) {
      let [, recipient, ...message] = trim.split(' ')
      dummyclient = clientIds
      counter = 0
      exist = 0
      dummyclient.forEach(() => {
        dummyclient[counter] = dummyclient[counter].toString()
        if(dummyclient[counter] == recipient){
          exist++
        }
        counter++
        
      })
      if(exist == 1){
        index = dummyclient.indexOf(recipient)
        clients[index].write(`[${id}] whispers to you: ${message}`)
      }
      else{
        socket.write("Hey that person doesn't exist, its just your imagination")
      }
      going = false
    }
    else if (trim.startsWith('/kick')) {
      let [, recipient, message] = trim.split(' ')
      dummyclient = clientIds
      counter = 0
      exist = 0
      dummyclient.forEach(() => {
        dummyclient[counter] = dummyclient[counter].toString()
        if(dummyclient[counter] == recipient){
          exist++
        }
        counter++
        
      })
      if(exist == 1){
        index = dummyclient.indexOf(recipient)
        if(message = "BanHammer"){
          clients[index].write(`YOU'VE BEEN SMACKED!!!!!`)
          clients[index].destroy()
          
        }
        
      }
      else{
        socket.write("Hey that person doesn't exist, its just your imagination")
      }
      going = false
    }


    fs.appendFile('chat.log', `[${id}] ${data}`, (err) => {
        if (err) throw err;
    });
    if(going){
Object.values(clients).forEach((client) => {
  if(client !== socket){
      client.write(`[${id}] ${data}`);
  }

});
    }
    
  });

  socket.on('close', () => {
    console.log('Client '+id+' disconnected');

    delete clients[id];
    clientIds = clientIds.filter((clientId) => clientId !== id);

        fs.appendFile('chat.log', `[${id}] left the chat\n`, (err) => {
            if (err) throw err;
          });
    Object.values(clients).forEach((client) => {
      client.write(`[${id}] left the chat`);

    });
  });
});
const clients = {};
let clientIds = [];

server.listen(8000, () => {
  console.log('Server listening on port 8000');
});