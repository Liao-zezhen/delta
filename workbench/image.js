import EXIF from 'exif-js';

const file = document.querySelector('#file');
file.addEventListener('change', function () {
  EXIF.getData(file.files[0], function () {
    console.log(EXIF.getTag(this, 'Orientation'));
  });
});
