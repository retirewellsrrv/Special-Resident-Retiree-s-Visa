/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    allowedDevOrigins: ['http://localhost:3000', 'https://srrv.vercel.app', '192.168.254.103', '10.229.139.153'],
    turbopack: {
        root: __dirname, // makes the project folder as root
    },
};

export default nextConfig;


