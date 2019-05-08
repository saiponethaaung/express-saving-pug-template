var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var RecordSchema = new Schema({
    ledger: { type: Schema.Types.ObjectId, ref: 'Ledger', required: true },
    name: { type: String, required: true },
    note: { type: String, default: '' },
    amount: { type: Number, default: 0, required: true },
    credit: { type: Boolean, default: true },
    entryBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

RecordSchema
    .virtual('created_at_formatted')
    .get(function() {
        return this.createdAt ? moment(this.createdAt).format("YYYY-MM-DD h:mm a") : "";
    });

RecordSchema
    .virtual('created_at_month')
    .get(function() {
        return this.createdAt ? moment(this.createdAt).format("MMMM") : "";
    });

module.exports = mongoose.model('Record', RecordSchema);