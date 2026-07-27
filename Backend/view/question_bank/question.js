const express = require("express");
const mongoose = require("mongoose");
//check done

const Folder = require("../../models/Folder");
const Question = require("../../models/Question");
const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload_question_images = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.upload_question_images = upload_question_images;

function removeFile(filename) {
  if (!filename) return;
  const p = path.join(uploadDir, filename);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

async function deleteFolderRecursive(folderId) {
  // সব child folder বের করো
  const children = await Folder.find({ parent: folderId });

  // child গুলো আগে delete
  for (const child of children) {
    await deleteFolderRecursive(child._id);
  }

  // folder এর question বের করো
  const questions = await Question.find({ folder: folderId });

  for (const question of questions) {
    removeFile(question.questionImage);
    removeFile(question.correctAnswerImage);
    removeFile(question.explanationImage);

    if (question.optionImages) {
      for (const img of question.optionImages.values()) {
        removeFile(img);
      }
    }

    await Question.findByIdAndDelete(question._id);
  }

  await Folder.findByIdAndDelete(folderId);
}

/**
 * Helper: root folder (question_bank) create না থাকলে create করে রিটার্ন করবে
 */
async function getOrCreateRootFolder() {
  let root = await Folder.findOne({
    name: "question_bank",
    parent: null,
  }).lean();
  if (!root) {
    const created = await Folder.create({
      name: "question_bank",
      parent: null,
      path: [],
    });
    root = created.toObject();
  }
  return root;
}

//check done
/**
 * POST /api/folders/root
 * কাজ: root folder + তার subfolders + questions রিটার্ন করবে
 * Body: {}
 */

exports.folder1 = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }
    const decoded = jwtVerify_admin(token);
    if (!decoded) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const admin_username = decoded.username;
    if (admin_username != process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }
    const root = await getOrCreateRootFolder();

    const subfolders = await Folder.find({ parent: root._id })
      .sort("name")
      .lean();

    const questions = await Question.find({ folder: root._id })
      .sort("createdAt")
      .lean();

    res.json({
      folder: root,
      subfolders,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//check done

/**
 * POST /api/folders/get
 * কাজ: নির্দিষ্ট folder + তার subfolders + questions রিটার্ন করবে
 * Body: { folderId }
 */
exports.folder2 = async (req, res) => {
  try {
    const { folderId, token } = req.body;

    if (!token) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const decoded = jwtVerify_admin(token);
    if (!decoded) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const admin_username = decoded.username;
    if (admin_username != process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }
    if (!folderId) {
      return res.status(400).json({ message: "folderId is required" });
    }

    const folder = await Folder.findById(folderId).lean();
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const subfolders = await Folder.find({ parent: folderId })
      .sort("name")
      .lean();

    const questions = await Question.find({ folder: folderId })
      .sort("createdAt")
      .lean();

    res.json({
      folder,
      subfolders,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//check done

/**
 * POST /api/folders/create
 * কাজ: নতুন subfolder তৈরি করা
 * Body: { name, parentId (optional) }
 */
exports.folder3 = async (req, res) => {
  try {
    const { name, parentId, token } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name required" });
    }

    if (!token) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const decoded = jwtVerify_admin(token);
    if (!decoded) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const admin_username = decoded.username;
    if (admin_username != process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    let parent = null;
    let path = [];

    if (parentId) {
      parent = await Folder.findById(parentId).lean();
      if (!parent) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      path = [...(parent.path || []), parent._id];
    }

    const newFolder = await Folder.create({
      name: name.trim(),
      parent: parent ? parent._id : null,
      path,
    });

    res.status(201).json(newFolder.toObject());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//check done

/**
 * POST /api/folders/update
 * কাজ: current folder এর নাম আপডেট করা
 * Body: { folderId, name }
 */
exports.folder4 = async (req, res) => {
  try {
    const { folderId, name, token } = req.body;

    if (!token) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const decoded = jwtVerify_admin(token);
    if (!decoded) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const admin_username = decoded.username;
    if (admin_username != process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    if (!folderId || !name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "folderId and folder name required" });
    }

    const updated = await Folder.findByIdAndUpdate(
      folderId,
      { name: name.trim() },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//check done

/**
 * POST /api/questions/create
 * কাজ: নতুন প্রশ্ন তৈরি করা
 * Body: { folderId, questionText, options[], correctAnswer, explanation }
 */

exports.folder5 = async (req, res) => {
  try {
    const {
      folderId,
      questionText,
      options,
      correctAnswer,
      explanation,
      token,
    } = req.body;

    if (!folderId)
      return res.status(400).json({ message: "folderId required" });
    if (!questionText || questionText.trim() === "")
      return res.status(400).json({ message: "questionText is required" });
    if (!Array.isArray(options) || options.length < 2)
      return res.status(400).json({ message: "At least 2 options required" });
    if (!correctAnswer || correctAnswer.trim() === "")
      return res.status(400).json({ message: "correctAnswer is required" });
    // if (!explanation || explanation.trim() === '')
    //     return res.status(400).json({ message: 'explanation is required' });

    if (!token)
      return res
        .status(401)
        .json({
          token_issue: true,
          message: "Session Expired. Please log in again.",
        });

    const decoded = jwtVerify_admin(token);
    if (!decoded || decoded.username != process.env.admin_user)
      return res
        .status(401)
        .json({
          token_issue: true,
          message: "Session Expired. Please log in again.",
        });

    const folder = await Folder.findById(folderId).lean();
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const cleanedOptions = options
      .map((o) => String(o || "").trim())
      .filter((o) => o !== "");
    if (cleanedOptions.length < 2)
      return res
        .status(400)
        .json({ message: "At least 2 non-empty options required" });

    /* images */
    const questionImage = req.files?.questionImage?.[0]?.filename || null;
    const correctAnswerImage =
      req.files?.correctAnswerImage?.[0]?.filename || null;
    const explanationImage = req.files?.explanationImage?.[0]?.filename || null;

    const optionImages = {};
    if (req.files?.optionImages) {
      req.files.optionImages.forEach((file, index) => {
        optionImages[index] = file.filename;
      });
    }

    const newQuestion = await Question.create({
      folder: folderId,
      questionText: questionText.trim(),
      questionImage,
      options: cleanedOptions,
      optionImages,
      correctAnswer: correctAnswer.trim(),
      correctAnswerImage,
      explanation: explanation.trim(),
      explanationImage,
    });

    res.status(201).json(newQuestion.toObject());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/questions/update
 * কাজ: existing question আপডেট করা
 * Body: { questionId, questionText, options[], correctAnswer, explanation }
 */

/**
 * POST /api/questions/update
 * কাজ: existing question আপডেট করা
 */

exports.folder6 = async (req, res) => {
  try {
    const {
      questionId,
      questionText,
      options,
      correctAnswer,
      explanation,
      token,
    } = req.body;

    if (!questionId)
      return res.status(400).json({ message: "questionId required" });

    if (!token)
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });

    const decoded = jwtVerify_admin(token);

    if (!decoded || decoded.username != process.env.admin_user)
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });

    const question = await Question.findById(questionId);

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // basic fields
    question.questionText = questionText.trim();
    question.options = options;
    question.correctAnswer = correctAnswer.trim();
    question.explanation = explanation.trim();

    /* ------------------------
           QUESTION IMAGE
        -------------------------*/

    if (req.files && req.files.questionImage) {
      removeFile(question.questionImage);

      question.questionImage = req.files.questionImage[0].filename;
    }

    /* ------------------------
           EXPLANATION IMAGE
        -------------------------*/

    if (req.files && req.files.explanationImage) {
      removeFile(question.explanationImage);

      question.explanationImage = req.files.explanationImage[0].filename;
    }

    /* ------------------------
           CORRECT ANSWER IMAGE
        -------------------------*/

    if (req.files && req.files.correctAnswerImage) {
      removeFile(question.correctAnswerImage);

      question.correctAnswerImage = req.files.correctAnswerImage[0].filename;
    }

    /* ------------------------
           OPTION IMAGES
        -------------------------*/

    if (req.files && req.files.optionImages) {
      const optionImages = {};

      req.files.optionImages.forEach((file, index) => {
        optionImages[index] = file.filename;
      });

      // old option images delete
      if (question.optionImages) {
        for (const img of question.optionImages.values()) {
          removeFile(img);
        }
      }

      question.optionImages = optionImages;
    }

    await question.save();

    res.json({
      message: "Question updated",
      question,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/questions/delete
 * কাজ: question ডিলিট করা
 * Body: { questionId }
 */

/**
 * POST /api/questions/delete
 * কাজ: question ডিলিট করা
 * Body: { questionId }
 */

exports.folder7 = async (req, res) => {
  try {
    const { questionId, token } = req.body;

    if (!questionId)
      return res.status(400).json({ message: "questionId required" });

    if (!token)
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });

    const decoded = jwtVerify_admin(token);

    if (!decoded || decoded.username != process.env.admin_user)
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });

    const question = await Question.findById(questionId);

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // question image delete
    removeFile(question.questionImage);

    // correct answer image delete
    removeFile(question.correctAnswerImage);

    // explanation image delete
    removeFile(question.explanationImage);

    // option images delete (Map)
    if (question.optionImages && question.optionImages.size > 0) {
      for (const img of question.optionImages.values()) {
        removeFile(img);
      }
    }

    await Question.findByIdAndDelete(questionId);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.folder8 = async (req, res) => {
  try {
    const { folderId, token } = req.body;

    if (!folderId)
      return res.status(400).json({
        message: "folderId required",
      });

    if (!token)
      return res.status(401).json({
        token_issue: true,
      });

    const decoded = jwtVerify_admin(token);

    if (!decoded || decoded.username != process.env.admin_user)
      return res.status(401).json({
        token_issue: true,
      });

    const folder = await Folder.findById(folderId);

    if (!folder)
      return res.status(404).json({
        message: "Folder not found",
      });

    // Root folder delete করা যাবে না
    if (folder.parent === null) {
      return res.status(400).json({
        message: "Root folder cannot be deleted.",
      });
    }

    await deleteFolderRecursive(folderId);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};