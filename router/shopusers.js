const express = require('express')
const router = express.Router()
//数据处理模块
const SU_handler = require('../router_handler/shopusers')
const Sys_handler = require('../router_handler/sysusers.js')
const CL_handler = require('../router_handler/client.js')

//导入验证表单数据中间件
const expressJoi = require('@escook/express-joi')
//导入需要验证规则对象
const { reguest_schema, reguser_schema } = require('../schema/shopusers')
const { login_schema } = require('../schema/shopusers')
const { sys_login_schema } = require('../schema/systemers')


//注册
router.post('/reguser', expressJoi(reguser_schema), SU_handler.regUser)

//登录
router.post("/login", expressJoi(login_schema), SU_handler.login)

//系统管理员登录
router.post('/admin-login', expressJoi(sys_login_schema), Sys_handler.login)

//一般用户商品列表
router.get('/productlist', CL_handler.productlist)

//一般用户查询商品
router.post('/searchpro', CL_handler.searchpro)

//用户加入商品设计
router.post('/addpro', CL_handler.addpro)

//用户加入商品边框设计
router.post('/addborder', CL_handler.addborder)

//用户获取商品规格
router.post('/getspec', CL_handler.getspec)

//消费者获取商品图片
router.get('/getpic', CL_handler.getpic)

module.exports = router