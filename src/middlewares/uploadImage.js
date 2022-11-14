// Lưu tạm vào bộ nhớ
const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('./catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const multrStorage = multer.memoryStorage();

// @desc      Filter file upload
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

// @desc      Khởi tạo multer
const upload = multer({
  storage: multrStorage,
  fileFilter: multerFilter,
});

// @desc      Xoá các key-value không có trong alowedFields, trả ra 1 Obj mới
exports.filterObj = (obj, ...alowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((item) => {
    if (alowedFields.includes(item)) {
      newObj[item] = obj[item];
    }
  });
  return newObj;
};

// @desc      Upload Image
exports.uploadUserImage = upload.single('avatar');

// @desc      Upload mutil Image
exports.uploadProductImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 6 },

  //upload.single('image') req.file
  //upload.array('image',3) req.files
]);

// @desc      Setting User Image
exports.settingUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  if (req.params.id) iduser = req.params.id;

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Resize ảnh và dung lương ảnh
  // Dùng await vì sharp trả ra 1 promise nên có thể chậm
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/img/users/${req.file.filename}`);
  next();
});

// @desc      Setting Product Image
exports.settingProductImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover) return next();

  const idProduct = req.params.id || req.user.id;
  // 1) IMAGE COVER
  // Gán giá trị cho req.body.imageCover để dùng lưu ra các router sau
  req.body.imageCover = `product-${idProduct}-${Date.now()}-cover.jpeg`;

  // Settings ảnh và dung lương ảnh
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/img/products/${req.body.imageCover}`);

  // 2) IMAGES
  if (!req.files.images) return next();

  req.body.images = [];

  // Nên sử dụng map vì map có giá trị trả ra nên sử dụng được Promise.all
  // Tất cả hàm đều là Bất đồng bộ nên dùng Promise.all để chờ hoàn thành 1 lượt
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${idProduct}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`src/public/img/products/${filename}`);

      // Đảy từng phần từ vào mảng rỗng ở trên
      req.body.images.push(filename);
    })
  );
  next();
});
