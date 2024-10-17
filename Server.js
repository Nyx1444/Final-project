const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const routes = require('./routes');
const dbConnection = require('./dbConnection');
const cors = require('cors'); 
const app = express();


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'], 
    maxAge: 60 * 60 * 1000 
}));


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


dbConnection.getConnection()
    .then(connection => {
        console.log("Database connected successfully");
        connection.release();
    })
    .catch(error => {
        console.error("Database connection failed:", error);
    });


app.use('/', routes);


app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});


app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message || 'Internal Server Error'
      }
    });
  });


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

module.exports = app;