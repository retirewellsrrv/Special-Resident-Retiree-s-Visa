/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    allowedDevOrigins: ['http://localhost:3000', 'srrv.vercel.app', '192.168.254.103', '10.229.139.153', '192.168.1.14','192.168.1.163', '192.168.1.14','dubiously-sanding-squash.ngrok-free.dev'],
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
        proxyClientMaxBodySize: '50mb',
    },
    transpilePackages: ['pdfjs-dist', 'react-pdf'],
    turbopack: {
        root: __dirname,
    },
    async headers() {
        return [
            {
                source: '/forgot-password/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
                ],
            },
        ]
    },
};

export default nextConfig;


