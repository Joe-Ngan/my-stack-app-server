import mongoose from "mongoose";

const postSchma = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    comments: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
        default: []
    },
});

const PostMessage = mongoose.model('PostMessage', postSchma);//PostMessage structure is designed by me, using methods from mongoose

export default PostMessage;