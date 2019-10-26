const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent');

const title = 'Todolist socket.io'
let todolist = [];
let pseudolist = [];

/* On utilise les sessions */
app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.render(__dirname + '/index.ejs', { title: title });
})
  /* On redirige vers la todolist si la page demandée n'est pas trouvée */
  .use(function (req, res, next) {
    res.redirect('/');
  })

io.sockets.on('connection', function (socket) {

  socket.emit('todolist', todolist)
  socket.emit('pseudolist', pseudolist)
  socket.pseudo = ''

  socket.on('add_pseudo', function (pseudo) {
    if (pseudo) {
      socket.pseudo = pseudo
      pseudolist.push(ent.encode(pseudo))
      console.log(pseudo + ' se connecte')
    }
    socket.broadcast.emit('pseudolist', pseudolist);
  });

  socket.on('add_todo', function (todo) {
    if (todo) {
      todolist.push(ent.encode(todo))
      console.log('new toto', todo)
    }
    socket.broadcast.emit('todolist', todolist);
  });

  socket.on('remove_todo', function (index) {
    todolist.splice(index, 1);
    console.log('remove toto', index)
    socket.broadcast.emit('todolist', todolist);
  });

});

server.listen(8080);