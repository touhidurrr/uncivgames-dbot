colors = [
  0xffebee, 0xffcdd2, 0xef9a9a, 0xe57373, 0xef5350, 0xf44336, 0xe53935, 0xd32f2f, 0xc62828,
  0xb71c1c, 0xff8a80, 0xff5252, 0xff1744, 0xd50000, 0xfce4ec, 0xf8bbd0, 0xf48fb1, 0xf06292,
  0xec407a, 0xe91e63, 0xd81b60, 0xc2185b, 0xad1457, 0x880e4f, 0xff80ab, 0xff4081, 0xf50057,
  0xc51162, 0xf3e5f5, 0xe1bee7, 0xce93d8, 0xba68c8, 0xab47bc, 0x9c27b0, 0x8e24aa, 0x7b1fa2,
  0x6a1b9a, 0x4a148c, 0xea80fc, 0xe040fb, 0xd500f9, 0xaa00ff, 0xede7f6, 0xd1c4e9, 0xb39ddb,
  0x9575cd, 0x7e57c2, 0x673ab7, 0x5e35b1, 0x512da8, 0x4527a0, 0x311b92, 0xb388ff, 0x7c4dff,
  0x651fff, 0x6200ea, 0xe8eaf6, 0xc5cae9, 0x9fa8da, 0x7986cb, 0x5c6bc0, 0x3f51b5, 0x3949ab,
  0x303f9f, 0x283593, 0x1a237e, 0x8c9eff, 0x536dfe, 0x3d5afe, 0x304ffe, 0xe3f2fd, 0xbbdefb,
  0x90caf9, 0x64b5f6, 0x42a5f5, 0x2196f3, 0x1e88e5, 0x1976d2, 0x1565c0, 0x0d47a1, 0x82b1ff,
  0x448aff, 0x2979ff, 0x2962ff, 0xe1f5fe, 0xb3e5fc, 0x81d4fa, 0x4fc3f7, 0x29b6f6, 0x03a9f4,
  0x039be5, 0x0288d1, 0x0277bd, 0x01579b, 0x80d8ff, 0x40c4ff, 0x00b0ff, 0x0091ea, 0xe0f7fa,
  0xb2ebf2, 0x80deea, 0x4dd0e1, 0x26c6da, 0x00bcd4, 0x00acc1, 0x0097a7, 0x00838f, 0x006064,
  0x84ffff, 0x18ffff, 0x00e5ff, 0x00b8d4, 0xe0f2f1, 0xb2dfdb, 0x80cbc4, 0x4db6ac, 0x26a69a,
  0x009688, 0x00897b, 0x00796b, 0x00695c, 0x004d40, 0xa7ffeb, 0x64ffda, 0x1de9b6, 0x00bfa5,
  0xe8f5e9, 0xc8e6c9, 0xa5d6a7, 0x81c784, 0x66bb6a, 0x4caf50, 0x43a047, 0x388e3c, 0x2e7d32,
  0x1b5e20, 0xb9f6ca, 0x69f0ae, 0x00e676, 0x00c853, 0xf1f8e9, 0xdcedc8, 0xc5e1a5, 0xaed581,
  0x9ccc65, 0x8bc34a, 0x7cb342, 0x689f38, 0x558b2f, 0x33691e, 0xccff90, 0xb2ff59, 0x76ff03,
  0x64dd17, 0xf9fbe7, 0xf0f4c3, 0xe6ee9c, 0xdce775, 0xd4e157, 0xcddc39, 0xc0ca33, 0xafb42b,
  0x9e9d24, 0x827717, 0xf4ff81, 0xeeff41, 0xc6ff00, 0xaeea00, 0xfffde7, 0xfff9c4, 0xfff59d,
  0xfff176, 0xffee58, 0xffeb3b, 0xfdd835, 0xfbc02d, 0xf9a825, 0xf57f17, 0xffff8d, 0xffff00,
  0xffea00, 0xffd600, 0xfff8e1, 0xffecb3, 0xffe082, 0xffd54f, 0xffca28, 0xffc107, 0xffb300,
  0xffa000, 0xff8f00, 0xff6f00, 0xffe57f, 0xffd740, 0xffc400, 0xffab00, 0xfff3e0, 0xffe0b2,
  0xffcc80, 0xffb74d, 0xffa726, 0xff9800, 0xfb8c00, 0xf57c00, 0xef6c00, 0xe65100, 0xffd180,
  0xffab40, 0xff9100, 0xff6d00, 0xfbe9e7, 0xffccbc, 0xffab91, 0xff8a65, 0xff7043, 0xff5722,
  0xf4511e, 0xe64a19, 0xd84315, 0xbf360c, 0xff9e80, 0xff6e40, 0xff3d00, 0xdd2c00, 0xefebe9,
  0xd7ccc8, 0xbcaaa4, 0xa1887f, 0x8d6e63, 0x795548, 0x6d4c41, 0x5d4037, 0x4e342e, 0x3e2723,
  0xfafafa, 0xf5f5f5, 0xeeeeee, 0xe0e0e0, 0xbdbdbd, 0x9e9e9e, 0x757575, 0x616161, 0x424242,
  0x212121, 0xeceff1, 0xcfd8dc, 0xb0bec5, 0x90a4ae, 0x78909c, 0x607d8b, 0x546e7a, 0x455a64,
  0x37474f, 0x263238,
];

function getRandomColor() {
  return colors[Math.floor(colors.length * Math.random())];
}

module.exports = {
  colors,
  getRandomColor,
};
