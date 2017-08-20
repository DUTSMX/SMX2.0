var express = require('express');
var router = express.Router();
var db =require("../model/db")
var student =require("../model/student")
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/student_detail',function(req,res,next){
    /*student.findOne({'where':{userId:34}}).then(function (ret) {
        ret.getUser().then(function (ret1) {
            console.log(JSON.stringify({info:ret1,infos:ret}))
            res.render('student_detail',{info:ret1,infos:ret});
        })
    })*/
    var studentId = 16;
    var sql = "SELECT a.userName, " +
        "a.userAge, " +
        "s.school, " +
        "s.personalSign " +
        "FROM  student s " +
        "JOIN account a ON a.userId = s.userId  " +
        "WHERE s.studentId = " + studentId;
    db.sequelize.query(sql).then(function (ret) {
        console.log(JSON.stringify(ret));
        console.log(JSON.stringify({date:ret[0][0]}));
        res.render('student_detail',{data:ret[0][0]});
    })
});

router.get('/student',function(req,res,next){
  res.render('student_course')
});
router.get('/course_re',function(req,res,next){
    res.render('course_re')
});
module.exports = router;
