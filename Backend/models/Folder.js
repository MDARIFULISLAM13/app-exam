const mongoose = require('mongoose');
const { Schema } = mongoose;

const folderSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
            index: true, // দ্রুত parent ভিত্তিক সার্চের জন্য
        },
        path: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Folder',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Folder', folderSchema);
