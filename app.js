const express = require('express')
// const bodyParser = require('body-parser');
//创建实例
const app = express()

//导入配置文件
const config = require('./config')

//跨域
const cors  = require('cors')
app.use(cors())

const joi = require('joi')

//响应数据中间件
app.use(function(req, res, next){
    res.cc = (err, status = 1) => {
        res.send({
            status,
            message: err instanceof Error ? err.message : err
       })

   }
   next()
})

//解析token的中间件
const expressJWT = require('express-jwt')

// const expressJWT = jwt({
//     secret: config.jwtSecretKey,
//     algorithms: ["HS256"]
// })



//指定不需要Token进行验证的接口
// app.use(
//     expressJWT({
//       secret: config.jwtSecretKey,
//       algorithms: ["HS256"],
//       credentialsRequired: false,
//       getToken: function fromHeaderOrQuerystring(req) {
//         if (
//           req.headers.authorization &&
//           req.headers.authorization.split(" ")[0] === "Bearer"
//         ) {
//           return req.headers.authorization.split(" ")[1];
//         } else if (req.query && req.query.token) {
//           return req.query.token;
//          }
//          return null;
//        }
//     }).unless({ path: ["/api"]})
// )
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))

//错误中间件
app.use(function (err, req, res, next){
  //验证失败的错误
  if(err.name === 'ValidationError') 
      return res.cc(err)

  //捕获身份认证失效的错误
  if(err.name === 'UnauthorizedError')
      return res.cc('身份认证失效!')
})



//配置解析表单数据中间件
app.use(express.urlencoded({ extended: false }))




//注册路由
//注册商户注册登录和管理员登录路由
const SURouter = require('./router/shopusers')
app.use('/api',SURouter)

//注册商户个人中心路由
const SUinfoRouter = require('./router/shopuserinfo')
app.use('/my', SUinfoRouter)

//注册系统管理员路由
const SysRouter = require('./router/sysusers')
app.use('/admin', SysRouter)

//启！动！
app.listen(3007, function(){
    console.log('graduation is running at http://127.0.0.1:3007')
})