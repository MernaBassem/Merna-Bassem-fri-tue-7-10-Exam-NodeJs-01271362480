// company model use mongoose
/*
1. companyName ⇒ ( unique )
2. description (Like what are the actual activities and services provided by the company ? )
3. industry ( Like Mental Health care )
4. address
5. numberOfEmployees ( must be range such as 11-20 employee)
6. companyEmail ⇒ ( unique )
7. companyHR ( userId )
*/

import mongoose from "mongoose";
import Job from "./job.model.js";
const { Schema, model } = mongoose;

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      type: String,
      required: true,
     match: /^[0-9]+-[0-9]+$/
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
    },
    companyHR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

// Virtual field to populate jobs
companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
});

// Ensure virtual fields are included in the output
companySchema.set("toJSON", { virtuals: true });

const Company = mongoose.models.Company || model("Company", companySchema);
export default Company;
