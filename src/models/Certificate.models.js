import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doc",
      required: true,
    },

    documentName: {
      type: String,
      required: true,
    },

    documentHash: {
      type: String,
      default: null,
    },

    pdfUrl: {
      type: String,
      default: null,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const certificate = mongoose.model(
  "Certificate",
  CertificateSchema
);