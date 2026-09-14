import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Admin.css";


function Admin() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("nexus_admin");
        navigate("/admin-login");
    };

    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);

    const [uploading, setUploading] = useState(false);

    const [uploadMessage, setUploadMessage] = useState("");

    const [documents, setDocuments] = useState([]);

    const fetchDocuments = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/upload/documents"
            );

            if (response.data.success) {

                setDocuments(
                    response.data.documents
                );
            }

        } catch (error) {

            console.error(
                "Failed to load documents:",
                error
            );

        }

    };

    useEffect(() => {

        fetchDocuments();

    }, []);


    // =========================================
    // FILE SELECTION
    // =========================================

    const handleFileChange = (event) => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            "pdf",
            "txt",
            "docx"
        ];


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (!allowedTypes.includes(extension)) {

            setUploadMessage(
                "Only PDF, TXT and DOCX files are supported."
            );

            setSelectedFile(null);

            return;
        }


        setSelectedFile(file);

        setUploadMessage("");

    };


    // =========================================
    // UPLOAD DOCUMENT
    // =========================================

    const handleUpload = async () => {

        if (!selectedFile) {

            setUploadMessage(
                "Please select a document first."
            );

            return;
        }


        setUploading(true);

        setUploadMessage("");


        try {

            const formData = new FormData();

            formData.append(
                "document",
                selectedFile
            );


            const response =
                await axios.post(
                    "http://localhost:5000/api/upload/document",
                    formData
                );


            if (response.data.success) {

                await fetchDocuments();

                setUploadMessage(
                    "Document successfully added to the knowledge base."
                );


                setSelectedFile(null);

                if (fileInputRef.current) {

                    fileInputRef.current.value = "";

                }

            }

        } catch (error) {

            console.error(
                "Upload error:",
                error
            );

            if (
                error.response &&
                error.response.status === 409
            ) {

                setUploadMessage(
                    error.response.data.message ||
                    "This document has already been added to the knowledge base."
                );

            } else {

                setUploadMessage(
                    "Upload failed. Please make sure the backend and RAG service are running."
                );

            }

        } finally {

            setUploading(false);

        }

    };


    // =========================================
    // FILE SIZE
    // =========================================

    const formatFileSize = (bytes) => {

        if (bytes < 1024) {

            return `${bytes} B`;

        }

        if (bytes < 1024 * 1024) {

            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;

        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;

    };


    return (

        <div className="admin-page">


            {/* =================================
                BACKGROUND ORBS
            ================================= */}

            <div className="admin-orb admin-orb-purple"></div>

            <div className="admin-orb admin-orb-blue"></div>

            <div className="admin-orb admin-orb-yellow"></div>



            {/* =================================
                HEADER
            ================================= */}

            <header className="admin-header">

                <div className="admin-header-left">

                    <button
                        className="admin-back-button"
                        onClick={() => navigate("/")}
                    >

                        <button
                            className="admin-logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                        
                        <svg viewBox="0 0 24 24">

                            <path d="M15 18l-6-6 6-6" />

                        </svg>

                    </button>


                    <div className="admin-brand-icon">
                        ✦
                    </div>


                    <div className="admin-brand-text">

                        <strong>
                            Admin
                        </strong>

                        <span>
                            Knowledge Management
                        </span>

                    </div>

                </div>


                <div className="admin-header-badge">

                    <span className="admin-status-dot"></span>

                    Admin Panel

                </div>

            </header>



            {/* =================================
                MAIN
            ================================= */}

            <main className="admin-main">


                {/* =================================
                    PAGE INTRO
                ================================= */}

                <section className="admin-intro">

                    <span className="admin-eyebrow">
                        KNOWLEDGE BASE
                    </span>

                    <h1>
                        Teach something new.
                    </h1>

                    <p>
                        Upload official college documents
                        and make their information available
                        to the AI assistant.
                    </p>

                </section>



                {/* =================================
                    UPLOAD CARD
                ================================= */}

                <section className="admin-upload-card">


                    <div className="admin-upload-icon">

                        <svg viewBox="0 0 24 24">

                            <path d="M12 16V4" />

                            <path d="M7 9l5-5 5 5" />

                            <path d="M5 20h14" />

                        </svg>

                    </div>


                    <div className="admin-upload-content">

                        <h2>
                            Upload a document
                        </h2>

                        <p>
                            Add a PDF, TXT or DOCX file
                            to the knowledge base.
                        </p>


                        <div className="admin-upload-actions">

                            <button
                                className="admin-select-button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                            >
                                Select Document
                            </button>


                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt,.docx"
                                onChange={
                                    handleFileChange
                                }
                                hidden
                            />

                        </div>


                        <span className="admin-file-hint">
                            Supported: PDF • TXT • DOCX
                        </span>

                    </div>

                </section>



                {/* =================================
                    SELECTED FILE
                ================================= */}

                {selectedFile && (

                    <section className="selected-file-card">

                        <div className="selected-file-icon">
                            📄
                        </div>


                        <div className="selected-file-info">

                            <strong>
                                {selectedFile.name}
                            </strong>

                            <span>
                                {formatFileSize(
                                    selectedFile.size
                                )}
                            </span>

                        </div>


                        <button
                            className="admin-upload-button"
                            onClick={handleUpload}
                            disabled={uploading}
                        >

                            {uploading
                                ? "Processing..."
                                : "Added Successfully"
                            }

                        </button>

                    </section>

                )}



                {/* =================================
                    UPLOAD MESSAGE
                ================================= */}

                {uploadMessage && (

                    <div
                        className={`admin-upload-message ${uploadMessage.includes(
                            "successfully"
                        )
                            ? "success"
                            : "error"
                            }`}
                    >

                        <span>
                            {uploadMessage.includes(
                                "successfully"
                            )
                                ? "✓"
                                : "!"
                            }
                        </span>

                        <p>
                            {uploadMessage}
                        </p>

                    </div>

                )}



                {/* =================================
                    DOCUMENTS
                ================================= */}

                <section className="admin-documents-section">


                    <div className="admin-section-heading">

                        <div>

                            <span>
                                KNOWLEDGE SOURCES
                            </span>

                            <h2>
                                Uploaded Documents
                            </h2>

                        </div>


                        <div className="document-count">

                            {documents.length}

                            <span>
                                documents
                            </span>

                        </div>

                    </div>



                    {documents.length === 0 ? (

                        <div className="empty-documents">

                            <div>
                                ✦
                            </div>

                            <h3>
                                No documents yet
                            </h3>

                            <p>
                                Upload your first college
                                document to get started.
                            </p>

                        </div>

                    ) : (

                        <div className="documents-list">

                            {documents.map(
                                (document, index) => (

                                    <div
                                        className="document-card"
                                        key={index}
                                    >

                                        <div className="document-file-icon">

                                            {document.file_type === "pdf"
                                                ? "PDF"
                                                : document.file_type === "docx"
                                                    ? "DOC"
                                                    : "TXT"
                                            }

                                        </div>


                                        <div className="document-info">

                                            <strong>
                                                {document.original_filename}
                                            </strong>

                                            <span>
                                                Added{" "}
                                                {new Date(document.uploaded_at).toLocaleString()}
                                            </span>

                                        </div>


                                        <div className="document-meta">

                                            <span>
                                                {document.chunks} chunks
                                            </span>

                                            <span className="document-added">
                                                ✓ Added
                                            </span>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>



                {/* =================================
                    INFO CARD
                ================================= */}

                <section className="admin-info-card">

                    <div className="admin-info-icon">
                        ✦
                    </div>

                    <div>

                        <strong>
                            How it learns
                        </strong>

                        <p>
                            Uploaded documents are automatically
                            extracted, split into meaningful sections,
                            converted into embeddings and stored in
                            the knowledge base.
                        </p>

                    </div>

                </section>


            </main>

        </div>

    );

}


export default Admin;