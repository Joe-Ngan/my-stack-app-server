import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async(req, res)=> {
    const { page } =req.query;

    try{
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT;// the start index of each page
        const total = await PostMessage.countDocuments({});// the sum number of posts
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);//current posts with LIMIT count
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total/LIMIT) });
    } catch(error){
        res.status(404).json({message: error.message});
    }
}

export const getPost = async(req, res)=> {
    const { id } =req.params;
    try{
        const post = await PostMessage.findById(id);
        res.status(200).json(post);
    } catch(error){
        res.status(404).json({message: error.message});
    }
}

export const getPostsBySearch = async(req, res)=> {
    const { searchQuery, tags } = req.query;
    try{
        const title = new RegExp(searchQuery, 'i');//iGnORe cAsE
        const filteredPost = await PostMessage.find({ $or: [ {title}, {tags: { $in: tags.split(',') }} ]});
        res.status(200).json({data : filteredPost});
    } catch(error){
        res.status(409).json({message: error.message});
    }
}

export const createPost = async (req, res)=> {
    const post = req.body;
    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() });
    try{
        await newPost.save();
        res.status(201).json(newPost);
    } catch(error){
        res.status(409).json({message: error.message});
    }
}

export const updatePost = async (req, res)=> {
    //1. get the id in the router param
    const { id: _id } = req.params;

    //2. check id existed or not
    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');

    //3. get the new post
    const post = req.body;

    //try catch
    try{
        //4. get the old post by id and update it with new post
        const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id}, {new: true});
        res.status(200).json(updatedPost);
    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const deletePost = async (req, res)=> {
    //1. get the id in the router param
    const { id: _id } = req.params;

    //2. check id existed or not
    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');

    //try catch
    try{
        //3. get the old post by id and update it with new post
        await PostMessage.findByIdAndRemove(_id);
        res.json({ message: 'Post deleted successfully '});
    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const likePost = async (req, res)=>{
    //1. get the id in the router param
    const { id: _id } = req.params;
    //1.5 got stuck in middleware
    if(!req.userId) return res.json({message: 'Unauthenticated'});
    //2. check id existed or not
    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');

    //try catch
    try{
        //3. get the old post by id 
        const post = await PostMessage.findById(_id);
        //4. check whether the old post is liked by the current id
        const index = post.likes.findIndex((id) => id === String(req.userId));
        if(index === -1){
            post.likes.push(req.userId);
        }else{
            post.likes = post.likes.filter((id) => id !== String(req.userId));
        }
        //5. update it with new likeCount
        const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {new: true});
        res.json(updatedPost);
    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const commentPost = async (req, res)=>{
    //1. get the id and the new post in the router param and body
    const { id: _id } = req.params;
    const { comment } = req.body;
    //1.5 got stuck in middleware
    if(!req.userId) return res.json({message: ' Unauthenticated'});

    //2. get the post, destructure the comment, add new comment
    const post = await PostMessage.findById(_id);
    post.comments.push(comment);

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true });
    
    res.json(updatedPost);
}