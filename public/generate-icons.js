const fs = require('fs');

// Create a simple colored PNG using raw bytes
// This creates a basic solid color icon
function createSimplePNG(size, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const width = size;
  const height = size;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (image data)
  const zlib = require('zlib');
  const rawData = Buffer.alloc((width * 3 + 1) * height);
  
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter type
    for (let x = 0; x < width; x++) {
      const idx = y * (width * 3 + 1) + 1 + x * 3;
      // Create gradient effect
      const gradientR = Math.floor(139 + (16 - 139) * (x + y) / (width + height));
      const gradientG = Math.floor(92 + (185 - 92) * (x + y) / (width + height));
      const gradientB = Math.floor(246 + (129 - 246) * (x + y) / (width + height));
      rawData[idx] = gradientR;
      rawData[idx + 1] = gradientG;
      rawData[idx + 2] = gradientB;
    }
  }
  
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
fs.writeFileSync('icon-192.png', createSimplePNG(192, 139, 92, 246));
fs.writeFileSync('icon-512.png', createSimplePNG(512, 139, 92, 246));
fs.writeFileSync('icon-maskable.png', createSimplePNG(512, 139, 92, 246));
fs.writeFileSync('apple-touch-icon.png', createSimplePNG(180, 139, 92, 246));

console.log('Icons generated successfully!');
