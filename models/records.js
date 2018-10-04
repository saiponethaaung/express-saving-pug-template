var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecordSchema = new Schema({
    ledger: { type: Schema.Types.ObjectId, ref: 'Ledger', required: true },
    amount: { type: Number, default: 0, required: true },
    entryBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Record', RecordSchema);