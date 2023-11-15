import multer from "multer";

const storage = multer.diskStorage({
    destination: function ( req, file, cb){
        cb(null, "./public/temp") //destination folder
    },
    filename: function( req, file, cb){
        // todo: change originalname bz user can have multiple file with same name
        cb(null, file.originalname) //original name is name uploaded by user
    }
})

 export const upload = multer({ 
    storage,
 })