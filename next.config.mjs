/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: `/*`,
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/f/*`,
      },
      {
        protocol: "https",
        hostname: "nextjs-15-social-media-app-kappa.vercel.app",
        pathname: `/*`,
      },
      {
        protocol: "https",
        hostname: "7yt8ct4ijw.ufs.sh",
        pathname: `/*`,
      },

    ],
  },
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
};

export default nextConfig;
