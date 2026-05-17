import mongoose, { Schema, Document } from 'mongoose';

export interface ISemester extends Document {
  name: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  institution?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    name: { type: String, required: true, maxlength: 200 },
    academicYear: { type: String, required: true, maxlength: 20 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    institution: { type: String, maxlength: 300 },
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

SemesterSchema.index({ createdBy: 1, isActive: 1 });
SemesterSchema.index({ createdBy: 1, academicYear: 1 });

export default (mongoose.models.Semester as mongoose.Model<ISemester>) ||
  mongoose.model<ISemester>('Semester', SemesterSchema);
