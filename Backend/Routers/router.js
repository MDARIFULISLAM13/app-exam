const express = require("express");
const {
  admin_login,
  admin_secret_change,
} = require("../Accounts/login/admin/login");
const {
  add_new_course,
  upload_course_image,
} = require("../view/courses/add course/add_course");
const {
  view_all_courses,
} = require("../view/courses/view course admin/view_course");
const {
  delete_course,
} = require("../view/courses/delete course/delete_course");
const { add_new_exam } = require("../view/exams/add exam/add_exam");
const {
  add_question_to_exam,
} = require("../view/exams/question/add question/question_add");
const {
  delete_question_from_exam,
} = require("../view/exams/question/delete question/question_delete");
const {
  user_view_question_to_exam,
} = require("../view/exams/view exams/users/view_exam_user");
const {
  admin_view_question_to_exam,
} = require("../view/exams/view exams/admin/view_exam_admin");
const { all_exam_list } = require("../view/exams/view exam list/exam_list");
const { sign_up } = require("../Accounts/sign up/user_signup");
const { verifyOtp } = require("../Accounts/otp/otpverify");
const { members_log_in } = require("../Accounts/login/users/login_user");
const { add_user } = require("../view/courses/user manage/add user/add_user");
const {
  view_user_all_courses,
} = require("../view/courses/view course users/view_course_user");
const { update_exam } = require("../view/exams/update exam/exam_update");
const { submit_answer } = require("../view/exams/answer check/submit_answer");
const {
  view_leaderboard,
} = require("../view/exams/leaderboard/view_leaderboard");
const { edit_course } = require("../view/courses/edit course/edit_course");
const {
  view_methods,
  add_method,
  update_method,
  delete_method,
} = require("../view/courses/payment method/payment");
const {
  add_enroll,
  get_all_enrolls,
  delete_enroll,
} = require("../view/courses/user manage/user request/enroll_course");
const { delete_exam } = require("../view/exams/delete exam/exam_delete");
const {
  reset_password,
  setNewPassword,
} = require("../Accounts/password/reset password/reset_password");
const {
  view_user_account,
  change_password_user,
} = require("../Accounts/view_user_account/view_account");
const {
  view_user,
} = require("../view/courses/user manage/view user/view_user");
const {
  remove_user,
} = require("../view/courses/user manage/remove user/remove_user");
const {
  update_question,
} = require("../view/exams/question/update question/question_update");
const {
  folder1,
  folder2,
  folder3,
  folder4,
  folder5,
  folder6,
  folder7,
  upload_question_images,
  folder8,
} = require("../view/question_bank/question");
const {
  qb_root,
  qb_get_folder,
  import_questions_from_bank,
} = require("../view/exams/question/import question/import");
const {
  list_course_notice,
  add_course_notice,
  update_course_notice,
  delete_course_notice,
  user_list_course_notice,
  upload_course_notice,
  create_course_notice,
  list_course_notices,
} = require("../view/exams/notice&pdf/notice");
const {
  add_new_free_exam,
  all_free_exam_list,
  update_free_exam,
  delete_free_exam,
  admin_free_exam_view_question,
  add_question_to_free_exam,
  import_questions_from_bank_free,
  delete_question_from_FREE_exam,
  update_free_exam_question,
  free_all_exam_list,
  user_view_question_to_free_exam,
  submit_Free_exam_answer,
  view_leaderboard_free,
  admin_view_leaderboard_free,
} = require("../view/exams/free_exam/free_exam");
const {
  create_member,
  list_members,
  update_member,
  delete_member,
  upload_member_image,
} = require("../view/about/about");
const {
  upload_notice_image,
  create_notice,
  list_notices,
  get_notice,
  update_notice,
  delete_notice,
} = require("../view/notice/notice_controller");
const {
  study_corner_root,
  study_corner_get,
  study_corner_create_folder,
  study_corner_update_folder,
  study_corner_create_question,
  study_corner_update_question,
  study_corner_delete_question,
  user_get_root,
  user_get_folder,
  study_corner_delete_folder,
} = require("../view/study_corner/admin");
const {
  create_gk,
  update_gk,
  delete_gk,
  get_all_gk,
} = require("../view/recent_GK/recent_GK");
const {
  upload_job_circular_image,
  create_job_circular,
  update_job_circular,
  list_job_circulars,
  get_job_circular,
  delete_job_circular,
} = require("../view/job_circula/job");
const {
  banner_notice_create,
  banner_notice_view,
} = require("../view/banner_notice/banner");
const {
  upload_one_topic_note_image,
  create_one_topic_note,
  update_one_topic_note,
  list_one_topic_notes,
  get_one_topic_note,
  delete_one_topic_note,
} = require("../view/One_Topic_Note/topic");
const {
  create_advice,
  admin_get_advices,
  admin_delete_advice,
  upload_admin_gallery_image,
  upload_image,
  admin_list_images,
  delete_image,
  user_list_images,
} = require("../view/review/user_review_submit");
const {
  youtube_add,
  youtube_delete,
  youtube_list,
} = require("../view/youtube/youtube_controller");
const {
  upload_package_image,
  add_new_package,
} = require("../view/package/add package/add_package");
const { edit_package } = require("../view/package/edit package/edit_package");
const {
  delete_package,
} = require("../view/package/delete package/delete_package");
const {
  view_all_packages,
} = require("../view/package/view package admin/view_package_admin");
const {
  view_user_all_packages,
} = require("../view/package/view package user/view_package_user");
const { view_package_user } = require("../view/package/view user/view_user");
const { get_all_users } = require("../view/view_all_signup/view_all_signup");
const router = express.Router();

