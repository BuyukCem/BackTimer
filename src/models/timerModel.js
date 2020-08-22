const mongoose = require('mongoose')
const Schema = mongoose.Schema

let timerSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: "project is required"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: "user is required"
        },
        dateStart: {
            type: Date,
            default: Date.now()
        },
        dateEnd: {
            type: Date
        }
    }
);

module.exports = mongoose.model('Timer', timerSchema)
const Model = mongoose.model("Timer")