const { Schema, default: mongoose } = require("mongoose")

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
},
    { timestamps: true, }

)

// module.exports = mongoose.model("User", userSchema)

const User = mongoose.model("user", userSchema);
module.exports = User;
