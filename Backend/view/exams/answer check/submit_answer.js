const { jwtVerify_user } = require("../../../jwt/users/jwt_users");
const {
  Course,
  Exam,
  LeaderboardEntry,
  StudentExamAttempt,
} = require("../../../models/course_model");
const users_model = require("../../../models/users_model");
const { UserKey } = require("../../../models/users_model");
const { getPackageKey } = require("../../../package_token/token");
//check done
exports.submit_answer = async (req, res) => {
  try {
    const { course_name, exam_name, token, answers } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Session Expired. Please log in again.",
      });
    }

    const decoded = jwtVerify_user(token);
    if (!decoded || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid token. Please log in again.",
      });
    }

    const email = decoded.email;

    if (!course_name || !exam_name || !token || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await users_model
      .findOne({
        email: decoded.email,
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const email_ck = decoded.email.replace(/\./g, "_dot_").toLowerCase();

    const course = await Course.findOne(
      { course_name },
      "_id course_name enrolledUsers included_in_package",
    ).lean();

    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    let enrolled = course.enrolledUsers?.[email_ck] === true;

    // Package access check
    if (!enrolled && course.included_in_package) {
      const userKeys = await UserKey.find(
        { user: user._id },
        { key: 1, _id: 0 },
      ).lean();

      for (const item of userKeys) {
        if (getPackageKey(item.key)) {
          enrolled = true;
          break;
        }
      }
    }

    if (!enrolled) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    const exam = await Exam.findOne(
      { course: course._id, exam_name },
      "exam_name start leaderboard questions negative_mark",
    ).lean();

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Check attempt count (max 3 attempts allowed)
    const attemptRecord = await StudentExamAttempt.findOne({
      exam: exam._id,
      email,
    }).lean();

    if (attemptRecord && attemptRecord.attemptCount >= 3) {
      return res.status(403).json({
        error: `You have reached the maximum number of attempts (3) for this exam.`,
      });
    }

    const now = new Date();

    const existingEntry = await LeaderboardEntry.findOne({
      exam: exam._id,
      email,
    }).lean();

    if (existingEntry && now < exam.leaderboard) {
      return res.status(403).json({
        error: "You have already submitted the exam answers.",
      });
    }

    const userAnswerMap = new Map(
      answers
        .filter((a) => a.question_id && a.answer !== undefined)
        .map((a) => [a.question_id.toString(), a.answer]),
    );

    let right = 0;
    let wrong = 0;
    let notAnswered = 0;
    const answersResult = [];

    for (const question of exam.questions) {
      const qId = question._id.toString();
      const userAns = userAnswerMap.get(qId);

      let status;
      if (userAns === undefined) {
        notAnswered++;
        status = "notAnswered";
      } else if (userAns === question.correct_answer) {
        right++;
        status = "correct";
      } else {
        wrong++;
        status = "wrong";
      }

      answersResult.push({
        // question_id: qId,
        // question_text: question.question_text,
        // correct_answer: question.correct_answer,
        // user_answer: userAns === undefined ? null : userAns,
        // explanation: question.explanation,
        // status

        question_id: qId,

        correct_answer: question.correct_answer,
        correct_answer_image: question.correct_answer_image || null,

        user_answer: userAns === undefined ? null : userAns,

        explanation: question.explanation,
        explanation_image: question.explanation_image || null,

        status,
      });
    }

    let marks = right - wrong * exam.negative_mark;

    if (marks < 0) {
      marks = 0;
    }

    if (!existingEntry && now < exam.leaderboard) {
      await LeaderboardEntry.create({
        exam: exam._id,
        email,
        correctAnswers: marks,
        submittedAt: now,
      });
    }

    // Update or create attempt record
    if (attemptRecord) {
      await StudentExamAttempt.findByIdAndUpdate(
        attemptRecord._id,
        { attemptCount: attemptRecord.attemptCount + 1 },
        { new: true },
      );
    } else {
      await StudentExamAttempt.create({
        exam: exam._id,
        email,
        attemptCount: 1,
      });
    }

    return res.status(200).json({
      right,
      wrong,
      notAnswered,
      marks,
      answersResult,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
