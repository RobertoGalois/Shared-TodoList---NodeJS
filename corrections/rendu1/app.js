/* Les librairies */
let app = require('express')(),
    session = require('cookie-session'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'),
    bodyParser = require('body-parser'),
    urlencodedParser = bodyParser.urlencoded({ extended: false });


app.use(session({secret: 'todotopsecret'}))

    /* S'il n'y a pas de todolist dans la session, on en crée une vide sous forme d'array avant la suite */
    .use(function(req, res, next){
        if (typeof(req.session.todolist) == 'undefined') {
            req.session.todolist = [];
        }
        next();
    })


    // Chargement de la page index.html
    .get('/todo', function (req, res) {
        res.render('todo.ejs', {todolist: req.session.todolist});
    })

    /* On ajoute un élément à la todolist */
    .post('/todo/ajouter/', urlencodedParser, function(req, res) {

        let element = ent.encode(req.body.newtodo);

        if (element !== '') {
            req.session.todolist.push(element);
            io.sockets.emit('todolist', req.session.todolist); // La liste est transmise à tous les utilisateurs
        }

        res.redirect('/todo');
    })

    /* Supprime un élément de la todolist */
    .get('/todo/supprimer/:id', function(req, res) {

        let id = ent.encode(req.params.id);

        if (id !== '') {
            req.session.todolist.splice(id, 1);
            io.sockets.emit('todolist', req.session.todolist); // La liste est transmise à tous les utilisateurs
        }
        res.redirect('/todo');
    })

    /* On redirige vers la todolist si la page demandée n'est pas trouvée */
    .use(function(req, res){
        res.redirect('/todo');
    })

;

server.listen(8080);