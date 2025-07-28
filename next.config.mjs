import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(path.dirname(new URL(import.meta.url).pathname));
        return config;
    },
};

export default nextConfig;