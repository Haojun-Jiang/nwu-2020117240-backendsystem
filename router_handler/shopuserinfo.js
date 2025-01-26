//导入数据库操作模块
const { json } = require('body-parser')
const db = require('../db/db')

//导入生成二维码的模块
const qr = require('qrcode')

//导入加密数据加密模块
const bcrypt = require('bcryptjs')
const { date } = require('joi')

//获取用户基本信息的处理函数
exports.getUserinfo = (req, res) =>{
    console.log(req.user.UserID)
    //防止泄露排除password字段
    var sql = 'select ShopName, UserName, MobilePhone, isStoped, FreeTryExpried, VIPExpried from shopusers_1 where UserID=?'
    db.query(sql, [req.user.UserID], (err, results)=>{
        if(err) return res.cc('SQL错误')
        if(results.length !== 1) return res.cc('获取用户信息失败!')

        //执行成功
        res.send({
            status: 0,
            massage: '成功',
            data: results[0],
        })
    })
    //res.send('ok')
}

//更新用户基本信息的处理函数
exports.updateUserinfo = (req, res) =>{
    var flag = 1

    //检查注册电话号码
    var sql = 'select * from shopusers_1 where MobilePhone=?'
    db.query(sql, [req.body.MobilePhone], function(err, results){
        if(err){
            flag = 0
            return res.cc(err)
        }
        if(results.length > 0 && results[0].MobilePhone !== req.body.MobilePhone){
            flag = 0
            return res.cc('该电话号码已注册')
        }
    })
    //更新用户信息
    if(flag){
        sql = 'update shopusers_1 set ? where UserID=?'
        //执行sql语句
        db.query(sql,[req.body, req.user.UserID],(err, results) => {
            // console.log(req.user.UserID)
            // console.log(results.affectedRows)
            if(err) return res.cc('SQL执行错误!')
            if(results.affectedRows !== 1) return  res.cc('修改用户信息失败!')

            //成功
            return res.cc('用户信息更新成功!',0)
        })
    }

    //res.send("ok")
}

