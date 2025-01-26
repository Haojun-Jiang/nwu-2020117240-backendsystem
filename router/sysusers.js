const express = require('express')
const router = express.Router()
//数据处理模块
const Sys_handler = require('../router_handler/sysusers.js')

//导入验证表单数据中间件
const expressJoi = require('@escook/express-joi')

//导入需要验证的规则对象
const { update_userinfo_schema, update_pwd_schema } = require('../schema/shopusers')

//更新系统管理员密码
router.post('/updatepwd', expressJoi(update_pwd_schema), Sys_handler.updatepwd)

//拉取商铺管理员信息
router.get('/show-shops',Sys_handler.getshops)

//更新商铺管理员信息
router.post('/change-shops',Sys_handler.changeshops)

//拉取商铺商品信息
router.get('/show-products',Sys_handler.getproducts)

//修改商铺商品信息
router.post('/change-products',Sys_handler.changeproducts)

//模糊查找商铺
router.post('/search-shops',Sys_handler.searchshops)

//模糊擦查找商品
router.post('/search-products',Sys_handler.searchproducts)

module.exports = router