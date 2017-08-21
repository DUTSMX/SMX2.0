var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/student_detail',function(req,res,next){
  res.render('student_detail');
});

router.get('/student',function(req,res,next){
  res.render('student_course');
});
router.get('/course_re',function(req,res,next){
    res.render('course_re');
});

// router.post("/postHope",function (req,res) {
//     series.joinSeries.findAll({where:{templateId:req.body.templateId,studentId:req.body.studentId}}).then(function (joinList) {
//         if (joinList.length == 0){
//             series.joinSeries.create({
//                 templateId:req.body.templateId,
//                 studentId:req.body.studentId,
//                 classType:req.body.classType,
//                 hopeTime:req.body.hopeTime,
//                 other:req.body.other
//             }).then(function () {
//                 res.send({status:true,desc:"提交成功"})；
//             })
//         }else{
//             res.send({status:false,desc:"您已经报名该课程"})
//         }
//     })
//
// })
module.exports = router;
