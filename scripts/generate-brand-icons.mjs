import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Resize the approved header master directly; never redraw the B³ shape.
const source = new URL('../src/assets/brand/b3-angular-street.png', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
const resize = size => sharp(source.pathname).resize(size, size, { kernel: 'lanczos3' }).png();

await Promise.all([
  resize(32).toFile(new URL('favicon-32.png', publicDir).pathname),
  resize(180).toFile(new URL('apple-touch-icon.png', publicDir).pathname),
]);
const embeddedLogo = await resize(128).toBuffer();
await writeFile(new URL('favicon.svg', publicDir), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <title>Bits.Before.Bots — B cubed</title>
  <image width="128" height="128" href="data:image/png;base64,${embeddedLogo.toString('base64')}"/>
</svg>
`);
console.log('Generated all icons from the exact homepage logo.');
