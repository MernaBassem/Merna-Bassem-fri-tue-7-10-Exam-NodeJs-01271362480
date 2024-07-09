// application model use mongoose
/*
1. jobId ( the Job Id )
2. userId ( the applier Id )
3. userTechSkills ( array of the applier technical Skills )
4. userSoftSkills ( array of the applier soft Skills )
5. userResume ( must be pdf , upload this pdf on cloudinary )
*/

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userTechSkills: {
      type: [String],
      required: true,
    },
    userSoftSkills: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: "version_key",
  }
);

const Application =
  mongoose.models.Application || model("Application", applicationSchema);
export default Application;
