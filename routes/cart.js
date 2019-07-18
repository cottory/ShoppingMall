const express = require('express');
const router = express.Router();

var csrf = require('csurf');  //csrf셋팅
var csrfProtection = csrf({ cookie: true });  //csrf셋팅2


router.get('/', csrfProtection, (req,res) => {

  var totalAmount = 0;  //총결제금액
  var cartList = {};  //장바구니 리스트
  
  //쿠키가 있는지 확인해서 뷰로 넘겨줍니다.
  //백엔드에서 cookies에 접근하고 싶다면 reqest객체를 통해 사용 가능합니다
  if (typeof(req.cookies.cartList) !== 'undefined') {
    //장바구니 데이터
    cartList = JSON.parse(unescape(req.cookies.cartList));  
                            //unescape: 잘못된 특수문자가 들어간 경우 제거해줍니다.

    //총 가격을 더해서 전달해줍니다.
    for (let key in cartList){
      totalAmount += parseInt(cartList[key].amount);
    }
  }
  res.render('cart/index', { cartList: cartList, totalAmount: totalAmount, csrfToken: req.csrfToken()});
});

module.exports = router;