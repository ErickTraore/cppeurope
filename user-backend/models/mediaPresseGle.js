// File: media-backend/models/mediaPresseGle.js

module.exports = (sequelize, DataTypes) => {
    const MediaPresseGle = sequelize.define('MediaPresseGle', {
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('image', 'video'),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        uploadedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'MediaPresseGle'
    });

    return MediaPresseGle;
};
