module.exports = {
  presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/hooks': './src/hooks',
          '@/stores': './src/stores',
          '@/navigation': './src/navigation',
          '@/i18n': './src/i18n',
          '@/config': './src/config',
          '@/context': './src/context',
          '@/polyfills': './src/polyfills',
        },
      },
    ],
  ],
};
