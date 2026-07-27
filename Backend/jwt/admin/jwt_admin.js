const jwt = require( 'jsonwebtoken' );

exports.jwtgen_admin = function ( username )
{
    return jwt.sign(
        { username: username },
        process.env.JWT_SECRET_admin
    );
};

exports.jwtVerify_admin = function ( token )
{
    try
    {
        return jwt.verify( token, process.env.JWT_SECRET_admin ); 
    } catch ( err )
    {
        return null;
    }
};

exports.adminCheck = function (token) {
    if (!token) return false;

    const decoded = exports.jwtVerify_admin(token);
    if (!decoded) return false;

    if (decoded.username !== process.env.admin_user) return false;

    return true;
};


