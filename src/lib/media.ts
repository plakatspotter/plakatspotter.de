import path from "node:path"
import { mkdirSync, statSync, existsSync } from "node:fs"
import type { FileBlob } from "bun"
import sharp from "sharp";

/**
 * Ensure that the media path exists and is writable
 */
export function prepareMediaDir(dir: string) {
    if (existsSync(dir)) {
        const stat = statSync(dir)
        if (!stat.isDirectory()) {
            throw `${dir} is not a directory`
        }
        if (stat.mode != 0o40755) {
            throw `${dir} does not have 755 permissions`
        }
    } else {
        console.log(`Creating media path at ${dir}`);
        mkdirSync(dir, {mode: "0755"});
    }
}

export async function storeImageBlob(image: File, name: string): Promise<string> {
    console.log("storing image into media folder", image.type);
    let buf;
    if (image.type != "image/webp") {
        buf = await convertToWebp(image);
    } else {
        buf = await image.arrayBuffer();
    }

    await Bun.write(name, buf);

    return name;
}

async function convertToWebp(image: File): Promise<Buffer> {
    console.log("converting image to webp");
    return sharp(await image.arrayBuffer())
        .webp({
            preset: "photo",
        })
        .toBuffer()
}
