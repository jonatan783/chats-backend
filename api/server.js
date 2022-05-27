const express = require('express');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const routes = require('./routes');
const port = 3001;

const { User } = require('./models');
const db = require('./db');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    sessions({
        secret: 'sativaANDco',
        resave: true,
        saveUninitialized: true,
        cookie: { _expires: 60000000000000 },
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },

        function (email, password, done) {
            User.findOne({ where: { email } })
                .then(user => {
                    if (!user) {
                        return done(null, false);
                    }

                    user.setHash(password, user.salt).then(hash => {
                        if (hash !== user.password) {
                            return done(null, false);
                        }

                        return done(null, user);
                    });
                })
                .catch(done);
        }
    )
);
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findByPk(id)
        .then(user => {
            done(null, user);
        })
        .catch(done);
});

app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send(err);
});


app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('tiny'));

app.use("/api", routes);

app.set('port', process.env.PORT || port);

db.sync({ force: true }).then(() => {
    server.listen(app.get('port'), () => {
        console.log(`server on port ${app.get('port')}`)
    });
});