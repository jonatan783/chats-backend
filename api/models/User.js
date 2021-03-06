const { Model, DataTypes } = require('sequelize');
const db = require('../db');
const bcrypt = require('bcrypt');


class User extends Model {
    setHash(password, salt) {
        return bcrypt.hash(password, salt);
    }
}

User.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Must be a valid email address',
                },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        salt: {
            type: DataTypes.STRING,
        },
    },

    { sequelize: db, tableName: 'users' }
);

User.addHook('beforeCreate', user => {
    return bcrypt
        .genSalt(16)
        .then(salt => {
            user.salt = salt;
            return user.setHash(user.password, salt);
        })
        .then(hash => {
            user.password = hash;
        });
});

module.exports = User;