/**
 * 자바스크립트 객체와 실제 테이블을 매핑하기 위해서는 모델을 정의해야 합니다.
 * Sequelize에서 Model은 Database공간의 Table의 Schema를 표현하는 수단입니다.
 * 
 * define 메소드의 첫번째 파라미터는 model의 name 입니다. 
 * 두번째 파라미터가 실제로 Table Schema와 맵핑되는 정보입니다.    
 */

const moment = require('moment');

module.exports = function(sequelize, DataTypes){
    var Products = sequelize.define('Products',
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            name : { type: DataTypes.STRING },
            thumbnail : { type: DataTypes.STRING },
            price : { type: DataTypes.INTEGER },
            description : { type: DataTypes.TEXT }
        }
    );
    
    Products.associate = (models) => {

        // 메모 모델에 외래키 걸기
        Products.hasMany(models.ProductsMemo, { as: 'Memo', foreignKey: 'product_id', sourceKey: 'id' , onDelete: 'CASCADE'});

        Products.belongsTo(models.User, { as: 'Owner',  foreignKey: 'user_id', targetKey: 'id'} );
    };

    Products.prototype.dateFormat = (date) => (
        moment(date).format('YYYY-MM-DD')
    );
    
    return Products;
}