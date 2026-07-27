const jwt = require( 'jsonwebtoken' );


exports.jwtgen_user = function ( email )
{

    return jwt.sign(
        { email: email },
        process.env.JWT_SECRET_member

    );
};


exports.jwtVerify_user = function ( token )
{
    try
    {
        return jwt.verify( token, process.env.JWT_SECRET_member );
    } catch ( err )
    {
        return null;
    }
};
