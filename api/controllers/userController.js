const User = require('../models/User');

exports.me = (req, res) => {
    if (!req.user) return res.sendStatus(401);
    res.send(req.user);
};

exports.login = (req, res) => {
    res.send(req.user);
};

exports.register = (req, res) => {
    const { name, phone, email, password } = req.body;
    User.create({
        name,
        phone,
        email,
        password,
    }).then(user => {
        res.status(201).send(user);
    });
};

exports.logout = (req, res) => {
    req.logOut();
    res.sendStatus(200);
};