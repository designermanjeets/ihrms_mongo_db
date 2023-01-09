const shortid = require('shortid');
const Upload = require('../../../models/upload')
const fs = require('fs');
const path = require('path');
const os = require('os');
const tmpDir = os.tmpdir();
const excelReader = require('../../../utils/excel-reader');
const User = require('../../../models/user');
const Attendances = require('../../../models/attendances');
let tmppath = '';

const uploadFileAttendance =  async ( _, { file },{me,tenantid}) => new Promise(async (resolve, reject) => {

  fs.mkdtemp(path.join(os.tmpdir(), 'foo-'), (err, directory) => {
    if (err) throw err;
    tmppath = directory;
    processUpload(file, tmppath).then(upload => {
      if(!upload) reject(new Error('Upload failed!'));
      Upload.create(upload).then( async up => {
        if(!up) reject(new Error('Upload failed!'));
        const employees = excelReader.readExcel(upload.path);
        try {
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
        await Promise.all(employees.map(async delay => {
        await wait(delay)
        delay.user =   await User.findOne({eCode: delay.eCode});
     
    }))
    await employees.forEach(async(u) => {
      u.userId= u.user._id;
      u.user=  u.user._id;
      u.tenantid = tenantid;
      u.date = u.inTime;
      u.audit = {
        created_at: new Date(),
        tenantid :tenantid,
        created_by:me.user.username
      };
      
    });
        resolve(employees);
         } catch (e) {
        reject()
      }
        
      });
    })
  });
});

const storeUpload = async ({ stream, filename, mimetype }) => {
  const id = shortid.generate();
  const path = `${tmppath}/${id}-${filename}`;
  return new Promise((resolve, reject) =>
    stream
      .pipe(fs.createWriteStream(path))
      .on("finish", () => resolve({ id, path, filename, mimetype }))
      .on("error", reject)
  );
};
const processUpload = async (upload) => {
  const { file } = await upload;
  const stream = file.createReadStream();
  return await storeUpload({ stream, filename: file.filename, mimetype: file.mimetype });
};


module.exports = uploadFileAttendance;
