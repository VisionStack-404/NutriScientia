import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'android/**', 'flutter/**'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
