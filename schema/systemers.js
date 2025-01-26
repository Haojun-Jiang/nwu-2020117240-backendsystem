const joi = require('joi')

const UserName = joi.string().alphanum().min(1).max(10).required()

const MobilePhone = joi.string().alphanum().pattern(/^\d{11}$/).required()

const Password = joi.string().pattern(/^[\S]{2,20}$/).required()

const newPassword = joi.string().pattern(/^[\S]{2,20}$/).required()

const Rep_Password = joi.string().pattern(/^[\S]{2,20}$/).required()

const salt = joi.string().required()

exports.sys_login_schema = {
    body:{
        UserName,
        Password,
    }
}