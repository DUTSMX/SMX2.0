var express = require('express');
var router = express.Router();
var db = require("../model/db")
var course=require('../model/course');
var user=require(('../model/user'));
var series = require('../model/series')
var joinreceptionshop=require('../model/joinreceptionshop')
var joinreceptionmanager=require('../model/joinreceptionmanager');
var student = require("../model/student")
var teacher = require("../model/teacher")
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/student_detail',function(req,res,next){
    var studentId = 16;
    var sql = "SELECT a.userName ,a.userAge ,s.school ,s.grade ,s.personalSign ,a.phoneNumber ,a.userAddress ,a.userHeadUrl ,a.userFrontIdHeadUrl ,a.userBackIdHeadUrl " +
        "FROM  student s " +
        "JOIN account a ON a.userId = s.userId  " +
        "WHERE s.studentId = " + studentId;
    db.sequelize.query(sql).then(function (ret) {
        console.log(JSON.stringify(ret));
        console.log(JSON.stringify({data:ret[0][0]}));
        res.render('student_detail',{data:ret[0][0]});
    })
});
/**
 * 我的课程
 */
router.get('/student',function(req,res,next){
    var studentId = 34;
    student.findOne({'where':{studentId:34}}).then(function (student) {
        user.findOne({'where':{userId:student.userId}}).then(function (user) {
            var sql =  "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                "JOIN joinSeries j ON j.courseSeriesId = c.courseSeriesId "+
                //"JOIN teacher t ON t.teacherId = c.courseSeriesTeacher " +
                "WHERE j.studentId ="+ student.studentId;
            db.sequelize.query(sql).then(function (allCourse) {
            //     console.log(sql);
            //     console.log("userId:" + student.userId);
            //     console.log("allCourse" + JSON.stringify(AllCourse[0]))
            //     res.render('student_course',{AllCourse:AllCourse[0],NowCourse:[],FinishCourse:[],PostCourse:[]});
                var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                    "FROM courseSeries c " +
                    "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                    "JOIN joinSeries j ON j.courseSeriesId = c.courseSeriesId "+
                    "WHERE j.process = 1  and c.endDate < now() and j.studentId ="+student.studentId;
                db.sequelize.query(sql).then(function (finishCourse) {
                    var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                        "FROM courseSeries c " +
                        "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                        "JOIN joinSeries j ON j.courseSeriesId = c.courseSeriesId "+
                        "WHERE j.process = 1  and c.endDate >= now() and j.studentId ="+student.studentId;
                    db.sequelize.query(sql).then(function (nowCourse) {
                        var sql = "SELECT j.joinSeriesId,s.seriesName,studentId,hopeTeacher,hopeClassType,hopeTime,other " +
                            "FROM joinSeries j " +
                            "JOIN seriesTemplate s ON s.templateId = j.templateId " +
                            "WHERE process = 0 and j.studentId="+student.studentId;
                        db.sequelize.query(sql).then(function (postCourse) {
                            console.log("allCourse:"+JSON.stringify(allCourse[0]))
                            console.log("nowCourse:"+JSON.stringify(nowCourse[0]))
                            console.log("finishCourse:"+JSON.stringify(finishCourse[0]))
                            console.log("postCourse:"+JSON.stringify(postCourse[0]))
                            res.render('student_course',{allCourse:allCourse[0],nowCourse:nowCourse[0],finishCourse:finishCourse[0],postCourse:postCourse[0]});
                        })
                    })
                })
            })
        })
    })
});
/*
//所有课程
router.get('/student_allCourse',function (req, res, next) {
    var studentId = 34;
    student.findOne({'where':{studentId:34}}).then(function (student) {
        user.findOne({'where':{userId:student.userId}}).then(function (user) {
            var sql =  "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                "JOIN joinSeries j ON j.courseSeriesId = c.courseSeriesId "+
                //"JOIN teacher t ON t.teacherId = c.courseSeriesTeacher " +
                "WHERE j.studentId ="+ student.studentId;
            db.sequelize.query(sql).then(function (AllCourse) {
                console.log(sql);
                console.log("userId:" + student.userId);
                console.log("allCourse" + JSON.stringify(AllCourse[0]))
                res.render('student_course',{AllCourse:AllCourse[0],NowCourse:[],FinishCourse:[],PostCourse:[]});
            })
        })
    })
})

//已完成课程
router.get('/student_finishCourse',function (req, res, next) {
    var studentId = 34;
    student.findOne({'where':{studentId:34}}).then(function (student) {
        user.findOne({'where':{userId:student.userId}}).then(function (user) {
            var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                "JOIN joinSeries j ON j.courseSeriesId = c.courseSeriesId "+
                "WHERE j.process = 1  and c.endDate < now() and j.studentId ="+student.studentId;
            db.sequelize.query(sql).then(function (FinishCourse) {
                console.log(sql);
                console.log('userId:' + student.userId);
                console.log("finishCourse:" + JSON.stringify(FinishCourse[0]))
                res.render('student_course',{AllCourse:[],NowCourse:[],FinishCourse:FinishCourse[0],PostCourse:[]});
            })
        })
    })
})

router.get('/student_nowCourse',function (req, res, next) {
    var studentId = 34;
    student.findOne({'where':{studentId:34}}).then(function (student) {
        user.findOne({'where':{userId:student.userId}}).then(function (user) {
            var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                "JOIN joinSeries j ON j.courseSeriesId = c.courseSeriesId "+
                "WHERE j.process = 1  and c.endDate >= now() and j.studentId ="+student.studentId;
            db.sequelize.query(sql).then(function (NowCourse) {
                console.log(sql);
                console.log('userId:' + student.userId);
                console.log("nowCourse:" + JSON.stringify(NowCourse[0]))
                res.render('student_course',{AllCourse:[],NowCourse:NowCourse[0],FinishCourse:[],PostCourse:[]});
            })
        })
    })
})

router.get('/student_postCourse',function (req, res, next) {
    var studentId = 34;
    student.findOne({'where':{studentId:34}}).then(function (student) {
        user.findOne({'where':{userId:student.userId}}).then(function (user) {
            var sql = "SELECT j.joinSeriesId,s.seriesName,studentId,hopeTeacher,hopeClassType,hopeTime,other " +
                "FROM joinSeries j " +
                "JOIN seriesTemplate s ON s.templateId = j.templateId " +
                "WHERE process = 0 and j.studentId="+student.studentId;

            db.sequelize.query(sql).then(function (PostCourse) {
                console.log(sql);
                console.log('userId:' + student.userId);
                console.log("PostCourse:" + JSON.stringify(PostCourse[0]))
                res.render('student_course',{AllCourse:[],NowCourse:[],FinishCourse:[],PostCourse:PostCourse[0]});
            })
        })
    })
})
*/
router.get('/course_re',function(req,res,next){
    res.render('course_re');
});





