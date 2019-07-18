/**
 * 결제기능 관련 라우터
 */
const express = require('express');
const models = require('../models');
const router = express.Router();
var dotenv = require('dotenv');

var csrf = require('csurf');  //csrf셋팅
var csrfProtection = csrf({ cookie: true });  //csrf셋팅2
dotenv.config(); //LOAD CONFIG

router.get('/', csrfProtection, (req,res) => {

    var totalAmount = 0;  //총 결제 금액
    var cartList = {};    //장바구니 리스트
    
    //쿠키가 있는지 확인 후 뷰로 넘겨준다.
    if( typeof(req.cookies.cartList) !== 'undefined') {
      cartList = JSON.parse(unescape(req.cookies.cartList));
      
      for (let key in cartList) {
        totalAmount += parseInt(cartList[key].amount);
      }
    }
    
    res.render('checkout/index', { cartList: cartList, totalAmount: totalAmount, csrfToken: req.csrfToken() });
});

/**
 * IAMPORT API 사용에 따라 추가되는 routing
 * get방식으로 호출을 하는데, IAMPORT 모듈을 호출하면 impuid를 res.send에서 만들어줍니다.
 */
router.get('/complete', async (req,res)=>{

  const { Iamporter } = require('iamporter');
  const iamporter = new Iamporter({
    apiKey: process.env.IAMPORT_APIKEY,
    secret: process.env.IMAPORT_SECRET
  });

  try{

      const iamportData = await iamporter.findByImpUid(req.query.imp_uid);

      await models.Checkout.create({
          imp_uid : iamportData.data.imp_uid,
          merchant_uid : iamportData.data.merchant_uid,
          paid_amount : iamportData.data.amount,
          apply_num : iamportData.data.apply_num,
          
          buyer_email : iamportData.data.buyer_email,
          buyer_name : iamportData.data.buyer_name,
          buyer_tel : iamportData.data.buyer_tel,
          buyer_addr : iamportData.data.buyer_addr,
          buyer_postcode : iamportData.data.buyer_postcode,
  
          status : "결제완료",
      });

      res.redirect('/checkout/success');

  }catch(e){
      console.log(e);
  }

});

router.post('/complete', async (req, res) => {

  try{
 
    await models.Checkout.create(req.body);;
    res.json({message:"success"});

  }catch(e){
      console.log(e);
  }

});

router.get('/success', ( _, res) => {
    res.render('checkout/success');
});

router.get('/nomember', csrfProtection, ( req, res) => {
  res.render('checkout/nomember', { csrfToken: req.csrfToken() });
});

router.get('/nomember/search', csrfProtection, async (req, res) => {
  try {
    const checkouts = await models.Checkout.findAll({
        where : {
            buyer_email : req.query.buyer_email
        }
    }) 
    res.render('checkout/search', { checkouts, csrfToken: req.csrfToken() } );
  } catch (e) {
    console.log(e);
  }
})

module.exports = router;