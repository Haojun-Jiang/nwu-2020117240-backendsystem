const joi = require('joi')

const ProductName = joi.string().min(1).max(200).required()

const ProductID = joi.number().required()

const Width = joi.number().required()

const Hight = joi.number().required()

const ProductPic = joi.string().required()

const IsWithdraw = joi.number().required()

const Taobao = joi.string().optional().allow(null)

exports.product_schema = {
    body: {
        ProductID,
        ProductName,
        Width,
        Hight,
        ProductPic,
        IsWithdraw,
        Taobao,
    },
}

exports.newproduct_schema = {
    body: {
        ProductName,
        ProductPic,
        IsWithdraw,
        Taobao,
        Width,
        Hight,
    }
}

exports.deleteproduct_schema = {
    body:[
        ProductName,
    ]
}