/*课程推荐
* req:
* res:{allCourse:[]}
* */
router.get('/course_re',function (req,res,next) {
    var sql = "select c.courseSeriesId,c.courseSeriesName,c.startDate,a.userName as teacher,c.endDate,c.time,c.room, a.userName " +
        "FROM courseSeries c " +
        "JOIN account a ON c.courseSeriesTeacher = a.userId "+
        "order by userName,time";
    console.log("sql" + sql);
    db.sequelize.query(sql).then(function (data) {
        console.log("course:"+JSON.stringify(data[0]))
        res.render('course_re',{AllCourse:data[0]});
    })
})

/**
 * 教师端
 */
router.get('/teacher',function(req,res,next){
    var teacherId = 37;
    teacher.findOne({'where':{teacherId:37}}).then(function (teacher) {
        user.findOne({'where':{userId:teacher.userId}}).then(function (user) {
            var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                "WHERE c.endDate < now() and c.courseSeriesTeacher =" + teacher.userId;
            db.sequelize.query(sql).then(function (finishCourse) {
                var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                    "FROM courseSeries c " +
                    "JOIN account a ON c.courseSeriesTeacher = a.userId "+
                    "WHERE c.endDate > now() and c.courseSeriesTeacher ="+teacher.userId;
                db.sequelize.query(sql).then(function (nowCourse) {
                    var sql = "SELECT j.joinSeriesId,s.seriesName,studentId,hopeTeacher,hopeClassType,hopeTime,other " +
                        "FROM joinSeries j " +
                        "JOIN seriesTemplate s ON s.templateId = j.templateId " +
                        "WHERE process = 0 and j.hopeTeacher='"+user.userName+"'";
                    db.sequelize.query(sql).then(function (postCourse) {
                        console.log("finishCourse:"+JSON.stringify(finishCourse[0]))
                        console.log("nowCourse:"+JSON.stringify(nowCourse[0]))
                        console.log("postCourse:"+JSON.stringify(postCourse[0]))
                        res.render('teacher_course',{finishCourse:finishCourse[0],nowCourse:nowCourse[0],postCourse:postCourse[0]});
                    })
                })
            })
        })
    })
});
/*
//已完成
router.get('/teacher_finishCourse',function (req, res, next) {
    var teacherId = 37;
    teacher.findOne({'where':{teacherId:37}}).then(function (teacher) {
        user.findOne({'where':{userId:teacher.userId}}).then(function (user) {
            var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId " +
                "WHERE c.endDate < now() and c.courseSeriesTeacher =" + teacher.userId;
            db.sequelize.query(sql).then(function (FinishCourse) {
                console.log(sql);
                console.log('userId:' + teacher.userId)
                console.log('finishCourse:' + JSON.stringify(FinishCourse[0]))
                res.render('teacher_course',{FinishCourse:FinishCourse[0]});
            })
        })
    })

})

//进行中
router.get('/teacher_nowCourse',function (req, res, next) {
    var teacherId = 37;
    teacher.findOne({'where':{teacherId:37}}).then(function (teacher) {
        user.findOne({'where':{userId:teacher.userId}}).then(function (user) {
            var sql = "SELECT c.courseSeriesId,c.courseSeriesName, a.userName as teacher, c.startDate, c.endDate, c.time, c.room "+
                "FROM courseSeries c " +
                "JOIN account a ON c.courseSeriesTeacher = a.userId "+
                "WHERE c.endDate > now() and c.courseSeriesTeacher ="+teacher.userId;
            db.sequelize.query(sql).then(function (NowCourse) {
                console.log(sql);
                console.log('userId:' + teacher.userId)
                console.log('nowCourse:' + JSON.stringify(NowCourse[0]))
                res.render('teacher_course',{NowCourse:NowCourse[0]});
            })
        })
    })
})

//申请中
router.get('/teacher_postCourse',function (req, res, next) {
    var teacherId = 37;
    teacher.findOne({'where':{teacherId:37}}).then(function (teacher) {
        user.findOne({'where':{userId:teacher.userId}}).then(function (user) {
            var sql = "SELECT j.joinSeriesId,s.seriesName,studentId,hopeTeacher,hopeClassType,hopeTime,other " +
                    "FROM joinSeries j " +
                    "JOIN seriesTemplate s ON s.templateId = j.templateId " +
                    "WHERE process = 0 and j.hopeTeacher='"+user.userName+"'";
            db.sequelize.query(sql).then(function (PostCourse) {
                console.log(sql);
                console.log('userId:' + teacher.userId)
                console.log('postCourse:' + JSON.stringify(PostCourse[0]))
                res.render('teacher_course',{PostCourse:PostCourse[0]});
            })
        })
    })
})
*/

router.get('/teacher_detail',function(req,res,next){
    res.render('teacher_detail')
});
router.get('/teacher_re',function(req,res,next){
    res.render('teacher_re')
});

router.post("/editInfo",function (req,res) {
    console.log(JSON.stringify(req.body))
    user.update({
        userName:req.body.userName,
        phoneNumber:req.body.phoneNumber,
        userAddress:req.body.address,
    },{'where':{userId:34}}).then(function (data) {
        student.update({
            grade:req.body.grade,
            school:req.body.school
        },{'where':{userId:34}}).then(
            res.send("123")
        )
    })
})





module.exports = router;
