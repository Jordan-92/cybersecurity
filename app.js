const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'vulnerable-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vulnerable_db'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connecté à la base de données MySQL');
});

// Endpoint vulnérable à la XSS
app.get('/xss', (req, res) => {
  const userInput = req.query.input || '';
  res.send(`<h1>Bienvenue</h1><p>${userInput}</p>`);
});

// Endpoint vulnérable à l'injection SQL
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.query(query, (err, results) => {
    if (err) {
      res.send('Erreur SQL');
      return;
    }
    if (results.length > 0) {
      req.session.user = results[0].username;
      res.send(`Connecté en tant que ${results[0].username}`);
    } else {
      res.send('Nom d’utilisateur ou mot de passe incorrect');
    }
  });
});

// Endpoint avec authentification cassée
app.get('/profile', (req, res) => {
  if (req.session.user) {
    res.send(`Bienvenue sur votre profil, ${req.session.user}`);
  } else {
    res.send('Vous devez être connecté pour voir cette page');
  }
});

// Endpoint pour usurpation d'identité
app.get('/impersonate', (req, res) => {
  const targetUser = req.query.user;
  req.session.user = targetUser;
  res.send(`Vous êtes maintenant connecté en tant que ${targetUser}`);
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
