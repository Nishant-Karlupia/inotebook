const express=require("express");
const router=express.Router();
const fetchuser=require("../middleware/finduser");
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');
const { findByIdAndUpdate } = require("../models/Notes");

// route 1 : get all notes: /api/notes/fetchallnotes: login required
router.get( '/fetchallnotes',fetchuser,async(req,res)=>{
    try
    {
        const notes=await Notes.find({user:req.user.id});   
        res.json(notes);
    }
    catch(error)
    {
        res.status(500).send("Internal Server Error");
    }
})

// route 2 : add notes to databse: /api/notes/addnote: login required
router.post( '/addnote',fetchuser,[
    body('title', "Enter title with min-length 3").isLength({ min: 3 }),
    body('description', "Enter description with min-length 5").isLength({ min: 5 })
],async(req,res)=>{
    
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {title,description,tag}=req.body;
        
        const note= new Notes({
            title,description,tag,user:req.user.id
        })
        const savednote=await note.save();
        res.json(savednote);
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("Internal server Error");
    }

})

// route 3: update an existing note /api/notes/updatenote : login required
router.put( '/updatenote/:id',fetchuser,[
    body('title', "Enter title with min-length 3").isLength({ min: 3 }),
    body('description', "Enter description with min-length 5").isLength({ min: 5 })
],async(req,res)=>{
    try
    {
        const {title,description,tag}=req.body;
        // create newNote object
        const newnote={};
        if(title){newnote.title=title};
        if(description){newnote.description=description};
        if(tag){newnote.tag=tag};
        
        // find the note to update and update the note
        let note=await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not found");}
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not Allowed");
        }
        note=await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true});
        res.json(note);
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("Internal server Error");
    }
})

// route 4: delete an existing note: login required
router.delete( '/deletenote/:id',fetchuser,[
    body('title', "Enter title with min-length 3").isLength({ min: 3 }),
    body('description', "Enter description with min-length 5").isLength({ min: 5 })
],async(req,res)=>{
    try
    {
        // find the note to delete and delete the note
        let note=await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not found");}
        
        // allow deletion only if login user owns the note
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not Allowed");
        }
        note=await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success":"Note has deleted"});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("Internal server Error");
    }

})


module.exports=router

