import multer from "multer";

const storage = multer.memoryStorage(); // store in memory, not disk
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
