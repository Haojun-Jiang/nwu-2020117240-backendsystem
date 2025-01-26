//导入数据库操作模块
const { json } = require('body-parser')
const db = require('../db/db')

//导入生成Token字符串的包
const jwt = require('jsonwebtoken')

//导入配置文件
const config = require('../config')

exports.login = (req, res) => {
    //接收数据
    const SU_info = req.body
    console.log(SU_info)

    //定义sql语句
    var sql = 'select * from sysusers where UserName=?'

    //执行sql语句
    db.query(sql, [SU_info.UserName], function(err, results){

        //执行sql语句失败
        if(err){
            flag = 0
            return res.cc(err)
        }

        if(results.length == 0){
            flag = 0
            return res.cc('查无此人!')
        }

        if(results[0].isFreezing == 1){
            flag = 0
            return res.cc('账号已被冻结30分钟')
        }

        // if(results[0].isStoped){
        //     flag = 0
        //     return res.cc('该账户已停用')
        // }

        //const db_info = results[0]
        //判断输入密码是否出错
        //const C_R = bcrypt.compareSync(SU_info.Password, results[0].Password)
        const C_R = (SU_info.Password == results[0].Password)
        //如果输入密码出错
        console.log(C_R)
        if(!C_R){
            //密码输入错误
            //flag1 = 0

            //判断是否需要更新冻结
            if(results[0].FailedPasswordAttemptCount >= 4){
                //flag2 = 1
                //准备数据
                results[0].isFreezing = 1
                results[0].FailedPasswordAttemptCount = 0
                //更新数据库
                var sql = 'UPDATE sysusers SET isFreezing=?, FailedPasswordAttemptCount=? WHERE UserName = ?'
               
                //执行冻结更新
                db.query(sql,[ results[0].isFreezing, results[0].FailedPasswordAttemptCount, results[0].UserName ], function(err, results){
                    console.log('2')
                    console.log(results.length)
                    if(err) return res.cc(err)
                    console.log('3')
                    if(results.affectedRows !== 1){
                        return res.cc(err)
                    }
                    return res.cc('密码输入已五次错误，账号冻结30分钟!!')
                })
                console.log('1')
                
            }

            //更新出错次数
            else{
                //flag2 = 0

                console.log('5')

                var sql = 'UPDATE sysusers SET FailedPasswordAttemptCount=? WHERE UserName=?'
                //准备更新数据
                results[0].FailedPasswordAttemptCount = results[0].FailedPasswordAttemptCount + 1

                //执行出错次数更新
                db.query(sql, [ results[0].FailedPasswordAttemptCount, results[0].UserName ], function(err, results){
                    console.log(results.length)
                    if(err) return res.cc('1')
                    if(results.affectedRows !== 1){
                        return res.cc('2')
                    }
                    return res.cc('密码输入错误!!')
                })
            }
        }

        //账号输入成功
        else{
            //更新出错数据
            var sql = 'UPDATE sysusers SET FailedPasswordAttemptCount=?, LastLoginTime=NOW() WHERE UserName=?'
            //准备更新数据
            results[0].FailedPasswordAttemptCount = 0

            //执行出错次数更新
            db.query(sql, [ results[0].FailedPasswordAttemptCount, results[0].UserName ], function(err, results){
                console.log(results.length)
                if(err) return res.cc('1')
                if(results.affectedRows !== 1){
                    return res.cc('2')
                }
            })        
            //生成JWT token 
            //剔除用户敏感信息
            const user = {...results[0], Password: '' }
            //生成Token字符串
            const tokenStr = jwt.sign(user, config.jwtSecretKey,{
                expiresIn: config.expiresIn,
            })

            res.send({
                status: 0,
                message: '登录成功!',

                token: 'Bearer ' + tokenStr,
            })            
        }
    })
}

