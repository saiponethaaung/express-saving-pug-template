var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LedgerSchema = new Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    participent: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

LedgerSchema
    .virtual('url')
    .get(function() {
        return '/ledger/' + this._id;
    });

module.exports = mongoose.model('Ledger', LedgerSchema);
