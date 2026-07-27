// models/course_model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ============================================================
   1) Notice / PDF Schema (One Document Per Course)
   ============================================================ */

const courseNoticeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    text: {
      type: String,
      default: "",
      trim: true,
    },

    images: [
      {
        filename: String,
        url: String,
      },
    ],

    pdfFilename: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    pdfOriginalName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// index for fast course-wise notice
courseNoticeSchema.index({ course: 1, createdAt: -1 });

/* ============================================================
   2) Question Schema (inside Exam)
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
      default: null,
    },

    options: {
      type: [String],
      required: true,
    },

    option_images: {
      type: Map,
      of: String,
    },

    correct_answer: {
      type: String,
      required: true,
      trim: true,
    },

    correct_answer_image: {
      type: String,
      default: null,
    },

    explanation: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },

    explanation_image: {
      type: String,
      default: null,
    },
  },
  {
    _id: true,
    timestamps: false,
  },
);

// index each question inside exam
questionSchema.index({ _id: 1 });

/* ============================================================
   3) Leaderboard Schema
   ============================================================ */

const leaderboardEntrySchema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    email: {
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
  { timestamps: true },
);

// ranking optimization (already good)
leaderboardEntrySchema.index(
  { exam: 1, correctAnswers: -1, submittedAt: 1 },
  { name: "exam_score_ranking" },
);

// faster lookup by exam only
// leaderboardEntrySchema.index({ exam: 1 });

/* ============================================================
   3.5) Student Exam Attempt Schema (Track Max 3 Attempts)
   ============================================================ */

const studentExamAttemptSchema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    attemptCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
  },
  { timestamps: true },
);

// unique index: one student can only have one attempt record per exam
studentExamAttemptSchema.index({ exam: 1, email: 1 }, { unique: true });

/* ============================================================
   4) Exam Schema
   ============================================================ */

const examSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    exam_name: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Date,
      index: true, // fast exam start checking
    },
    leaderboard: {
      type: Date,
      index: true, // fast leaderboard time checking
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    negative_mark: {
      type: Number,
      default: 0,
    },
    exam_time: {
      type: Number,
    },
  },
  { timestamps: true },
);

// fast exam lookup
examSchema.index({ course: 1, exam_name: 1 });

/* ============================================================
   5) Course Schema (MAIN)
   ============================================================ */

const courseSchema = new Schema(
  {
    course_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course_price: {
      type: Number,
      required: true,
      min: 0,
    },
    course_max_price: {
      type: Number,
    },
    course_image: {
      type: String,
      default: null,
    },
    course_duration: {
      type: String,
      trim: true,
    },
    total_exam: {
      type: String,
      trim: true,
    },
    included_in_package: {
      type: Boolean,
      default: false,
    },
    course_details: {
      type: String,
      default: "",
      trim: true,
    },
    vedio_link: {
      type: String,
      default: "",
      trim: true,
    },

    // store ONLY ONE notice/pdf document id

    // exams list
    exams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        index: true,
      },
    ],

    enrolledUsers: {
      type: Map,
      of: Boolean,
      default: {},
    },
    enrolledUsersTime: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true },
);

// important course indexing
// courseSchema.index({ course_name: 1 }, { unique: true });
// courseSchema.index({ exams: 1 });
// allow fast check if user enrolled
courseSchema.index({ "enrolledUsers.$**": 1 });

/* ============================================================
   Export Models
   ============================================================ */

const Course = mongoose.model("Course", courseSchema);
const Exam = mongoose.model("Exam", examSchema);
const LeaderboardEntry = mongoose.model(
  "LeaderboardEntry",
  leaderboardEntrySchema,
);
const StudentExamAttempt = mongoose.model(
  "StudentExamAttempt",
  studentExamAttemptSchema,
);
const CourseNotice = mongoose.model("CourseNotice", courseNoticeSchema);

module.exports = {
  Course,
  Exam,
  LeaderboardEntry,
  StudentExamAttempt,
  CourseNotice,
};