//admin login
router.post("/admin_login", admin_login);

router.post(
  "/add_course",
  upload_course_image.single("course_image"),
  add_new_course,
);

router.get("/courses", view_all_courses);
router.post("/delete_course", delete_course);
router.post("/add_exam", add_new_exam);
router.post("/add_question", add_question_to_exam);
router.post("/delete_question", delete_question_from_exam);
router.post("/view_exam", user_view_question_to_exam);
router.post("/view_admin_exam", admin_view_question_to_exam);
router.post("/exam_list", all_exam_list);
router.post("/add-user", add_user);
router.post("/update_exam", update_exam);
router.post("/submit-answer", submit_answer);

router.post(
  "/edit_course",
  upload_course_image.single("course_image"),
  edit_course,
);

router.post("/add-enroll", add_enroll);
router.post("/get-all-enroll", get_all_enrolls);
router.post("/add-payment-method", add_method);
router.post("/update_payment_method", update_method);
router.post("/delete_payment_method", delete_method);
router.post("/view_payment-method", view_methods);
router.post("/delete_enroll", delete_enroll);
router.post("/delete_exam", delete_exam);
router.post("/view_enrolled_student", view_user);
router.post("/view_package_enrolled_student", view_package_user);

router.post("/remove_enrolled_user", remove_user);
router.post("/update_question", update_question);

//admin secret change
router.post("/admin_secret_change", admin_secret_change);

//package

router.post(
  "/add_package",
  upload_package_image.single("course_image"),
  add_new_package,
);

router.post(
  "/edit_package",
  upload_package_image.single("course_image"),
  edit_package,
);

router.post("/delete_package", delete_package);

router.get("/packages", view_all_packages);

//youtube vedio list

router.post("/youtube_add", youtube_add);

router.post("/youtube_delete", youtube_delete);

router.post("/youtube_list", youtube_list);

//user
router.post("/sign-up", sign_up);
router.post("/verify", verifyOtp);
router.post("/member-login", members_log_in);
router.post("/all-course", view_user_all_courses);
router.post("/all-package", view_user_all_packages);

router.post("/view-leaderboard", view_leaderboard);
router.post("/reset_password", reset_password);
router.post("/setNewPassword", setNewPassword);
router.post("/view_user_account", view_user_account);
router.post("/change_password", change_password_user);

//question bank

router.post("/folders/root", folder1);
router.post("/folders/get", folder2);

router.post("/folders/delete", folder8);

router.post("/folders/create", folder3);

router.post("/folders/update", folder4);

router.post(
  "/questions/create",
  upload_question_images.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "optionImages", maxCount: 10 },
    { name: "correctAnswerImage", maxCount: 1 },
    { name: "explanationImage", maxCount: 1 },
  ]),
  folder5,
);
router.post(
  "/questions/update",
  upload_question_images.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "optionImages", maxCount: 10 },
    { name: "correctAnswerImage", maxCount: 1 },
    { name: "explanationImage", maxCount: 1 },
  ]),
  folder6,
);
router.post("/questions/delete", folder7);

//import question
router.post("/qb/folders/root", qb_root);
router.post("qb/folders/get", qb_get_folder);

router.post("/exams/import-questions", import_questions_from_bank);

// CREATE course notice (text + images + pdf)
router.post(
  "/admin/course/notice/add",
  upload_course_notice.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  create_course_notice,
);

// UPDATE course notice
router.post(
  "/admin/course/notice/update",
  upload_course_notice.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  update_course_notice,
);

// DELETE course notice
router.post("/admin/course/notice/delete", delete_course_notice);

// LIST course notices (admin)
router.post("/admin/course/notice/list", list_course_notices);

/* =========================================================
   USER ROUTE
========================================================= */

// LIST course notices (user)
router.post("/user/course/notice/list", list_course_notices);

//free exam

router.post("/admin/add_free_exam", add_new_free_exam);
router.post("/admin/view_free_exam", all_free_exam_list);
router.post("/admin/update_free_exam", update_free_exam);
router.post("/admin/delete_free_exam", delete_free_exam);
router.post("/admin/view_free_exam_question", admin_free_exam_view_question);
router.post("/admin/add_free_exam_question", add_question_to_free_exam);
router.post("/admin/delete_free_exam_question", delete_question_from_FREE_exam);
router.post("/admin/update_free_exam_question", update_free_exam_question);
//free user

