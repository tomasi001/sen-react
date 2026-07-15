import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // FR is primary at launch (D010 Q2). EN ships when REACT-paced verification lands.
  // i18n routing will be added in a later phase; for now, all routes default to FR.
  typedRoutes: true,
  transpilePackages: ["@sen-react/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.senreact.com",
        pathname: "/**",
      },
    ],
  },
};

export default config;
