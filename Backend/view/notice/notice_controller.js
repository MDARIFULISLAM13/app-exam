const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Notice } = require("../../models/notice");
const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");


/* ===========================================
   UPLOAD DIRECTORY
=========================================== */

const uploadDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===========================================
   MULTER CONFIG (IMAGE + PDF)
=========================================== */

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, unique + path.extname(file.originalname));
//     },
// });


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const ext = path.extname(originalName); // যেমন: .pdf
        const nameWithoutExt = path.basename(originalName, ext); // যেমন: arif

        let fileName = originalName;
        let counter = 1;

        // চেক করা হচ্ছে ফাইলটি ফোল্ডারে আছে কি না
        // যদি থাকে তবে লুপ চলবে এবং নাম পরিবর্তন করবে (arif1.pdf, arif2.pdf...)
        while (fs.existsSync(path.join(uploadDir, fileName))) {
            fileName = `${nameWithoutExt}${counter}${ext}`;
            counter++;
        }

        cb(null, fileName);
    },
});

function fileFilter(req, file, cb) {
    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image or pdf files allowed"), false);
    }
    cb(null, true);
}

// কন্ট্রোলারের ওপরের দিকে শুধু এইটুকু রাখুন
const upload_notice_image = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}); // এখানে .fields() দিবেন না

// এটি এক্সপোর্ট করুন
exports.upload_notice_image = upload_notice_image;
/* ===========================================
   HELPER
=========================================== */

function removeFile(filename) {
    if (!filename) return;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ===========================================
   CREATE NOTICE
=========================================== */
// ... আগের ইমপোর্টগুলো ঠিক থাকবে ...

exports.create_notice = async (req, res) => {
    try {
        const { text, token } = req.body;

        // Admin JWT Verification
        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            // ফাইল আপলোড হয়ে থাকলে সেগুলো ডিলিট করে দেওয়া (Unauthorized হলে)
            if (req.files) {
                if (req.files['images']) req.files['images'].forEach(f => removeFile(f.filename));
                if (req.files['pdf']) removeFile(req.files['pdf'][0].filename);
            }
            return res.status(401).json({ message: "Unauthorized" });
        }

        let imagesData = [];
        let pdfData = { filename: "", url: "" };

        // Handle Images (Multiple)
        if (req.files && req.files['images']) {
            req.files['images'].forEach(file => {
                imagesData.push({
                    filename: file.filename,
                    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
                });
            });
        }




        // Handle PDF (Single
        if (req.files && req.files['pdf']) {
            const file = req.files['pdf'][0];
            pdfData.filename = file.filename;
            pdfData.url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
            pdfData.originalName = file.originalname; // আসল নামটা ধরলাম
        }

        // সেভ করার সময়:


        // Validation
        if (!text && imagesData.length === 0 && !pdfData.filename) {
            return res.status(400).json({ error: "At least text, image or pdf is required" });
        }

        const notice = await Notice.create({
            text: text,
            images: imagesData,
            pdfFilename: pdfData.filename,
            pdfUrl: pdfData.url,
            pdfOriginalName: pdfData.originalName // ডেটাবেসে আসল নাম সেভ হলো
        });

        res.status(201).json({ message: "Notice created", notice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
/* ===========================================
   LIST ALL
=========================================== */

// NEW: paginated notice list
exports.list_notices = async (req, res) => {
    try {
        const { page = 1 } = req.body;

        const LIMIT = 10;
        const skip = (page - 1) * LIMIT;

        const notices = await Notice.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(LIMIT)
            .lean();

        const total = await Notice.countDocuments();

        res.status(200).json({
            notices,
            hasMore: skip + notices.length < total,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/* ===========================================
   GET SINGLE
=========================================== */

exports.get_notice = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Notice id is required" });
        }

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({ error: "Notice not found" });
        }

        res.status(200).json(notice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   UPDATE NOTICE
=========================================== */
exports.update_notice = async (req, res) => {
    try {
        const { id, text, token } = req.body;

        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again.",
            });
        }

        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again.",
            });
        }

        if (!id) {
            if (req.files) {
                if (req.files['images']) req.files['images'].forEach(f => removeFile(f.filename));
                if (req.files['pdf']) removeFile(req.files['pdf'][0].filename);
            }
            return res.status(400).json({ error: "Notice id is required" });
        }

        const notice = await Notice.findById(id);
        if (!notice) {
            if (req.files) {
                if (req.files['images']) req.files['images'].forEach(f => removeFile(f.filename));
                if (req.files['pdf']) removeFile(req.files['pdf'][0].filename);
            }
            return res.status(404).json({ error: "Notice not found" });
        }

        /* ======================
           TEXT UPDATE
        ====================== */
        notice.text = text ? text.trim() : "";

        /* ======================
           IMAGE UPDATE (MULTIPLE)
        ====================== */
        if (req.files && req.files['images']) {
            // পুরনো সব ছবি ডিলিট
            if (notice.images && notice.images.length > 0) {
                notice.images.forEach(img => removeFile(img.filename));
            }

            // নতুন ছবি সেট
            notice.images = req.files['images'].map(file => ({
                filename: file.filename,
                url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
            }));
        }

        /* ======================
           PDF UPDATE (SINGLE)
        ====================== */
        if (req.files && req.files['pdf']) {
            // পুরনো pdf ডিলিট
            if (notice.pdfFilename) {
                removeFile(notice.pdfFilename);
            }

            const pdfFile = req.files['pdf'][0];
            notice.pdfFilename = pdfFile.filename;
            notice.pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${pdfFile.filename}`;
            notice.pdfOriginalName = pdfFile.originalname;
        }

        /* ======================
           FINAL VALIDATION
        ====================== */
        if (
            !notice.text &&
            (!notice.images || notice.images.length === 0) &&
            !notice.pdfFilename
        ) {
            return res.status(400).json({
                error: "At least text, image or pdf is required",
            });
        }

        await notice.save();

        res.status(200).json({
            message: "Notice updated successfully",
            notice,
        });

    } catch (err) {
        if (req.files) {
            if (req.files['images']) req.files['images'].forEach(f => removeFile(f.filename));
            if (req.files['pdf']) removeFile(req.files['pdf'][0].filename);
        }
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   DELETE NOTICE
=========================================== */

exports.delete_notice = async (req, res) => {
    try {
        const { id, token } = req.body;

        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again.",
            });
        }

        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again.",
            });
        }

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({ error: "Notice not found" });
        }

        notice.images.forEach(img => removeFile(img.filename))
        removeFile(notice.pdfFilename);

        await Notice.findByIdAndDelete(id);

        res.status(200).json({ message: "Notice deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   EXPORT MULTER (ROUTER SAME থাকবে)
=========================================== */

exports.upload_notice_image = upload_notice_image;
