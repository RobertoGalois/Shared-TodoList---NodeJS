// on inclue les librairies qui vont bien
let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent');

// on prépare un tableau pour stocker les taches
let tachesTab = [];

// on envoie la page todo.html
app.get('/todo',function(req,res){
    res.sendFile(__dirname + '/todo.html');
})
.get('/', function(req,res){
    res.redirect('/todo');
});

// quand un client se connecte
io.sockets.on('connection',function(socket){

    // on lui envoie la liste complète en mémoire
    socket.emit('touteLaListe',tachesTab);

    // on écoute les ajouts de tâche
    socket.on('nouvelle_tache', nouvelleTache => {
        // ajout de la tâche
        tachesTab.push(ent.encode(nouvelleTache));
        // on broadcast la nouvelle tache à tous les users
        socket.broadcast.emit('nouvelle_tache',{id: (tachesTab.length)-1, tache: nouvelleTache});
        // on envoie la nouvelle tache et son numéro au créateur de la tâche (pour qu'il gère bien la suppression du tableau avec le bon indice)
        socket.emit('nouvelle_tache',{id: (tachesTab.length)-1, tache: nouvelleTache});
    });

    // on écoute les suppressions de tâche
    socket.on('supprimer_tache', id =>{
        tachesTab.splice(id,1);
        // on broadcast la nouvelle liste complète
        socket.broadcast.emit('touteLaListe',tachesTab);
        // on l'envoie aussi à la session qui a fait la suppression (c'est plus simple :))
        socket.emit('touteLaListe',tachesTab);
    })
});
server.listen(8080);