//更新系统管理员密码
exports.updatepwd = (req, res) =>{
    var sql = 'select * from sysusers where SysUsersID = ?'
    var reqBody = req.body
    console.log(reqBody)
    console.log(req.user)

    db.query(sql, [req.user.SysUsersID], (err,results)=>{
        console.log(results)
        if(err) {
            console.log('1')
            return res.cc('SQL错误!')
        }

        if(results.length !== 1) return res.cc('ID数据重复!')

        if(results[0].Password !== reqBody.Password){
            return res.cc('旧密码错误!')
        }

        else{
            if(reqBody.newPassword !== reqBody.Rep_Password){
                return res.cc('重复的密码不一致!')
            }
            else {
                sql = 'update sysusers set Password = ? where SysUsersID = ?'
                //reqBody.newPassword = bcrypt.hashSync(reqBody.Password, 10)
        
                db.query(sql, [ reqBody.newPassword, req.user.SysUsersID ], (err,results)=>{
                    if(err) {
                        console.log('2')
                        return res.cc('SQL执行错误!')
                    }
                    if(results.affectedRows !== 1) return res.cc('修改密码失败!')
                    //成功
                    return res.cc('更新密码成功!', 0)
                })
            }
        }
    })
    //res.send('ok')
}

//获取商铺信息
exports.getshops = (req, res) =>{
    var sql = 'select * from shopusers_1'

    db.query(sql, (err, results)=>{
        if(err){
            return res.cc('SQL错误')
        }
        if(results.length == 0){
            return res.cc('拉取数据库数据失败!')
        }
        else{
            for(var i=0; i < results.length; i++){
               results[i].Password = ' '
            }
            res.json(results)
        }
    })
}

//修改商铺信息
exports.changeshops = (req, res) =>{
    var sql = 'update shopusers_1 set isFreezing = ?, isStoped = ?, FreeTryExpried = ?, VIPExpried = ? where UserID = ?'
    console.log(req.body)
    db.query(sql, [ req.body.isFreezing, req.body.isStoped, req.body.FreeTryExpried, req.body.VIPExpried, req.body.UserID ], (err, results)=>{
        if(err) return res.cc('SQL 错误!')
        if(results.affectedRows !== 1) return res.cc('更新失败')
        else{
            res.cc('更新商铺信息成功!', 0)
        }
    })
}

//拉取店铺商品信息
exports.getproducts = (req, res)=>{
    var sql = 'select * from products join specification on products.ProductID = specification.ProductID'

    db.query(sql, [ req.body.UserID ], (err, results)=>{
        if(err) return res.cc('SQL错误!')
        if(results.length === 0){
            return res.cc('空', 0)
        }
        else{
            res.json(results)
        }
    })
}

//修改店铺商品信息
exports.changeproducts = (req, res)=>{
    var sql = 'update products set IsWithdraw = ? where ProductID = ?'

    console.log(req.body)
    db.query(sql, [ req.body.IsWithdraw, req.body.ProductID ], (err, results)=>{
        if(err) return res.cc('SQL错误!')
        if(results.affectedRows !== 1){
            return res.cc('修改商品信息失败!')
        }
        else{
            res.cc('修改商品信息成功!', 0)
        }
    })
}

//查找商铺
exports.searchshops = (req, res) => {
    console.log(req.body.Keywords)
    console.log(req)
    var sql = 'select * from shopusers_1 where UserName like "%'+req.body.Keywords+'%" or ShopName like "%'+req.body.Keywords+'%"'

    db.query(sql, (err, results)=>{

        if(err) return res.cc('SQL错误!')
        if(results.length === 0) return res.cc('查无此店铺')
        else{
            for(var i = 0; i < results.length; i++){
                results[i].Password = " "
            }
            res.json(results)
        }
    })
}

//查找商铺
exports.searchproducts = (req, res) => {
    var sql = 'select * from products join specification on products.ProductID = specification.ProductID where ProductName like "%'+req.body.Keywords+'%" '

    db.query(sql, (err, results) => {
        if(err) return res.cc('SQL错误!')
        if(results.length === 0) return res.cc('查无此商品')
        else res.json(results)
    })
}