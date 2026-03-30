import multer from "multer";
import path from "path";

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",  
    "video/x-matroska",
    "video/webm"
]

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, "_")
            .substring(0, 50);
        
        cb(null, basename + "-" + uniqueSuffix + ext); 
    },
});

const fileFilter = (req, file, cb) => {
    if(ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }else {
        cb(new Error("Invalid file type. only video files are allowed"), false);
    }
};

export const upload = multer({ 
     storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});