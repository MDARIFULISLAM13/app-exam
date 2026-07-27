const { jwtVerify_user } = require( "../../jwt/users/jwt_users" );
const users_model = require( "../../models/users_model" );

//check done
exports.view_user_account = async ( req, res ) =>
{

    const { token } = req.body;


    try
    {

        if ( !token )
        {

            return res.send( {
                status: false,
                token_issue: true,
                msg: "Session Expire!"
            } )
        }

        const decoded = jwtVerify_user( token );
        if ( !decoded )
        {
            return res.status( 400 ).json( { status: false, token_issue: true, msg: "Session Expire!" } );
        }

        const email = decoded.email

        const user = await users_model.findOne( { email } );
        if ( !user )
        {
            return res.send( {
                status: false,
                msg: "User Not found!"
            } )


        }
        return res.send( {
            status: true,
            msg: user
        } )


    }
    catch ( e )
    {
        return res.send( {
            status: false,
            msg: e
        } )

    }
}

//check done

exports.change_password_user = async ( req, res ) =>
{
    try
    {
        const { token, old_password, new_password } = req.body;



        if ( !token )
        {
            return res.status( 400 ).json( { success: false, token_issue: true, message: "Session Expired. Please log in again." } );
        }

        const decoded = jwtVerify_user( token );
        if ( !decoded )
        {
            return res.status( 401 ).json( { success: false, token_issue: true, message: "Session Expired. Please log in again." } );
        }

        const email = decoded.email;

        const user = await users_model.findOne( { email } );

        if ( !user )
        {
            return res.status( 404 ).json( { success: false, message: "User not found" } );
        }

        if ( user.password != old_password )
        {


            return res.status( 404 ).json( { success: false, message: "Old password is incorrect. Please try again." } );

        }

        user.password = new_password;
        await user.save();

        res.json( {
            success: true,
            message: "Password updated successfully",
        } );

    } catch ( err )
    {
        res.status( 500 ).json( { success: false, message: "Server error" } );
    }
};
