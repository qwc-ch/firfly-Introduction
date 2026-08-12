/**
 * vite-plugin-avif
 * 构建时:将 dist 中的 png/webp/jpg 转换为 avif(源码 static 目录保持不变)
 * 开发时:将 .avif 请求按需从源图转换,通过内存缓存提供
 */
import { existsSync } from 'node:fs';
import { readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMG_EXTS = ['.png', '.webp', '.jpg', '.jpeg'];

function findSource(publicDir, pathname) {
    const base = path.join(publicDir, pathname.replace(/\.avif$/i, ''));
    for (const ext of IMG_EXTS) {
        const candidate = base + ext;
        if (existsSync(candidate)) return candidate;
    }
    return null;
}

async function convertDir(dir, quality) {
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    } catch {
        return { converted: 0, saved: 0 };
    }
    let converted = 0;
    let saved = 0;
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const r = await convertDir(full, quality);
            converted += r.converted;
            saved += r.saved;
            continue;
        }
        if (!IMG_EXTS.includes(path.extname(entry.name).toLowerCase())) continue;
        const srcStat = await stat(full);
        const outFile = path.join(dir, entry.name.replace(/\.[^.]+$/, '.avif'));
        const buf = await sharp(full).avif({ quality }).toBuffer();
        if (buf.length < srcStat.size) {
            await writeFile(outFile, buf);
            await rm(full);
            converted++;
            saved += srcStat.size - buf.length;
        }
    }
    return { converted, saved };
}

export function avifPlugin(options = {}) {
    const quality = options.quality ?? 65;
    const cache = new Map();
    let outDir = null;

    return {
        name: 'vite-plugin-avif',
        configResolved(config) {
            outDir = config.build.outDir;
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (!req.url || !req.url.endsWith('.avif')) return next();
                const pathname = decodeURIComponent(req.url.split('?')[0]);
                if (!pathname.startsWith('/') || pathname.includes('..')) return next();
                const publicDir = server.config.publicDir;
                if (!publicDir) return next();
                if (existsSync(path.join(publicDir, pathname))) return next();
                const source = findSource(publicDir, pathname);
                if (!source) return next();

                (async () => {
                    const mtime = (await stat(source)).mtimeMs;
                    const hit = cache.get(source);
                    if (hit && hit.mtime === mtime) {
                        res.setHeader('Content-Type', 'image/avif');
                        res.setHeader('Content-Length', hit.buf.length);
                        res.setHeader('Cache-Control', 'public, max-age=86400');
                        res.end(hit.buf);
                        return;
                    }
                    const buf = await sharp(source).avif({ quality }).toBuffer();
                    cache.set(source, { buf, mtime });
                    res.setHeader('Content-Type', 'image/avif');
                    res.setHeader('Content-Length', buf.length);
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    res.end(buf);
                })().catch(next);
            });
        },
        async closeBundle() {
            if (!outDir) return;
            const { converted, saved } = await convertDir(outDir, quality);
            if (converted) {
                console.log(
                    `[vite-plugin-avif] 已转换 ${converted} 张图片为 avif,节省 ${(saved / 1024 / 1024).toFixed(2)}MB`
                );
            }
        }
    };
}
