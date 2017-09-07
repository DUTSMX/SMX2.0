var express = require('express');
var router = express.Router();
var db = require("../model/db");
var course=require('../model/course');
var user=require(('../model/user'));
var series = require('../model/series');
var joinreceptionshop=require('../model/joinreceptionshop');
var joinreceptionmanager=require('../model/joinreceptionmanager');
var student = require("../model/student");
var teacher = require("../model/teacher");
var http=require("http");
/* GET home page. */
router.get('/appSign', function (req, res, next) {
    var opt = {
        method: "GET",
        host: "www.shangmingxiao.com.cn",
        port: 80,
        path: "/appSign?sign_type=appSign&expired="+req.query.expired+"&bucketName="+req.query.bucketName
    };
    var req1 = http.request(opt, function (serverFeedback) {
        serverFeedback.setEncoding("utf8");
        serverFeedback.on('data', function (body) {
            res.send(body)
        })
    });
    req1.on('error', function (e) {
        console.log("problem with request " + e.message);
    });
    req1.end();
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/student_detail',function(req,res,next){
    var studentId = 16;
    var sql = "SELECT a.userName ,a.userAge ,a.userId ,s.school ,s.grade ,s.personalSign ,a.phoneNumber ,a.userAddress ,a.userHeadUrl ,a.userFrontIdHeadUrl ,a.userBackIdHeadUrl " +
        "FROM  student s " +
        "JOIN account a ON a.userId = s.userId  " +
        "WHERE s.studentId = " + studentId;
    db.sequelize.query(sql).then(function (ret) {
        //console.log(JSON.stringify(ret));
        //console.log(JSON.stringify({data:ret[0][0]}));
        res.render('student_detail',{data:ret[0][0]});
    })
});


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
                            console.log("allCourse:"+JSON.stringify(allCourse[0]));
                            console.log("nowCourse:"+JSON.stringify(nowCourse[0]));
                            console.log("finishCourse:"+JSON.stringify(finishCourse[0]));
                            console.log("postCourse:"+JSON.stringify(postCourse[0]));
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
/*
router.get('/course_re',function(req,res,next){
    res.render('course_re');
});
*/




/*课程推荐
* req:
* res:{allCourse:[]}
* */
router.get('/teacher_re',function (req,res,next) {
    var sql = "select c.courseSeriesId,c.courseSeriesName,c.courseSeriesSubject, c.courseSeriesGrade,c.startDate,a.userName as teacher,c.endDate,c.time,c.room, a.userName " +
        "FROM courseSeries c " +
        "JOIN account a ON c.courseSeriesTeacher = a.userId "+
        "order by userName,time";
    console.log("sql" + sql);
    db.sequelize.query(sql).then(function (data) {
        console.log("course:"+JSON.stringify(data[0]));
        res.render('teacher_re',{AllCourse:data[0]});
    })
});


router.get('/course_re',function (req,res,next) {
    var sql = "select c.courseSeriesId,c.courseSeriesName,c.courseSeriesSubject, c.courseSeriesGrade, c.startDate,a.userName as teacher,c.endDate,c.time,c.room, a.userName " +
        "FROM courseSeries c " +
        "JOIN account a ON c.courseSeriesTeacher = a.userId "+
        "order by userName,time";
    console.log("sql" + sql);
    db.sequelize.query(sql).then(function (data) {
        console.log("course:"+JSON.stringify(data[0]));
        res.render('course_re',{AllCourse:data[0]});
    })
});

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
                        console.log("finishCourse:"+JSON.stringify(finishCourse[0]));
                        console.log("nowCourse:"+JSON.stringify(nowCourse[0]));
                        console.log("postCourse:"+JSON.stringify(postCourse[0]));
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
    console.log("123"+JSON.stringify(req.body));
    user.update({
        userName:req.body.userName,
        phoneNumber:req.body.phoneNumber,
        userAddress:req.body.address,
    },{'where':{userId:req.body.userId}}).then(function (data) {
        student.update({
            grade:req.body.grade,
            school:req.body.school,
        },{'where':{userId:req.body.userId}}).then(
            res.send("123")
        )
    })
});
router.post("/changeInfo",function (req,res) {
    console.log(JSON.stringify(req.body));
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
});
router.post("/imgInfo",function (req,res) {
    console.log("111");
    //console.log(JSON.stringify(req.body))
    user.update({
        userFrontIdHeadUrl: req.body.userFrontIdHeadUrl,
        userBackIdHeadUrl: req.body.userBackIdHeadUrl,
    }, {'where': {userId:34 }}).then(function (data) {
        res.send("修改成功")

    })
});
/*
 *教务
 */
router.get('/education',function(req,res,next){
    res.render('education_course')
});
router.get('/education_detail',function(req,res,next){
    res.render('education_detail')
});
router.get('/education_teacher',function(req,res,next){

    var sql = "SELECT t.teacherId as teacherId, t.college, a.userName, t.teachClass, count(c.courseSeriesTeacher) as teacherCount "+
        "FROM account a JOIN teacher t ON a.userId = t.userId LEFT JOIN courseSeries c ON a.userId = c.courseSeriesTeacher "+
        "WHERE role = 2 GROUP BY a.userId ORDER BY userName DESC, teacherCount "
    db.sequelize.query(sql).then(function(teacherList){
        console.log("teacherList:"+JSON.stringify(teacherList[0]));
        res.render('education_teacher',{teacher:teacherList[0]});
    })

});
router.get('/education_allocate',function(req,res,next){
    res.render('education_allocate')
});
/*
router.get('/education_teacherdetail',function(req,res,next){
    res.render('education_teacherdetail')
});
*/
router.get('/education_teacherdetail',function (req,res,next) {
    teacher.findOne({'where':{teacherId:req.query.teacherId}}).then(function (teacher) {
        user.findOne({'where':{userId:teacher.userId}}).then(function (user) {
            user.teacherId =req.query.teacherId;

                var sql = "SELECT t.teachClass, a.userName ,a.userAge ,t.college ,t.SumScore ,a.phoneNumber ,a.gender  " +
                    "FROM  teacher t " +
                    "JOIN account a ON a.userId = t.userId  " +
                    "WHERE t.teacherId = " + user.teacherId;
                db.sequelize.query(sql).then(function (ret) {
                    console.log(JSON.stringify(ret));
                    console.log(JSON.stringify({teacher:ret[0][0]}));
                    res.render('education_teacherdetail',{teacher:ret[0][0]});

            })
        })
    })
})

router.get('/education_teacherchoose',function(req,res,next){




    var sql = "SELECT t.teacherId as teacherId,t.college, a.userName, t.teachClass, count(c.courseSeriesTeacher) as teacherCount "+
        "FROM account a JOIN teacher t ON a.userId = t.userId LEFT JOIN courseSeries c ON a.userId = c.courseSeriesTeacher "+
        "WHERE role = 2 GROUP BY a.userId ORDER BY userName DESC, teacherCount "
    db.sequelize.query(sql).then(function(teacherList){
        console.log("teacherList:"+JSON.stringify(teacherList[0]));
        res.render('education_teacherchoose',{teacher:teacherList[0]});
    })
});

router.post("/education_teacherchoose",function (req,res) {
    console.log(JSON.stringify(req.body));
    /*
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
            res.render('education_teacherchoose',{teacher:teacherList[0]})
        )
    })*/
    res.res("1243");
})



module.exports = router;
