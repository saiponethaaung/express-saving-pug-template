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
    entryFor: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

RecordSchema
    .virtual('created_at_formatted')
    .get(function (this: any) {
        return this.createdAt ? moment(this.createdAt).format("YYYY-MM-DD h:mm a") : "";
    });

RecordSchema
    .virtual('created_at_month')
    .get(function (this: any) {
        return this.createdAt ? moment(this.createdAt).format("MMMM") : "";
    });

RecordSchema
    .virtual('entry_for_formatted')
    .get(function (this: any) {
        return this.entryFor ? moment(this.entryFor).format("YYYY-MM-DD") : "";
    });

module.exports = mongoose.model('Record', RecordSchema);