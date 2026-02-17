// File :cppeurope/user-backend/models/presseGle.js

module.exports = (sequelize, DataTypes) => {
    const PresseGle = sequelize.define('PresseGle', {
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
        },
        siteKey: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'PresseGle'
    });

    PresseGle.associate = (models) => {
        PresseGle.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return PresseGle;
};
