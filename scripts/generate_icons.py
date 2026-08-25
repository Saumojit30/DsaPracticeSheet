import os
import struct
import zlib

def make_png(width, height, color):
    # Minimal pure Python PNG generator
    def png_chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    # 8-bit RGBA
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = png_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    
    # Raw image data with filter byte per row
    raw = bytearray()
    for y in range(height):
        raw.append(0) # filter type 0 (none)
        for x in range(width):
            # Gradient & border styling
            # Circle radius check
            cx, cy = width / 2.0, height / 2.0
            dist = ((x - cx)**2 + (y - cy)**2)**0.5
            radius = min(width, height) / 2.0 - 1.0

            if dist <= radius:
                # Inside circle - vibrant blue/purple gradient
                ratio = (x + y) / (width + height)
                r = int(59 * (1 - ratio) + 139 * ratio)
                g = int(130 * (1 - ratio) + 92 * ratio)
                b = int(246 * (1 - ratio) + 246 * ratio)
                a = 255
            else:
                r, g, b, a = 0, 0, 0, 0 # transparent

            raw.extend([r, g, b, a])

    idat = png_chunk(b'IDAT', zlib.compress(bytes(raw)))
    iend = png_chunk(b'IEND', b'')

    return header + ihdr + idat + iend

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 48, 128]
    for size in sizes:
        png_data = make_png(size, size, (59, 130, 246))
        filepath = os.path.join(icons_dir, f'icon{size}.png')
        with open(filepath, 'wb') as f:
            f.write(png_data)
        print(f'Generated {filepath}')

if __name__ == '__main__':
    main()
