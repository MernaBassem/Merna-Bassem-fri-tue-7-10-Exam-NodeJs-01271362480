// user model use mongoose
/*

*/

import mongoose from "mongoose";
const { Schema, model } = mongoose;

import Application  from './application.model.js';  // Import Application model

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      enum: ["onsite", "remotely", "hybrid"],
      required: true,
    },
    workingTime: {
      type: String,
      enum: ["part-time", "full-time"],
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: ["Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    technicalSkills: {
      type: [String],
      required: true,
    },
    softSkills: {
      type: [String],
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

jobSchema.pre("remove", async function (next) {
  await Application.deleteMany({ jobId: this._id });
  next();
});


const Job = mongoose.models.Job || model("Job", jobSchema);
export default Job;
