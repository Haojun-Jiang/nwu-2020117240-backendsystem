const express = require('express')
const router = express.Router()

//导入验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')

//导入需要验证的规则对象
const { update_userinfo_schema, update_pwd_schema } = require('../schema/shopusers')
const { product_schema, newproduct_schema, deleteproduct_schema } = require('../schema/products') 

//导入用户信息处理函数模块
const userinfo_handler = require('../router_handler/shopuserinfo')

//获取用户基本信息
router.get('/shopuser-info', userinfo_handler.getUserinfo)

//更新用户基本信息
router.post('/shopuser-info', expressJoi(update_userinfo_schema),userinfo_handler.updateUserinfo)

//更新商户密码
router.post('/update-pwd', expressJoi(update_pwd_schema), userinfo_handler.updatePwd)

//获取商品信息
router.get('/productinfo', userinfo_handler.productInfo)

//修改商品信息
router.post('/productinfo', expressJoi(product_schema),userinfo_handler.changeproductInfo)

//新增商品
router.post('/newproduct', expressJoi(newproduct_schema),userinfo_handler.newproduct)

//删除商品
router.post('/deleteproduct', userinfo_handler.deleteproduct)

//商户购买会员
router.post('/buyvip', userinfo_handler.buyvip)

//添加商品规格
router.post('/addproductspec', userinfo_handler.addproductspec)

//删除商品规格
router.post('/deleteproductspec', userinfo_handler.deleteproductspec)

//获取商品规格列表
router.post('/getprospeclist', userinfo_handler.getprospeclist)

module.exports = router