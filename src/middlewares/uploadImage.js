// Lưu tạm vào bộ nhớ
const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('./catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const multrStorage = multer.memoryStorage();

// Filer file
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new ErrorResponse('Not an image! Please upload only images.', 400),
      false
    );
  }
};

// Khởi tạo multer
const upload = multer({
  storage: multrStorage,
  fileFilter: multerFilter,
});

// @desc      Upload Bootcamp Photo
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.uploadPhoto = upload.single('avatar');

// @desc      Resize Bootcamp Photo
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.settingsPhoto = (FirstNamePhoto, StroageLocation) =>
  catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    let iduser = req.user.id;
    if (req.params.id) iduser = req.params.id;

    req.file.filename = `${FirstNamePhoto}-${iduser}-${Date.now()}.jpeg`;

    // Resize ảnh và dung lương ảnh
    // Dùng await vì sharp trả ra 1 promise nên có thể chậm
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`src/public/img/${StroageLocation}/${req.file.filename}`);
    next();
  });

// xoá các key-value không có trong alowedFields, trả ra 1 Obj mới
exports.filterObj = (obj, ...alowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((item) => {
    if (alowedFields.includes(item)) {
      newObj[item] = obj[item];
    }
  });
  return newObj;
};
