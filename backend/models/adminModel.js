const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const adminSchema = new mongoose.Schema({
    roles: [{
        type: String,
        enum: ['admin','User','logistics','procurement','Engineer'],
        default: "user"
    }],
    name: {
        type: String,
        required: [true, 'Please add a name'],
      },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
},
  {
    timestamps: true,
  }
)

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// will encrypt password eveytime its saved
adminSchema.pre("save", async function (next) {
  if(!this.isModified('password')){
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


module.exports = mongoose.model('Admin', adminSchema)