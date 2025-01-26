const joi = require('joi')

const UserName = joi.string().alphanum().min(1).max(10).required()

const MobilePhone = joi.string().alphanum().pattern(/^\d{11}$/).required()

const Password = joi.string().pattern(/^[\S]{2,20}$/).required()

const newPassword = joi.string().pattern(/^[\S]{2,20}$/).required()

const Rep_Password = joi.string().pattern(/^[\S]{2,20}$/).required()

const salt = joi.string()

const ShopName = joi.string().alphanum().min(1).max(10)

exports.reguser_schema = {
    body: {
        UserName,
        MobilePhone,
        salt,
        Password,
    },
}

exports.login_schema = {
    body: {
        UserName,
        Password,
    },
}

exports.update_userinfo_schema = {
    body: {
        UserName,
        ShopName,
        MobilePhone,
        salt,
    },
}

exports.update_pwd_schema = {
    body: {
        Password,
        newPassword,
        Rep_Password,
    }
}