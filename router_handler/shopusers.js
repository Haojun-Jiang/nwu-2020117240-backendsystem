//导入数据库操作模块
const db = require('../db/db')

//导入时间模块
const moment = require('moment')

//导入加密数据加密模块
const bcrypt = require('bcryptjs')

//导入生成Token字符串的包
const jwt = require('jsonwebtoken')

//导入配置文件
const config = require('../config')

//注册
exports.regUser = (req, res) =>{
    //console.Console(req)
    var sql = 'select * from shopusers_1 where UserName=?'
    var flag = 1
    //接收表单数据

    const SU_info = req.body
    console.log(req.body)

    //执行sql语句
    db.query(sql, [SU_info.UserName], function(err, results){
        if(err){
            flag = 0
            return res.cc(err)
        }
        if(results.length > 0){
            flag = 0
            return res.cc('用户名已被占用')
        }
    })
    //检查注册电话号码
    sql = 'select * from shopusers_1 where MobilePhone=?'
    db.query(sql, [SU_info.MobilePhone], function(err, results){
        if(err){
            flag = 0
            return res.cc(err)
        }
        if(results.length > 0){
            flag = 0
            return res.cc('该电话号码已注册')
        }
    })


    //对用户密码进行加密
    SU_info.Password = bcrypt.hashSync(SU_info.Password, 10)

    //更新数据库
    if(flag){
        sql = 'insert into shopusers_1 set ?'
        //执行插入语句
        db.query(sql, { ShopName:SU_info.ShopName, UserName:SU_info.UserName, MobilePhone:SU_info.MobilePhone, salt:SU_info.salt, Password:SU_info.Password, FailedPasswordAttemptCount: 0}, function(err, results){
            if(err){
                return res.cc(err)
            }
            if(results.affectedRows !== 1){
                return res.cc('用户注册失败，请稍后再试!')
            }
            else
                res.send({ status: 0, message: '注册成功!' })
        })
    }
}


//登录
exports.login = (req, res) =>{
    //接收数据
    const SU_info = req.body
    console.log(SU_info)

    //定义sql语句
    var sql = 'select * from shopusers_1 where UserName=?'

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

        if(results[0].isFreezing === 1 && moment().diff(results[0].FailedPasswordAttemptWindowStart, 'minutes') < 30){
            sql = 'UPDATE shopusers_1 SET isFreezing=0, FailedPasswordAttemptCount=0, FailedPasswordAttemptWindowStart = NULL WHERE UserName=?'
            db.query(sql, [results[0].UserName],(err, results1)=>{
                if(err) return res.cc('SQL error!')
                if(results1.affectedRows) return res.cc('Failed!')
            })
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
        const C_R = bcrypt.compareSync(SU_info.Password, results[0].Password)
        //const C_R = (SU_info.Password == results[0].Password)
        //如果输入密码出错
        console.log(C_R)
        if(!C_R){
            //密码输入错误
            //flag1 = 0

            //判断是否需要更新冻结
            if(results[0].FailedPasswordAttemptCount >= 4 ){
                //flag2 = 1
                //准备数据
                results[0].isFreezing = 1
                results[0].FailedPasswordAttemptCount = 0
                //更新数据库
                var sql = 'UPDATE shopusers_1 SET isFreezing=?, FailedPasswordAttemptCount=?, FailedPasswordAttemptWindowStart=NOW() WHERE UserName=?'
               
                //执行冻结更新
                db.query(sql,[ results[0].isFreezing, results[0].FailedPasswordAttemptCount, results[0].UserName ], function(err, results){
                    console.log('2')
                    console.log(results.length)
                    if(err) return res.cc(err)
                    console.log('3')
                    if(results.affectedRows !== 1){
                        return res.cc(err)
                    }
                    return res.cc('密码输入已三次错误，账号冻结30分钟!!')
                })
                console.log('1')
                
            }

            //更新出错次数
            else{
                //flag2 = 0

                console.log('5')

                var sql = 'UPDATE shopusers_1 SET FailedPasswordAttemptCount=? WHERE UserName=?'
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
            var sql = 'UPDATE shopusers_1 SET FailedPasswordAttemptCount=?, LastLoginTime=NOW() WHERE UserName=?'
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
            const user = {...results[0], Password: '', MobilePhone: ''}
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