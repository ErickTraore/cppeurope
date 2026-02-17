// File: user-backend/models/profile.js


module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone3: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
        tableName: 'Profiles',
    });

    Profile.associate = (models) => {
        Profile.belongsTo(models.User, {
            foreignKey: 'userId'
        });
    };

    return Profile;
};