const net = require('net');
const port = (process.argv[2] || 9000);

let clients = [];     // Array of connected clients

let server = net.createServer( (socket) => {
    clients.push(socket);          // add new client

	socket.on('end', function() {   // remove client
	    let i = clients.indexOf(socket);
	    clients.splice(i, 1);
	});

	socket.on('data', function(msg) {
	    
	});
});

server.listen(port);
console.log("Chat server at port: " + port);