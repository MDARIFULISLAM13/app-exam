const mongoose = require( 'mongoose' );

const enroll_request_Schema = new mongoose.Schema( {
    course_name: { type: String, required: true },
    package_id: { type: String },
    payment_method: { type: String, required: true },
    payment_number: { type: String, required: true },
    txid: { type: String, required: true },
    sending_number: { type: String, required: true },
    calling_number: { type: String, required: true },
    email: { type: String, required: true },
    referral_code: { type: String }
} ); 
    
module.exports = mongoose.model( 'enroll_request', enroll_request_Schema );


