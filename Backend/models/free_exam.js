// models/free_exam.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ============================================================
   1) Question Schema (inside FreeExam)
   ============================================================ */
const questionSchema = new Schema(
    {
        question_text: {
            type: String,
            required: true,
            trim: true,
        },

        question_image: {
            type: String,
            default: null
        },

        options: {
            type: [String],
            required: true,
        },

        option_images: {
            type: Map,
            of: String
        },

        correct_answer: {
            type: String,
            required: true,
            trim: true,
        },

        correct_answer_image: {
            type: String,
            default: null
        },

        explanation: {
            type: String,
            required: false,
             default: '',
            trim: true,
        },

        explanation_image: {
            type: String,
            default: null
        }

    },
    {
        _id: true,
        timestamps: false,
    }
);

// প্রশ্ন আইডি দিয়ে খোঁজার জন্য
questionSchema.index({ _id: 1 });


/* ============================================================
   2) Free Exam Schema
   ============================================================ */

const freeExamSchema = new Schema(
    {
        // এই course সবসময় একটাই থাকবে, নাম fixed
        course_name: {
            type: String,
            default: "free_exam",
            immutable: true,
            index: true,
            trim: true,
        },
        exam_name: {
            type: String,
            required: true,
            trim: true,
        },
        start: {
            type: Date,
            index: true, // exam start সময় check এর জন্য
        },
        leaderboard: {
            type: Date,
            index: true, // leaderboard সময় check এর জন্য
        },
        questions: {
            type: [questionSchema],
            default: [],
        },
        negative_mark: {
            type: Number,
            default: 0, // কিছু না দিলে auto 0 = no negative
        },
        exam_time: {
            type: Number,
        }
    },
    {
        timestamps: true,
    }
);

// same নামের free exam একবারই থাকুক (চাইলে multiple ও করতে পারো, then unique: false)
freeExamSchema.index(
    { course_name: 1, exam_name: 1 },
    { name: "free_exam_course_exam_name", unique: true }
);


/* ============================================================
   3) Leaderboard Schema (Free Exam)
   ============================================================ */

const freeExamLeaderboardEntrySchema = new Schema(
    {
        exam: {
            type: Schema.Types.ObjectId,
            ref: "FreeExam",
            required: true,
            index: true,
        },
        Mobile: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        institute: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        correctAnswers: {
            type: Number,
            required: true,
            min: 0,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// ranking এর জন্য fast index
freeExamLeaderboardEntrySchema.index(
    { exam: 1, correctAnswers: -1, submittedAt: 1 },
    { name: "free_exam_score_ranking" }
);

// exam অনুযায়ী সব submission fast lookup
// freeExamLeaderboardEntrySchema.index({ exam: 1 });


/* ============================================================
   Export Models
   ============================================================ */

const FreeExam = mongoose.model("FreeExam", freeExamSchema);
const FreeExamLeaderboardEntry = mongoose.model(
    "FreeExamLeaderboardEntry",
    freeExamLeaderboardEntrySchema
);

module.exports = {
    FreeExam,
    FreeExamLeaderboardEntry,
};