router.post("/user/free_all_exam_list", free_all_exam_list);
router.post(
  "/user/user_view_question_to_free_exam",
  user_view_question_to_free_exam,
);
router.post("/user/submit_Free_exam_answer", submit_Free_exam_answer);

router.post("/user/view_leaderboard_free", view_leaderboard_free);
router.post("/admin/admin_view_leaderboard_free", admin_view_leaderboard_free);

router.post(
  "/admin/member/create",
  upload_member_image.single("image"),
  create_member,
);
router.get("/admin/member/list", list_members);
router.put(
  "/admin/member/update/:id",
  upload_member_image.single("image"),
  update_member,
);
router.delete("/admin/member/delete/:id", delete_member);

//public notice and pic
// router.post-এ পরিবর্তন
router.post(
  "/notice/create",
  // .single-এর পরিবর্তে .fields ব্যবহার করা হয়েছে
  upload_notice_image.fields([
    { name: "images", maxCount: 10 }, // 'images' নামে একাধিক ছবি (সর্বোচ্চ ১০টি)
    { name: "pdf", maxCount: 1 }, // 'pdf' নামে একটি পিডিএফ
  ]),
  create_notice,
);

// একইভাবে আপডেট রুটেও পরিবর্তন করুন
router.post(
  "/notice/update",
  upload_notice_image.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  update_notice,
);
router.post("/notice/list", list_notices);

router.post("/notice/get", get_notice);

// router.post(
//     "/notice/update/",
//     upload_notice_image.single("image"),
//     update_notice
// );

router.post("/notice/delete/", delete_notice);

//job circular

// job_circular তৈরি করার রাউট
router.post(
  "/job_circular/create",
  // .fields ব্যবহার করা হয়েছে ইমেজ এবং পিডিএফ আলাদাভাবে নেওয়ার জন্য
  upload_job_circular_image.fields([
    { name: "images", maxCount: 10 }, // 'images' নামে একাধিক ছবি (সর্বোচ্চ ১০টি)
    { name: "pdf", maxCount: 1 }, // 'pdf' নামে একটি পিডিএফ
  ]),
  create_job_circular,
);

// একইভাবে আপডেট রুটেও পরিবর্তন
router.post(
  "/job_circular/update",
  upload_job_circular_image.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  // এখানে তোমার আপডেট ফাংশনটি বসবে (যদি তৈরি করে থাকো)
  update_job_circular,
);

// সব সার্কুলার লিস্ট দেখার রাউট
router.post("/job_circular/list", list_job_circulars);

// সিঙ্গেল সার্কুলার ডাটা দেখার রাউট
router.post("/job_circular/get", get_job_circular);

// সার্কুলার ডিলিট করার রাউট
router.post("/job_circular/delete", delete_job_circular);

//one topic note
// one topic note

router.post(
  "/one_topic_note/create",
  upload_one_topic_note_image.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  create_one_topic_note,
);

router.post(
  "/one_topic_note/update",
  upload_one_topic_note_image.fields([
    { name: "images", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  update_one_topic_note,
);

router.post("/one_topic_note/list", list_one_topic_notes);
router.post("/one_topic_note/get", get_one_topic_note);
router.post("/one_topic_note/delete", delete_one_topic_note);

//study corner

router.post("/study_corner_folders/root", study_corner_root);
router.post("/study_corner_folders/get", study_corner_get);

router.post("/study_corner_folders/create", study_corner_create_folder);

router.post("/study_corner_folders/update", study_corner_update_folder);

router.post("/study_corner_questions/create", study_corner_create_question);

router.post("/study_corner_questions/update", study_corner_update_question);

router.post("/study_corner_questions/delete", study_corner_delete_question);

router.post("/user/study_corner/root", user_get_root);
router.post("/user/study_corner/folder", user_get_folder);
router.post("/study_corner_folders/delete", study_corner_delete_folder);

//recent gk
router.post("/recent_gk/add", create_gk);
router.post("/recent_gk/update", update_gk);
router.post("/recent_gk/delete", delete_gk);
router.post("/recent_gk/view", get_all_gk);

//view_all_signup_users
router.post("/all_signup_users", get_all_users);

//banner notice

router.post("/banner_notice_create", banner_notice_create);
router.get("/banner_notice_view", banner_notice_view);

//Users review

router.post("/advice/create", create_advice);
router.post("/admin/advice/list", admin_get_advices);
router.post("/admin/advice/delete", admin_delete_advice);

//image
// admin
router.post(
  "/admin/gallery/upload",
  upload_admin_gallery_image.single("image"),
  upload_image,
);

router.post("/admin/gallery/list", admin_list_images);
router.post("/admin/gallery/delete", delete_image);

// user
router.post("/gallery/list", user_list_images);

// =========================
// module.exports
// =========================

module.exports = router;
