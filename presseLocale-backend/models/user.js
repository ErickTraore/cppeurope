// File: user-backend/models/user.js

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: DataTypes.STRING,
        bio: DataTypes.TEXT,
        password: DataTypes.STRING,
        isAdmin: DataTypes.BOOLEAN,
        lastActivity: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });

    User.associate = (models) => {
        // Relation avec les messages
        User.hasMany(models.Message, { foreignKey: 'userId' });

        // Relation avec le profil
        User.hasOne(models.Profile, {
            foreignKey: 'userId',
            as: 'Profile' // 🔥 IMPORTANT : alias obligatoire
        });
    };

    return User;
};