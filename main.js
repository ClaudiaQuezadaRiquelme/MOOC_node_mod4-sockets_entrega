const user = require("./cmds_user.js");
const quiz = require("./cmds_quiz.js");
const favs = require("./cmds_favs.js");
const score = require("./cmds_score.js");
const readline = require('readline');

const net = require('net');
const port = (process.argv[2] || 8080);

let clients = []; // Array of connected clients

const server = net.createServer( (socket) => {
    clients.push(socket);         // add new client

	socket.on('end', function() {   // remove client
	    let i = clients.indexOf(socket);
	    clients.splice(i, 1);
	});

	socket.on('data', function(msg) {
      
	});

  socket.on('close', function() { // close client
    let i = clients.indexOf(socket);

  });

  const rl = readline.createInterface({
    input: socket, // process.stdin,
    output: socket, // process.stdout,
    prompt: "> "
  });

  rl.log = (msg) => {
    socket.write(msg + "\n");
    console.log(msg);  // Add log to rl interface
  }

  rl.questionP = function (string) {   // Add questionP to rl interface
    return new Promise ( (resolve) => {
      this.question(`  ${string}: `, (answer) => resolve(answer.trim()))
    })
  };
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    try{
      let cmd = line.trim()
  
      if      ('' ===cmd)   {}
      else if ('h' ===cmd)  { user.help(rl);}
  
      else if (['lu', 'ul', 'u'].includes(cmd)) { await user.list(rl);}
      else if (['cu', 'uc'].includes(cmd))      { await user.create(rl);}
      else if (['ru', 'ur', 'r'].includes(cmd)) { await user.read(rl);}
      else if (['uu'].includes(cmd))            { await user.update(rl);}
      else if (['du', 'ud'].includes(cmd))      { await user.delete(rl);}
  
      else if (['lq', 'ql', 'q'].includes(cmd)) { await quiz.list(rl);}
      else if (['cq', 'qc'].includes(cmd))      { await quiz.create(rl);}
      else if (['tq', 'qt', 't'].includes(cmd)) { await quiz.test(rl);}
      else if (['uq', 'qu'].includes(cmd))      { await quiz.update(rl);}
      else if (['dq', 'qd'].includes(cmd))      { await quiz.delete(rl);}
  
      else if (['lf', 'fl', 'f'].includes(cmd)) { await favs.list(rl);}
      else if (['cf', 'fc'].includes(cmd))      { await favs.create(rl);}
      else if (['df', 'fd'].includes(cmd))      { await favs.delete(rl);}
  
      // Debe incluirse el nuevo comando p (play) que comienza una nueva ronda de preguntas.
      else if ('p'===cmd)  { await quiz.play(rl); }
  
      // las puntuaciones de los usuarios deben poder consultarse usando el comando ls (list score)
      else if ('ls'===cmd) {  await score.list(rl); }
  
      else if ('e'===cmd)  { socket.end(); rl.log('Bye!'); process.exit(0); }
      else                 {  rl.log('UNSUPPORTED COMMAND!');
                              user.help(rl);
                           };
    } catch (err) { rl.log(`  ${err}`);}
    finally       { rl.prompt(); }
  });
});



server.listen(port);
console.log("Quiz server at port: " + port);