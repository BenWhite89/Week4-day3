let http = require('http');
let fs = require('fs');
let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let mysql = require('mysql');

let app = express();

let pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'pippin',
    database: 'Chirper'
});

function countArguments(array) {
    if (array.length == 0) {
        return '';
    } else {
        let op = '?';
        for (i=1; i < array.length; i++) {
            op += ',?';
        };
        return op;
    }
}

function modifyChirps(procedure, array) {
    return new Promise(function(fulfill, reject) {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err);
            } else {
                connection.query(`CALL ${procedure}(${countArguments(array)});`, array, function(err, resultsets) {
                    if (err) {
                        connection.release();
                        reject(err);
                    } else {
                        connection.release();
                        fulfill(resultsets[0]);
                    }
                })
            }
        })
    })
}

let homePage = path.join(__dirname, '..', 'client', 'index.html');
let chirpHistory = path.join(__dirname, 'data.json');
let clientPath = path.join(__dirname, '../client');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(clientPath));

app.route('/')
    .get((req, res) => {
        res.set('Content-type', 'html');
        res.sendFile(homePage);
    });

app.route('/api/chirps')
    .get((req, res) => {
        modifyChirps('GetAllChirps', [])
            .then(function(chirps) {
                res.send(chirps);
            }, function(err) {
                res.status(500).send(err);
            });
    }).post((req, res) => {
        let user = req.body.user;
        let message = req.body.message;
        modifyChirps('CreateChirp', [user, message])
            .then(function(id) {
                res.status(201).send(id);
            }, function(err) {
                res.status(500).send(err);
            });
    }).delete((req, res) => {
        modifyChirps('DeleteChirp', [req.body.index])
            .then(function(id) {
                res.status(204).send(id);
            }, function(err) {
                res.status(500).send(err);
            });
    });

app.route('/api/users')
    .get((req, res) => {
        modifyChirps('GetAllUsers', [])
        .then(function(users) {
            res.send(users);
        }, function(err) {
            res.status(500).send(err);
        });
    }).post((req, res) => {
        let user = req.body.user;
        let email = req.body.email
        modifyChirps('CreateUser', [user, email])
            .then(function(id) {
                res.status(201).send(id);
            }, function(err) {
                res.status(500).send(err);
            });
    })

app.route('/:id')
    .get((req, res) => {
        let address = req.params.id;
        let ext = path.extname(req.params.id);
        let extTrim = ext.substr(1,ext.length);
        let extOp = `text/${extTrim}`;

        fs.readFile(address, (err) => {
            if (err) {
                res.status(404).send('Not Found');
            }
            res.status(201).set('Content-type', extOp);
            res.send(address)
        })
    });

app.listen(3000);