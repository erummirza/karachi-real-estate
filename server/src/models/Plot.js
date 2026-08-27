import mongoose from 'mongoose';

const { Schema } = mongoose;

const OfferSchema = new Schema(
  {
    id: { type: String, required: true },
    plotId: { type: String, required: true },
    offeredPricePkr: { type: Number, required: true },
    offeredDisplay: { type: String, required: true },
    offeringAgentName: { type: String, required: true },
    offeringAgentPhone: { type: String, required: true },
    offeringAgency: { type: String, default: '' },
    terms: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Countered'],
      default: 'Pending',
    },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const PlotSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    society: { type: String, enum: ['BTK', 'DCK', 'DHA'], required: true },
    societyName: { type: String, required: true },
    location: { type: String, required: true },
    precinctOrSector: { type: String, required: true },
    plotNumber: { type: String, required: true },
    category: {
      type: String,
      enum: ['Residential', 'Commercial', 'Villa', 'Apartment', 'Plot File'],
      required: true,
    },
    sizeSqyd: { type: Number, required: true },
    sizeDisplay: { type: String, required: true },
    demandPricePkr: { type: Number, required: true },
    demandDisplay: { type: String, required: true },
    features: { type: [String], default: [] },
    agentName: { type: String, default: '' },
    agentPhone: { type: String, default: '' },
    agencyName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Available', 'Under Offer', 'Sold'],
      default: 'Available',
    },
    notes: { type: String },
    rawText: { type: String },
    createdAt: { type: String, required: true },
    offers: { type: [OfferSchema], default: [] },
  },
  { versionKey: false }
);

// Present plots the same shape the frontend already expects (drop Mongo's _id).
PlotSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export const Plot = mongoose.model('Plot', PlotSchema);
