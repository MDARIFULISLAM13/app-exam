const { adminCheck } = require("../../jwt/admin/jwt_admin");
const { jwtVerify_user } = require("../../jwt/users/jwt_users");
const {
  StudyCornerFolder,
  StudyCornerQuestion,
} = require("../../models/study_corner");
const Users = require("../../models/users_model");

/* ================= HELPERS ================= */

async function getOrCreateRootFolder() {
  let root = await StudyCornerFolder.findOne({
    name: "study_corner",
    parent: null,
  }).lean();

  if (!root) {
    const created = await StudyCornerFolder.create({
      name: "study_corner",
      parent: null,
      path: [],
    });
    root = created.toObject();
  }
  return root;
}

async function deleteFolderRecursive(folderId) {
  // সব child folder delete
  const children = await StudyCornerFolder.find({
    parent: folderId,
  });

  for (const child of children) {
    await deleteFolderRecursive(child._id);
  }

  // সব question delete
  await StudyCornerQuestion.deleteMany({
    folder: folderId,
  });

  // folder delete
  await StudyCornerFolder.findByIdAndDelete(folderId);
}


/* ================= FOLDER APIs ================= */

/* root */
exports.study_corner_root = async (req, res) => {
  try {
    const { token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    const root = await getOrCreateRootFolder();

    const subfolders = await StudyCornerFolder.find({
      parent: root._id,
    })
      .sort("name")
      .lean();

    const questions = await StudyCornerQuestion.find({
      folder: root._id,
    }).lean();

    res.json({ folder: root, subfolders, questions });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* get folder */
exports.study_corner_get = async (req, res) => {
  try {
    const { folderId, token } = req.body;
    if (!adminCheck(token)) return res.status(401).json({});

    const folder = await StudyCornerFolder.findById(folderId).lean();
    if (!folder) return res.status(404).json({});

    const subfolders = await StudyCornerFolder.find({
      parent: folderId,
    }).lean();

    const questions = await StudyCornerQuestion.find({
      folder: folderId,
    }).lean();

    res.json({ folder, subfolders, questions });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* create folder */
exports.study_corner_create_folder = async (req, res) => {
  try {
    const { name, parentId, token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    let parent = null;
    let path = [];

    if (parentId) {
      parent = await StudyCornerFolder.findById(parentId).lean();
      if (!parent) return res.status(404).json({});
      path = [...parent.path, parent._id];
    }

    const folder = await StudyCornerFolder.create({
      name: name.trim(),
      parent: parent ? parent._id : null,
      path,
    });

    res.status(201).json(folder);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* update folder */
exports.study_corner_update_folder = async (req, res) => {
  try {
    const { folderId, name, token } = req.body;
    if (!adminCheck(token)) return res.status(401).json({});

    const updated = await StudyCornerFolder.findByIdAndUpdate(
      folderId,
      { name: name.trim() },
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({});
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= QUESTION APIs ================= */

/* create question */
exports.study_corner_create_question = async (req, res) => {
  try {
    const {
      folderId,
      questionType,
      questionText,
      questionImage,
      options,
      optionImages,
      correctAnswer,
      correctAnswerImage,
      explanation,
      explanationImage,
      token,
    } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    if (questionType === "mcq") {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({});
      }
    }

    const question = await StudyCornerQuestion.create({
      folder: folderId,
      questionType,

      questionText: questionText.trim(),
      questionImage: questionImage || null,

      options: questionType === "mcq" ? options : [],
      optionImages: optionImages || {},

      correctAnswer: correctAnswer.trim(),
      correctAnswerImage: correctAnswerImage || null,

      explanation: explanation || "",
      explanationImage: explanationImage || null,
    });

    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
/* update question */
exports.study_corner_update_question = async (req, res) => {
  try {
    const {
      questionId,
      questionType,
      questionText,
      options,
      correctAnswer,
      explanation,
      token,
    } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    const updateData = {
      questionText: questionText.trim(),
      correctAnswer: correctAnswer.trim(),
      explanation: explanation || "",
    };

    if (questionType === "mcq") {
      updateData.options = options;
    } else {
      updateData.options = [];
    }

    const updated = await StudyCornerQuestion.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({});
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* delete question */
exports.study_corner_delete_question = async (req, res) => {
  try {
    const { questionId, token } = req.body;
    if (!adminCheck(token)) return res.status(401).json({});

    await StudyCornerQuestion.findByIdAndDelete(questionId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= USER CONTROLLER ================= */

// ১. রুট ফোল্ডার এবং তার ভেতরের ডাটা দেখার জন্য
exports.user_get_root = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        need_back: true,
      });
    }
    const decoded = jwtVerify_user(token);
    if (!decoded || !decoded.email) {
      return res.status(400).json({
        success: false,
        need_back: true,
      });
    }

    const email = decoded.email;

    const user = await Users.findOne({ email });

    if (!user || !user.enrolledCourse || user.enrolledCourse.size === 0) {
      return res.status(400).json({
        success: false,
        need_back: true,
      });
    }

    let root = await StudyCornerFolder.findOne({
      name: "study_corner",
      parent: null,
    }).lean();
    if (!root) return res.status(404).json({ message: "No data found" });

    const subfolders = await StudyCornerFolder.find({ parent: root._id })
      .sort("name")
      .lean();
    const questions = await StudyCornerQuestion.find({
      folder: root._id,
    }).lean();

    res.json({ folder: root, subfolders, questions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ২. নির্দিষ্ট কোনো ফোল্ডারে ক্লিক করলে তার ভেতরের ডাটা দেখার জন্য
exports.user_get_folder = async (req, res) => {
  try {
    const { folderId } = req.body;
    const folder = await StudyCornerFolder.findById(folderId).lean();
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const subfolders = await StudyCornerFolder.find({
      parent: folderId,
    }).lean();
    const questions = await StudyCornerQuestion.find({
      folder: folderId,
    }).lean();

    res.json({ folder, subfolders, questions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* --- Router --- */
// router.post('/user/study_corner/root', user_get_root);
// router.post('/user/study_corner/folder', user_get_folder);



exports.study_corner_delete_folder = async (req, res) => {
  try {
    const { folderId, token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    const folder = await StudyCornerFolder.findById(folderId);

    if (!folder)
      return res.status(404).json({
        message: "Folder not found",
      });

    // root delete করা যাবে না
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
      message: "Server error",
    });
  }
};