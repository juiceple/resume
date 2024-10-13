// import { NextRequest, NextResponse } from 'next/server';
// import puppeteer from 'puppeteer-core';
// import chromium from '@sparticuz/chromium-min';

// export async function POST(request: NextRequest) {
//   console.log('PDF 생성 요청 받음');

//   try {
//     const { html, cssRules, inlineStyles, computedStyles } = await request.json();

//     if (!html) {
//       console.log('HTML 내용 누락');
//       return NextResponse.json({ message: 'HTML 내용이 필요합니다' }, { status: 400 });
//     }

//     console.log('Chrome 실행 준비 중');
//     console.log('환경 변수:', JSON.stringify(process.env, null, 2));
    
//     let browser;
//     if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
//       console.log('서버리스 환경에서 실행 중');
//       try {
//         browser = await puppeteer.launch({
//           args: chromium.args,
//           defaultViewport: chromium.defaultViewport,
//           executablePath: await chromium.executablePath(
//             process.env.CHROME_EXECUTABLE_PATH || '/tmp/chromium'
//           ),
//           headless: chromium.headless,
//         });
//       } catch (launchError) {
//         console.error('브라우저 실행 오류:', launchError);
//         throw launchError;
//       }
//     } else {
//       console.log('로컬 환경에서 실행 중');
//       const executablePath = process.platform === 'win32'
//         ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//         : process.platform === 'linux'
//           ? '/usr/bin/google-chrome'
//           : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

//       browser = await puppeteer.launch({
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         executablePath,
//       });
//     }

//     console.log('브라우저 실행됨');

//     const page = await browser.newPage();
//     console.log('새 페이지 생성됨');

//     console.log('페이지 내용 설정 중');
//     const styledHtml = `
//       <style>
//         ${cssRules}
//         body {
//           font-family: ${computedStyles.fontFamily};
//           font-size: ${computedStyles.fontSize};
//           color: ${computedStyles.color};
//           background-color: ${computedStyles.backgroundColor};
//         }
//         .doc {
//           ${inlineStyles}
//           line-height: ${computedStyles.lineHeight};
//         }
//       </style>
//       ${html}
//     `;

//     await page.setContent(styledHtml, { 
//       waitUntil: ['networkidle0', 'load', 'domcontentloaded']
//     });
//     console.log('페이지 내용 설정 완료');

//     console.log('애니메이션 대기 중');
//     await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

//     console.log('PDF 생성 중');
//     const pdf = await page.pdf({
//       format: 'letter',
//       printBackground: true,
//       margin: { top: '48px', right: '48px', bottom: '48px', left: '48px' },
//       preferCSSPageSize: true,
//     });
//     console.log('PDF 생성 완료');

//     console.log('브라우저 종료 중');
//     await browser.close();
//     console.log('브라우저 종료됨');

//     console.log('PDF 응답 전송 중');
//     return new NextResponse(pdf, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': 'attachment; filename=document.pdf',
//       },
//     });
//   } catch (error) {
//     console.error('PDF 생성 오류:', error);
//     return NextResponse.json({ 
//       message: `PDF 생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
//       stack: error instanceof Error ? error.stack : undefined,
//       env: JSON.stringify(process.env, null, 2)
//     }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';

// btoa polyfill for Node.js
const btoa = (str) => Buffer.from(str).toString('base64');

export async function POST(request) {
  console.log('PDF 생성 요청 받음');

  try {
    const { html, css, inlineStyles, computedStyles } = await request.json();

    if (!html) {
      console.log('HTML 내용 누락');
      return NextResponse.json({ message: 'HTML 내용이 필요합니다' }, { status: 400 });
    }

    console.log('PDFShift API 호출 준비 중');

    // Prepare the HTML with inline styles
    const styledHtml = `
      <html>
        <head>
          <style>
            ${css}
            body {
              font-family: ${computedStyles.fontFamily};
              font-size: ${computedStyles.fontSize};
              color: ${computedStyles.color};
              background-color: ${computedStyles.backgroundColor};
            }
            .doc {
              ${inlineStyles}
              line-height: ${computedStyles.lineHeight};
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const apiKey = process.env.PDFSHIFT_API_KEY;
    if (!apiKey) {
      throw new Error('PDFShift API key is not set');
    }

    console.log('PDFShift API 호출 중');
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: styledHtml,
        landscape: false,
        use_print: false,
        format: 'Letter',
        margin: '48px'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDFShift API 오류: ${response.status} ${errorText}`);
    }

    console.log('PDF 생성 완료');

    const pdfBuffer = await response.arrayBuffer();

    console.log('PDF 응답 전송 중');
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
      },
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json({ 
      message: `PDF 생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}