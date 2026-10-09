import mongoose from 'mongoose';

const { Schema } = mongoose;

const AgentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    cnicNumber: { type: String, required: true, unique: true },
    contactPhone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    agencyName: { type: String, required: true },
    operatingCity: { type: String, required: true },
    // Set at registration; never returned to the client (see toJSON below).
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    createdAt: { type: String, required: true },
    reviewedAt: { type: String, default: null },
  },
  { versionKey: false }
);

// Present agents the same way the frontend expects (drop Mongo's internal _id, never leak the password hash).
AgentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

export const Agent = mongoose.model('Agent', AgentSchema);