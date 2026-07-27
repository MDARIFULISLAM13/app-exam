
const mongo = require( 'mongoose' );

exports.ConnectDb = async () =>
{
    try
    {
        await mongo.connect( process.env.MONGO_URI );
        console.log( 'MongoDB connected' );
    } catch ( err )
    {
        console.error( err.message );
        process.exit( 1 );
    }
}

