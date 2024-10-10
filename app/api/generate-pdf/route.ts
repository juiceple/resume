import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function POST(request: NextRequest) {
  console.log('PDF 생성 요청 받음');

  try {
    const { html, cssRules, inlineStyles, computedStyles } = await request.json();

    if (!html) {
      console.log('HTML 내용 누락');
      return NextResponse.json({ message: 'HTML 내용이 필요합니다' }, { status: 400 });
    }

    console.log('Chrome 실행 준비 중');
    let browser;
    
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      // 서버리스 환경 (예: AWS Lambda, Vercel)
      console.log('서버리스 환경에서 실행 중');
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath('/tmp/chromium'),
        headless: chromium.headless,
      });
    } else {
      // 로컬 환경
      console.log('로컬 환경에서 실행 중');
      const executablePath = process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
          ? '/usr/bin/google-chrome'
          : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath,
      });
    }

    console.log('브라우저 실행됨');

    const page = await browser.newPage();
    console.log('새 페이지 생성됨');

    console.log('페이지 내용 설정 중');
    const styledHtml = `
      <style>
        ${cssRules}
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
      ${html}
    `;

    await page.setContent(styledHtml, { 
      waitUntil: ['networkidle0', 'load', 'domcontentloaded']
    });
    console.log('페이지 내용 설정 완료');

    console.log('애니메이션 대기 중');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

    console.log('PDF 생성 중');
    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: '48px', right: '48px', bottom: '48px', left: '48px' },
      preferCSSPageSize: true,
    });
    console.log('PDF 생성 완료');

    console.log('브라우저 종료 중');
    await browser.close();
    console.log('브라우저 종료됨');

    console.log('PDF 응답 전송 중');
    return new NextResponse(pdf, {
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
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}