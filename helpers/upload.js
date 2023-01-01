const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mime = require("mime");
const sizeOf = require("image-size");

exports.generateRandomString = async (length) => {
  return await crypto.randomBytes(length).toString("hex");
};

const decodeBase64String = (string) => {
  const matches = string.match(/^data:([A-Za-z-+.\/]+);base64,(.+)$/);
  const response = {};

  if (matches && matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer.from(matches[2], "base64");

  return response;
};

exports.createFolder = (filePath) => {
  !fs.existsSync(path.join(__dirname, `../${filePath}`)) &&
    fs.mkdirSync(path.join(__dirname, `../${filePath}`));
};

exports.allowedImageExtensions = [
  "jpg",
  "jpeg",
  "jiff",
  "png",
  "bmp",
  "gif",
  "svg",
  "webp",
];

exports.uploadSingle = async (
  params,
  key = "image",
  fileInfo = {},
  allowedFields = this.allowedImageExtensions,
  maxSize = 100
) => {
  const fileResponse = decodeBase64String(params[key]);
  const extension = params.extension || mime.getExtension(fileResponse.type);

  if (!allowedFields.includes(extension)) {
    throw new Error(
      fileInfo.allowExtError ||
        "File does not match the desired extension type."
    );
  } else if (fileResponse.data.length > maxSize * 1048576) {
    throw new Error(
      fileInfo.sizeError || `File size is more than ${maxSize}mb.`
    );
  }

  if(this.allowedImageExtensions.includes(extension)){
    const dimensions = sizeOf(fileResponse.data);
    if (
      fileInfo.width &&
      fileInfo.height &&
      dimensions.height > fileInfo.height &&
      dimensions.width > fileInfo.width
    ) {
      throw new Error(
        `Max resolution ${fileInfo.width}px width and ${fileInfo.height}px height image is allow`
      );
    } else if (fileInfo.width && dimensions.width > fileInfo.width) {
      throw new Error(
        `Max resolution ${fileInfo.width}px width image is allow`
      );
    }else if (fileInfo.height && dimensions.height > fileInfo.height) {
      throw new Error(
        `Max resolution ${fileInfo.height}px height image is allow`
      );
    }  
  }
  
  const fileName = fileInfo.name || new Date().getTime();
  const randomString = await this.generateRandomString(12);
  const uniqueFileName = `${fileName}${randomString}.${extension}`;

  !fs.existsSync(path.join(__dirname, `../uploads/${fileInfo.path}`)) &&
    fs.mkdirSync(path.join(__dirname, `../uploads/${fileInfo.path}`));

  fs.writeFileSync(
    path.join(__dirname, `../uploads/${fileInfo.path}/${uniqueFileName}`),
    fileResponse.data
  );

  return {
    name: fileName,
    path: `uploads/${fileInfo.path}/${uniqueFileName}`,
    size: fileResponse.data.length,
    extension,
  };
};

exports.uploadMulti = async (
  params,
  key = "image",
  fileInfo = {},
  allowedFields = this.allowedImageExtensions,
  maxSize = 100
) => {
  const fileResponse = decodeBase64String(params);
  const extension = params.extension || mime.getExtension(fileResponse.type);

  if (!allowedFields.includes(extension)) {
    throw new Error(
      fileInfo.allowExtError ||
        "File does not match the desired extension type."
    );
  } else if (fileResponse.data.length > maxSize * 1048576) {
    throw new Error(
      fileInfo.sizeError || `File size is more than ${maxSize}mb.`
    );
  }

  if(this.allowedImageExtensions.includes(extension)){
    const dimensions = sizeOf(fileResponse.data);
    if (
      fileInfo.width &&
      fileInfo.height &&
      dimensions.height > fileInfo.height &&
      dimensions.width > fileInfo.width
    ) {
      throw new Error(
        `Max resolution ${fileInfo.width}px width and ${fileInfo.height}px height image is allow`
      );
    } else if (fileInfo.width && dimensions.width > fileInfo.width) {
      throw new Error(
        `Max resolution ${fileInfo.width}px width image is allow`
      );
    }else if (fileInfo.height && dimensions.height > fileInfo.height) {
      throw new Error(
        `Max resolution ${fileInfo.height}px height image is allow`
      );
    }  
  }
  
  const fileName = fileInfo.name || new Date().getTime();
  const randomString = await this.generateRandomString(12);
  const uniqueFileName = `${fileName}${randomString}.${extension}`;

  !fs.existsSync(path.join(__dirname, `../uploads/${fileInfo.path}`)) &&
    fs.mkdirSync(path.join(__dirname, `../uploads/${fileInfo.path}`));

  fs.writeFileSync(
    path.join(__dirname, `../uploads/${fileInfo.path}/${uniqueFileName}`),
    fileResponse.data
  );

  return {
    name: fileName,
    path: `uploads/${fileInfo.path}/${uniqueFileName}`,
    size: fileResponse.data.length,
    extension,
  };
};

exports.deleteFile = (filePath) => {
  fs.existsSync(path.join(__dirname, `../${filePath}`)) &&
    fs.unlinkSync(path.join(__dirname, `../${filePath}`));
};

exports.uploadBinaryFile = async (params) => {
  const fileName = params.file.name || new Date().getTime();
  const extension = mime.getExtension(params.file.mimetype);
  const randomString = await this.generateRandomString(12);
  const uniqueFileName = `${fileName}${randomString}.${extension}`;

  !fs.existsSync(path.join(__dirname, `../uploads/${params.folderPath}`)) &&
    fs.mkdirSync(path.join(__dirname, `../uploads/${params.folderPath}`));

  fs.writeFileSync(
    path.join(__dirname, `../uploads/${params.folderPath}/${uniqueFileName}`),
    params.file.data
  );

  return {
    name: fileName,
    path: `uploads/${params.folderPath}/${uniqueFileName}`,
    size: params.file.size,
    extension,
  };
};
