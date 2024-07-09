// job model use mongoose
/*
1. jobTitle ( Like **NodeJs back-end developer** )
2. jobLocation ( **onsite, remotely, hybrid** )
3. workingTime ( **part-time , full-time** )
4. seniorityLevel ( enum of **Junior, Mid-Level, Senior,Team-Lead, CTO** )
5. jobDescription ( identify what is the job and what i will do i accepted )
6. technicalSkills ( array of skills, like  **nodejs  , typescript** ,…)
7. softSkills (array of Skills , like **time management , team worker,**.. )
8. addedBy( what is the **compantHrId** who is added this job)
*/

import mongoose from "mongoose";

const { Schema, model } = mongoose;


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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: "version_key",
  }
);

const Job = mongoose.models.Job || model("Job", jobSchema);
export default Job;