exports.updatePwd = (req, res) =>{
    var sql = 'select * from shopusers_1 where UserID = ?'
    var reqBody = req.body

    db.query(sql, [req.user.UserID], (err,results)=>{
        if(err) {
            console.log('1')
            return res.cc('SQL错误!')
        }

        if(results.length !== 1) return res.cc('ID数据重复!')

        else if(bcrypt.compareSync(reqBody.Password, results[0].Password)){
            
            if(reqBody.newPassword != reqBody.Rep_Password){
                return res.cc('重复的密码不一致!')
            }
            else {
                sql = 'update shopusers_1 set Password = ?, LastPasswordChangedDate = NOW() where UserID = ?'
                reqBody.newPassword = bcrypt.hashSync(reqBody.newPassword, 10)
        
                db.query(sql, [ reqBody.newPassword, req.user.UserID ], (err,results)=>{
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

        else{
            return res.cc('旧密码错误')
        }
    })
    //res.send('ok')
}

exports.productInfo = (req, res) =>{
    var sql = 'select products.ProductID, products.ProductName, products.ProductPic, products.IsWithdraw, products.Taobao, products.QRCode, specification.Width, specification.Hight from products join specification on products.ProductID = specification.ProductID where UserID = ?'
    db.query(sql, req.user.UserID, (err, productResult)=>{
        if(err) return res.cc('SQL 执行错误!')
        if(productResult.length == 0) {
            res.cc('商品数据为空', 0)
        }
        else{
           res.json(productResult)
        }
    })
    //res.send('ok')
}

exports.changeproductInfo = (req, res) =>{
    var sql = 'select * from products where ProductID = ?'

    //console.log(req.body.ProductID)
    db.query(sql, [ req.body.ProductID ],(err, results1)=>{
        //console.log(results1)
        if(err) return res.cc('SQL 错误1!')
        if(results1.length !== 1) return res.cc('商品重复1') 
    })

    //生成指向商品图的二维码
    //var qrcode = qr.toDataURL(req.body.ProductPic)

    sql = 'update products set ProductName = ?, ProductPic = ?, IsWithdraw = ?, Taobao = ? where ProductID = ?'

    db.query(sql, [ req.body.ProductName, req.body.ProductPic, req.body.IsWithdraw, req.body.Taobao, req.body.ProductID ], (err, results2) =>{
        if(err) return res.cc('SQL 错误2!')
        if(results2.affectedRows !== 1) return res.cc('商品重复2')

        res.cc('商品信息修改成功!', 0 )
    })

    // sql = 'insert specification set ?'

    // db.query(sql, { With: req.body.Width, Hight: req.body.Hight, ProductID: req.body.ProductID }, (err, results3)=>{
    //     if(err) return res.cc('SQL 错误3!')
    //     if(results3.affectedRows !== 1 ) return res.cc('商品重复3')

    //     res.cc('商品信息修改成功!', 0 )
    // })
}

//新增商品
exports.newproduct = (req, res) =>{
    var sql = 'select * from products where ProductName = ?'
    
    //查重
    db.query(sql, [ req.body.ProductName ], (err, results)=>{
        if(err){
            return res.cc('SQL 错误!1')
        }

        if(results.length  !== 0) return res.cc('商品重复')

        else{
            var cache
            sql = 'insert products set ?'
            //二维码内信息
            const qrinfo = 'http://127.0.0.1:5500/dapei.html?key='+req.body.ProductName
            
            //转弯为JSON格式
            //生成二维码
            qr.toDataURL(qrinfo, (err, url)=>{
                if(err) return
                console.log(url)
            
            //更新商品表
            db.query(sql, { UserID: req.user.UserID, ProductName: req.body.ProductName, ProductPic: req.body.ProductPic, IsWithdraw: req.body.IsWithdraw, Taobao: req.body.Taobao , QRCode: url}, (err, results)=>{
                if(err) return res.cc('SQL 错误!2')
                if(results.affectedRows !== 1) return res.cc('添加商品失败!')
                else{
                    //查找商品号
                    sql = 'select ProductID from products where UserID = ?'

                    db.query(sql, [ req.user.UserID ],(err, select_results)=>{
                        if(err) return res.cc('SQL 错误!4')
                        else{
                            //更新装饰画表
                            sql = 'insert specification set ?'

                            db.query(sql, { ProductID: select_results[select_results.length - 1].ProductID, Width: req.body.Width, Hight: req.body.Hight }, (err, results1)=>{
                                if(err) return res.cc('SQL 错误!3')
                                if(results1.affectedRows !== 1) return res.cc('添加装饰画失败!')

                                else{
                                    console.log(results1)
                                    res.cc('新增商品成功!', 0)
                                }
                            })
                        }
                    })
                }
            })
        })
        }
    })
    //res.send('ok')
}

//删除商品
exports.deleteproduct = (req, res) =>{
    //设置删除入口

    //保存搜索到的商品ID
    if(!req.body.ProductID) {
        console.log(req.body)
        return res.cc('请输入需要删除的商品ID!')
    }
    else{
        console.log(req)
        //搜索商品ID
        var sql = 'delete from specification where ProductID = ?'

        db.query(sql, [ req.body.ProductID ], (err, select_results)=>{
            if(err) return res.cc('SQL 错误!')
            
            else{
                //查找商品号
                sql = 'select ProductID from products where UserID = ?'

                db.query(sql, [ req.user.UserID ],(err, select_results)=>{
                    if(err) return res.cc('SQL 错误!4')
                    else{
                        sql = 'delete from products where ProductID = ?'
                        
                        db.query(sql, [ req.body.ProductID ], (err, results) =>{
                            if(err) return res.cc('SQL err!')
                            if(results.affectedRows !== 1) return res.cc('fail to delete')
                            else{
                                res.cc('success!', 0)
                            }
                        })
                    }
                })
            }
        })        
    }
    //res.send('ok')
}

//buyvip
exports.buyvip = (req, res) =>{
    var sql = 'insert paymentrecords set ?'
    db.query(sql, { ShopUser_Userid:req.user.UserID, PaymentAmount:req.body.PaymentAmount }, (err, results1)=>{
        if(err) return res.cc('SQL 错误!')
        if(results1.affectedRows !== 1) return res.cc('购买失败!')
        else{
            sql = 'update shopusers_1 set VIPExpried = IF'+
            '('+
                'VIPExpried IS NULL OR VIPExpried < CURDATE(),'+
                'DATE_ADD(CURDATE(), INTERVAL 1 YEAR),'+
                'DATE_ADD(VIPExpried, INTERVAL 1 YEAR)'+
            ')'+
            'WHERE UserID = ?;'
            db.query(sql, [ req.user.UserID ], (err, results2)=>{
                if(err) return res.cc('SQL 错误!')
                if(results2.affectedRows !== 1) return res.cc('更新失败!')
                else{
                    res.cc('购买成功!', 0)
                }
            })
        }
    })
}

//添加商品规格
exports.addproductspec = (req, res) =>{
    var sql = 'insert specification set ?'
    db.query(sql, { ProductID: req.body.ProductID, Width: req.body.Width, Hight: req.body.Hight }, (err, results)=>{
        if(err) return res.cc('SQL 错误!')
        if(results.affectedRows !== 1) return res.cc('添加商品规格失败!')
        else{
            res.cc('添加商品规格成功!', 0)
        }
    })
}

//删除商品规格
exports.deleteproductspec = (req, res) =>{
    var sql = 'delete from specification where SpecifiID = ?'
    
    db.query(sql, [ req.body.SpecifiID ], (err, results)=>{
        if(err) return res.cc('SQL 错误!')
        if(results.affectedRows !== 1) return res.cc('删除商品规格失败!')
        else{
            res.cc('删除商品规格成功!', 0)
        }
    })
}

//获取商品规格列表
exports.getprospeclist = (req, res) =>{
    var sql = 'select * from specification where ProductID = ?'
    db.query(sql, [ req.body.ProductID ], (err, results)=>{
        if(err) return res.cc('SQL 错误!')
        if(results.length === 0) return res.cc('该商品没有规格!')
        else{
            res.json(results)
        }
    })
}