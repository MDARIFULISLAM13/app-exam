const mongoose = require('mongoose');
const { Schema } = mongoose;

/* Folder */
const studyCornerFolderSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'StudyCornerFolder',
            default: null,
            index: true,
        },
        path: [
            {
                type: Schema.Types.ObjectId,
                ref: 'StudyCornerFolder',
            },
        ],
    },
    { timestamps: true }
);

/* Question */
const studyCornerQuestionSchema = new Schema(
    {
        folder: {
            type: Schema.Types.ObjectId,
            ref: 'StudyCornerFolder',
            required: true,
            index: true,
        },

        questionType: {
            type: String,
            enum: ['mcq', 'cq'],
            required: true,
        },

        questionText: {
            type: String,
            required: true,
            trim: true
        },

        questionImage: {
            type: String,
            default: null
        },

        options: {
            type: [String],
            default: []
        },

        optionImages: {
            type: Map,
            of: String
        },

        correctAnswer: {
            type: String,
            required: true,
            trim: true
        },

        correctAnswerImage: {
            type: String,
            default: null
        },

        explanation: {
            type: String,
            trim: true,
            default: ''
        },

        explanationImage: {
            type: String,
            default: null
        }

    },
    { timestamps: true }
);

module.exports = {
    StudyCornerFolder: mongoose.model(
        'StudyCornerFolder',
        studyCornerFolderSchema
    ),
    StudyCornerQuestion: mongoose.model(
        'StudyCornerQuestion',
        studyCornerQuestionSchema
    ),
};