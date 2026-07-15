import nextConfig from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  { ignores: ['lib/generated/**'] },
  ...nextConfig,
]

export default eslintConfig
