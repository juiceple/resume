const chromium = require('chrome-aws-lambda');

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chromium.font(
    'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
  );
}

module.exports = {};