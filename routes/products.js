/**
 * 장바구니 기능 구현을 위한 라우팅
 */
const express = require('express');
const router = express.Router();
const models = require('../models');

router.get('/:id', async (req,res) => {

    try {
        // const product = await models.Products.findByPk(req.params.id);
        const product = await models.Products.findOne({
            where : {
                id : req.params.id
            },
            include :[
                'Memo'
            ]
        });
        res.render('products/detail', { product });  
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;
