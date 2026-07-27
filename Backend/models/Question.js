const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema(
    {
        folder: {
            type: Schema.Types.ObjectId,
            ref: 'Folder',
            required: true,
            index: true, // দ্রুত folder ভিত্তিক সার্চের জন্য
        },
        questionText: {
            type: String,
            required: true,
            trim: true,
        },
        questionImage: {
            type: String,
            default: null
        },
        options: {
            type: [String],
            required: true,
        },
        optionImages: {
            type: Map,
            of: String
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        correctAnswerImage: {
            type: String,
            default: null
        },
        explanation: {
            type: String,
            required: false,
             default: '',
            trim: true,
        },
        explanationImage: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Question', questionSchema);