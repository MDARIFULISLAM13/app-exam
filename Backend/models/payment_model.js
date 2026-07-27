
const mongo = require( 'mongoose' );

const Payment_Schema = mongo.Schema( {

    method_name: {
        type: String,
        required: true
    },
    Number: {
        type: String,
        required: true,
    },
} )

module.exports = mongo.model( 'Payment', Payment_Schema );