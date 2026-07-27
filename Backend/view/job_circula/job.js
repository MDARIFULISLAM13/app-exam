const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { JobCircular } = require("../../models/job_circular");
const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");


/* ===========================================
   UPLOAD DIRECTORY
=========================================== */

const uploadDir = path.join(__dirname, "..", "..", "uploads", "job_circular");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===========================================
   MULTER CONFIG (IMAGE + PDF)
=========================================== */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const ext = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, ext);

        let fileName = originalName;
        let counter = 1;

        // চেক করা হচ্ছে ফাইলটি ফোল্ডারে আছে কি না
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

const upload_job_circular_image = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

exports.upload_job_circular_image = upload_job_circular_image;

/* ===========================================
   HELPER
=========================================== */

function removeFile(filename) {
    if (!filename) return;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ===========================================
   CREATE JOB CIRCULAR
=========================================== */

exports.create_job_circular = async (req, res) => {
    try {
        const { text, token } = req.body;

        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            if (req.files) {
                if (req.files['images']) req.files['images'].forEach(f => removeFile(f.filename));
                if (req.files['pdf']) removeFile(req.files['pdf'][0].filename);
            }
            return res.status(401).json({ message: "Unauthorized" });
        }

        let imagesData = [];
        let pdfData = { filename: "", url: "" };

        if (req.files && req.files['images']) {
            req.files['images'].forEach(file => {
                imagesData.push({
                    filename: file.filename,
                    url: `${req.protocol}://${req.get("host")}/uploads/job_circular/${file.filename}`
                });
            });
        }

        if (req.files && req.files['pdf']) {
            const file = req.files['pdf'][0];
            pdfData.filename = file.filename;
            pdfData.url = `${req.protocol}://${req.get("host")}/uploads/job_circular/${file.filename}`;
            pdfData.originalName = file.originalname;
        }

        if (!text && imagesData.length === 0 && !pdfData.filename) {
            return res.status(400).json({ error: "At least text, image or pdf is required" });
        }

        const job_circular = await JobCircular.create({
            text: text,
            images: imagesData,
            pdfFilename: pdfData.filename,
            pdfUrl: pdfData.url,
            pdfOriginalName: pdfData.originalName
        });

        res.status(201).json({ message: "Job Circular created", job_circular });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ===========================================
   LIST ALL
=========================================== */
exports.list_job_circulars = async (req, res) => {
    try {
        const { page = 1 } = req.body;   // frontend থেকে page আসবে
        const LIMIT = 10;
        const skip = (page - 1) * LIMIT;

        const job_circulars = await JobCircular.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(LIMIT)
            .lean();

        const total = await JobCircular.countDocuments();

        res.status(200).json({
            job_circulars,
            hasMore: skip + job_circulars.length < total
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/* ===========================================
   GET SINGLE
=========================================== */

exports.get_job_circular = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Job Circular id is required" });
        }

        const job_circular = await JobCircular.findById(id);
        if (!job_circular) {
            return res.status(404).json({ error: "Job Circular not found" });
        }

        res.status(200).json(job_circular);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   UPDATE JOB CIRCULAR (NOTICE STYLE)
=========================================== */

exports.update_job_circular = async (req, res) => {
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
            if (req.files) {
                if (req.files['images']) {
                    req.files['images'].forEach(f => removeFile(f.filename));
                }
                if (req.files['pdf']) {
                    removeFile(req.files['pdf'][0].filename);
                }
            }
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again.",
            });
        }

        if (!id) {
            if (req.files) {
                if (req.files['images']) {
                    req.files['images'].forEach(f => removeFile(f.filename));
                }
                if (req.files['pdf']) {
                    removeFile(req.files['pdf'][0].filename);
                }
            }
            return res.status(400).json({ error: "Job Circular id is required" });
        }

        const job_circular = await JobCircular.findById(id);
        if (!job_circular) {
            if (req.files) {
                if (req.files['images']) {
                    req.files['images'].forEach(f => removeFile(f.filename));
                }
                if (req.files['pdf']) {
                    removeFile(req.files['pdf'][0].filename);
                }
            }
            return res.status(404).json({ error: "Job Circular not found" });
        }

        // TEXT
        job_circular.text = text ? text.trim() : "";

        // IMAGES (MULTIPLE)
        if (req.files && req.files['images']) {
            if (job_circular.images && job_circular.images.length > 0) {
                job_circular.images.forEach(img => removeFile(img.filename));
            }

            job_circular.images = req.files['images'].map(file => ({
                filename: file.filename,
                url: `${req.protocol}://${req.get("host")}/uploads/job_circular/${file.filename}`
            }));
        }

        // PDF (SINGLE)
        if (req.files && req.files['pdf']) {
            if (job_circular.pdfFilename) {
                removeFile(job_circular.pdfFilename);
            }

            const pdfFile = req.files['pdf'][0];
            job_circular.pdfFilename = pdfFile.filename;
            job_circular.pdfUrl = `${req.protocol}://${req.get("host")}/uploads/job_circular/${pdfFile.filename}`;
            job_circular.pdfOriginalName = pdfFile.originalname;
        }

        // FINAL VALIDATION (NOTICE STYLE)
        if (
            !job_circular.text &&
            (!job_circular.images || job_circular.images.length === 0) &&
            !job_circular.pdfFilename
        ) {
            return res.status(400).json({
                error: "At least text, image or pdf is required",
            });
        }

        await job_circular.save();

        res.status(200).json({
            message: "Job Circular updated",
            job_circular,
        });

    } catch (err) {
        if (req.files) {
            if (req.files['images']) {
                req.files['images'].forEach(f => removeFile(f.filename));
            }
            if (req.files['pdf']) {
                removeFile(req.files['pdf'][0].filename);
            }
        }
        res.status(500).json({ error: err.message });
    }
};


/* ===========================================
   DELETE JOB CIRCULAR
=========================================== */

exports.delete_job_circular = async (req, res) => {
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

        const job_circular = await JobCircular.findById(id);
        if (!job_circular) {
            return res.status(404).json({ error: "Job Circular not found" });
        }

        if (job_circular.images) {
            job_circular.images.forEach(img => removeFile(img.filename));
        }
        removeFile(job_circular.pdfFilename);

        await JobCircular.findByIdAndDelete(id);

        res.status(200).json({ message: "Job Circular deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.upload_job_circular_image = upload_job_circular_image;