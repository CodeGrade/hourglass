module.exports = function(api) {
  api.cache(true);
  const presets = [
    [
      '@babel/preset-react',
      {
        modules: false,
        useBuiltIns: true,
      },
    ],
    [
      '@babel/preset-typescript',
      {
        allExtensions: true,
        isTSX: true,
        modules: false,
      },
    ],
    [
      '@babel/preset-env',
      {
        forceAllTransforms: true,
        useBuiltIns: 'entry',
        corejs: 3,
        modules: false,
        exclude: ['transform-typeof-symbol'],
      },
    ],
  ];

  const plugins = [
    '@babel/plugin-syntax-dynamic-import',
    'react-hot-loader/babel',
    '@babel/plugin-transform-destructuring',
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    [
      '@babel/plugin-proposal-object-rest-spread',
      {
        useBuiltIns: true,
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: false,
        regenerator: true,
        corejs: false,
      },
    ],
    [
      '@babel/plugin-transform-regenerator',
      {
        async: false,
      },
    ],
  ];

  return {
    presets,
    plugins,
  };
};
