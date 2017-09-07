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

router.get('/teacher_detail',function(req,res,next){
    var teacherId = 37;
    var sql = "SELECT t.class, a.userName ,a.userAge ,t.college ,t.SumScore ,a.phoneNumber ,a.userAddress ,a.userHeadUrl ,a.userFrontIdHeadUrl ,a.userBackIdHeadUrl " +
        "FROM  teacher t " +
        "JOIN account a ON a.userId = t.userId  " +
        "WHERE t.teacherId = " + teacherId;
    db.sequelize.query(sql).then(function (ret) {
        console.log(JSON.stringify(ret));
        console.log(JSON.stringify({data:ret[0][0]}));
        res.render('teacher_detail',{data:ret[0][0]});
    })
});


/**
 * 学生端
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



/*课程推荐
* req:
* res:{allCourse:[]}
* */
router.get('/teacher_re',function (req,res,next) {
    var sql = "select c.courseSeriesId,c.courseSeriesName,c.startDate,a.userName as teacher,c.endDate,c.time,c.room, a.userName " +
        "FROM courseSeries c " +
        "JOIN account a ON c.courseSeriesTeacher = a.userId "+
        "order by userName,time";
    console.log("sql" + sql);
    db.sequelize.query(sql).then(function (data) {
        console.log("course:"+JSON.stringify(data[0]))
        res.render('teacher_re',{AllCourse:data[0]});
    })
})


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
router.post("/changeInfo",function (req,res) {
    console.log(JSON.stringify(req.body))
    user.update({
        userName:req.body.userName,
        phoneNumber:req.body.phoneNumber,
        userAddress:req.body.address,
    },{'where':{userId:87}}).then(function (data) {
        teacher.update({
            class:req.body.grade,
            college:req.body.school,
        },{'where':{userId:87}}).then(
            res.send("123")
        )
    })
})
/*
 *教务
 */
router.get('/education',function(req,res){
    series.seriesTemplate.findAll().then(function (data) {
        var sql = "SELECT userId,userName " +
            "FROM account where role = 1 order by userName"
        db.sequelize.query(sql).then(function (studentList) {
            var sql = "SELECT s.templateId,s.seriesName,COUNT(j.studentId) as studentNumber " +
                "from seriesTemplate s " +
                //"JOIN student st ON st.studentId = j.studentId " +
                "JOIN joinSeries j ON s.templateId = j.templateId " +
                "where j.process = 0 group by templateId";
            db.sequelize.query(sql).then(function (postCourse) {
                console.log("post:"+JSON.stringify({allCourse:data,student:studentList[0],postCourse:postCourse[0]}))
                res.render('education_course',{allCourse:data,studentList:studentList[0],postCourse:postCourse[0]})
            })
        })
    })
});
router.post('/addTemplate',function (req, res) {
    var courseSeriesName = req.body.courseSeriesName;
    var courseSeriesGrade = req.body.courseSeriesGrade;
    var courseSeriesNumber = req.body.courseSeriesNumber;
    var courseSeriesIntro = req.body.courseSeriesIntro;
    var courseSeriesCourseName = req.body.courseSeriesCourseName;
    console.log("courseSeriesCourseName:"+JSON.stringify(courseSeriesCourseName));
    series.seriesTemplate.create({
        seriesName:courseSeriesName,
        seriesIntro:courseSeriesIntro,
        grade:courseSeriesGrade,
        number:courseSeriesNumber,
        courseName:JSON.stringify(courseSeriesCourseName)
    }).then(function (data) {
        console.log("data:"+JSON.stringify(data));
        res.send("添加成功");
    }).catch(function (err) {
        console.log("err:"+err);
        res.send(err);
    })
})



router.get('/education_detail',function(req,res,next){
    res.render('education_detail')
});
router.get('/education_teacher',function(req,res,next){
    res.render('education_teacher')
});
router.get('/education_allocate',function(req,res,next){
    res.render('education_allocate')
});
router.get('/education_teacherdetail',function(req,res,next){
    res.render('education_teacherdetail')
});
router.get('/education_teacherchoose',function(req,res,next){
    res.render('education_teacherchoose')
});



module.exports = router;
