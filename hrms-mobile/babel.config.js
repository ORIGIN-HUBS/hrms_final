module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-template-literals',
      '@babel/plugin-transform-modules-commonjs',
      ['@babel/plugin-transform-runtime', { helpers: true }],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@types': './src/types',
            '@constants': './src/constants',
            '@hooks': './src/hooks',
            '@theme': './src/theme',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};

