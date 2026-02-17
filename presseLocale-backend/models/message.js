// File :cppeurope/user-backend/models/message.js


module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            validate: {
                len: [1, 50000]
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        categ: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'presse'
        },
        attachment: {
            type: DataTypes.STRING,
            allowNull: true
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    Message.associate = (models) => {
        Message.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Message;
};