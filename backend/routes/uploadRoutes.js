const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const pool = require("../db/connection");
const crypto = require("crypto");

const router = express.Router();


// =========================================
// UPLOAD FOLDER
// =========================================

const uploadFolder = path.join(
    __dirname,
    "..",
    "uploads"
);


// Create uploads folder if it doesn't exist

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, {
        recursive: true
    });
}


// =========================================
// MULTER CONFIGURATION
// =========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadFolder);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname;

        cb(null, uniqueName);

    }

});


const upload = multer({

    storage: storage,

    fileFilter: (req, file, cb) => {

        const allowedExtensions = [
            ".pdf",
            ".txt",
            ".docx"
        ];

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();


        if (
            allowedExtensions.includes(
                extension
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF, TXT and DOCX files are supported."
                )
            );

        }

    }

});


// =========================================
// GET UPLOADED DOCUMENTS
// =========================================

router.get(
    "/documents",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        original_filename,
                        file_type,
                        file_size,
                        chunks,
                        status,
                        uploaded_at
                    FROM documents
                    ORDER BY uploaded_at DESC
                    `
                );


            res.json({

                success: true,

                documents:
                    result.rows

            });


        } catch (error) {

            console.error(
                "Error fetching documents:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch documents."

            });

        }

    }
);


// =========================================
// UPLOAD DOCUMENT
// =========================================

router.post(
    "/document",
    upload.single("document"),
    async (req, res) => {

        try {

            // ---------------------------------
            // CHECK FILE
            // ---------------------------------

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please upload a document."

                });

            }


            // ---------------------------------
            // FILE PATH
            // ---------------------------------

            const filePath =
                req.file.path;


            // ---------------------------------
            // CREATE FILE HASH
            // ---------------------------------

            const fileBuffer =
                fs.readFileSync(filePath);


            const fileHash =
                crypto
                    .createHash("sha256")
                    .update(fileBuffer)
                    .digest("hex");


            // ---------------------------------
            // CHECK DUPLICATE
            // ---------------------------------

            const existingDocument =
                await pool.query(
                    `
                    SELECT
                        id,
                        original_filename
                    FROM documents
                    WHERE file_hash = $1
                    `,
                    [fileHash]
                );


            if (
                existingDocument.rows.length > 0
            ) {

                // Delete newly uploaded duplicate

                fs.unlinkSync(filePath);


                return res.status(409).json({

                    success: false,

                    message:
                        "This document has already been added to the Nexus knowledge base.",

                    filename:
                        existingDocument
                            .rows[0]
                            .original_filename

                });

            }


            // ---------------------------------
            // SEND TO PYTHON RAG SERVICE
            // ---------------------------------

            const response =
                await axios.post(
                    "http://localhost:8000/ingest",
                    {
                        file_path: filePath
                    }
                );


            // ---------------------------------
            // SAVE DOCUMENT IN POSTGRESQL
            // ---------------------------------

            await pool.query(
                `
                INSERT INTO documents
                (
                    filename,
                    original_filename,
                    file_type,
                    file_size,
                    chunks,
                    status,
                    file_hash
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )
                `,
                [
                    req.file.filename,

                    req.file.originalname,

                    path.extname(
                        req.file.originalname
                    )
                        .toLowerCase()
                        .replace(".", ""),

                    req.file.size,

                    response.data.chunks,

                    "completed",

                    fileHash
                ]
            );


            // ---------------------------------
            // SUCCESS RESPONSE
            // ---------------------------------

            res.json({

                success: true,

                message:
                    "Document uploaded and added to Nexus knowledge base.",

                filename:
                    req.file.originalname,

                rag:
                    response.data

            });


        } catch (error) {

            console.error(
                "Document upload error:",
                error
            );


            // ---------------------------------
            // DELETE FILE IF SOMETHING FAILED
            // ---------------------------------

            if (
                req.file &&
                req.file.path &&
                fs.existsSync(req.file.path)
            ) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                } catch (deleteError) {

                    console.error(
                        "Could not delete failed upload:",
                        deleteError
                    );

                }

            }


            res.status(500).json({

                success: false,

                message:
                    "Document upload failed."

            });

        }

    }
);


// =========================================
// EXPORT ROUTER
// =========================================

module.exports = router;