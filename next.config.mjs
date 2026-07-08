/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    allowedDevOrigins: ['http://localhost:3000', 'srrv.vercel.app', '192.168.254.103', '10.229.139.153', '192.168.1.14', 'dubiously-sanding-squash.ngrok-free.dev'],
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    turbopack: {
        root: __dirname,
    },
};

export default nextConfig;


