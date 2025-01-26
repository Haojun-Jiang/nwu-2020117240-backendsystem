//导入数据库操作模块
const { json } = require('body-parser')
const db = require('../db/db')
const fs = require('fs')
const path = require('path')
const { compareSync } = require('bcryptjs')

exports.productlist = (req, res) => {
    var sql = 'SELECT products.ProductID, ProductName, ProductPic, Taobao, QRCode, specification.Hight, specification.Width, shopusers_1.ShopName FROM products JOIN specification ON products.ProductID = specification.ProductID JOIN shopusers_1 ON shopusers_1.UserID = products.UserID WHERE shopusers_1.isStoped = 0 AND products.IsWithdraw = 0'

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

exports.searchpro = (req, res) => {
    console.log(req.body.Keywords)
    console.log(req.body)
    var sql = 'SELECT ProductName, ProductPic, Taobao, QRCode, specification.Hight, specification.Width, shopusers_1.ShopName FROM products JOIN specification ON products.ProductID = specification.ProductID JOIN shopusers_1 ON shopusers_1.UserID = products.UserID WHERE products.ProductName LIKE "%'+req.body.Keywords+'%" OR shopusers_1.ShopName LIKE "%'+req.body.Keywords+'%"'

    db.query(sql, (err, results)=>{
        if(err) return res.cc('SQL错误!')
        if(results.length === 0) return res.cc('空')
        else{
            res.json(results)
        }
    })
}


exports.addpro = (req, res) => {
    var sql = 'SELECT ProductPic FROM products WHERE ProductID = ?'
    
    db.query(sql, [ req.body.ProductID ], (err, results)=>{
        if(err) return res.cc('SQL错误!')
        if(results.length === 0) return res.cc('空')
        else{
            var pic1 = results[0].ProductPic
            var pic = pic1.replace(/^data:image\/\w+;base64,/, '')
            var picBuffer = Buffer.from(pic, 'base64')
            var folderPath = path.join('D:/study/毕设/室内装修系统/img/images2/tupian/image')
            if(!fs.existsSync(picPath)){
                fs.mkdirSync(folderPath, { recursive: true })
            }
            var picname = '0.png'
            var picPath = path.join(folderPath, picname)
            if(fs.existsSync(picPath)){
                fs.unlinkSync(picPath)
                console.log('删除成功')
            }
            fs.writeFileSync(picPath, picBuffer, { encoding: 'base64' })
            console.log('写入成功')
            res.cc('图片上传成功', 0)
            
        }
    })
}

//加入边框
exports.addborder = (req, res) => {
    var pic1 = req.body.ProductPic
    var pic = pic1.replace(/^data:image\/\w+;base64,/, '')
    var picBuffer = Buffer.from(pic, 'base64')
    var folderPath = path.join('D:/study/毕设/室内装修系统/img/images2/tupian/image')
    if(!fs.existsSync(picPath)){
        fs.mkdirSync(folderPath, { recursive: true })
    }
    var picname = '0.png'
    var picPath = path.join(folderPath, picname)
    if(fs.existsSync(picPath)){
        fs.unlinkSync(picPath)
        console.log('删除成功')
    }
    fs.writeFileSync(picPath, picBuffer, { encoding: 'base64' })
    console.log('写入成功')
    res.cc('图片上传成功', 0)
}

exports.getspec = (req, res) => {
    var sql = 'select * from specification where ProductID = ?'
    db.query(sql, [ req.body.ProductID ], (err, results)=>{
        if(err) return res.cc('SQL 错误!')
        if(results.length === 0) return res.cc('该商品没有规格!')
        else{
            res.json(results)
        }
    })
}

//消费者获取商品图片
exports.getpic = (req, res) => {
    var sql = 'select ProductPic from Products where ProductName = ?'
    console.log(req.query.Key+'1')
    db.query(sql, [ req.query.Key ], (err, results)=>{
        if(err) return res.cc('SQL 错误!')
        if(results.length === 0) return res.cc('fail!')
        else{
            res.send(results[0].ProductPic)
        }
    })
}