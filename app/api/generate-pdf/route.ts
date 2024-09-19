// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/generate-pdf');

  try {
    const { html, css } = await request.json();

    if (!html) {
      console.log('HTML content is missing');
      return NextResponse.json({ message: 'HTML content is required' }, { status: 400 });
    }

    console.log('Launching Puppeteer');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('Setting page content');
    // Inject CSS directly into the page
    await page.setContent(`
      <style>${css}</style>
      ${html}
    `, { 
      waitUntil: ['networkidle0', 'load', 'domcontentloaded']
    });

    // Wait for any animations or transitions to complete
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

    console.log('Generating PDF');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '48px', right: '48px', bottom: '48px', left: '48px' },
      preferCSSPageSize: true,
    });

    console.log('Closing browser');
    await browser.close();

    console.log('Sending PDF response');
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ message: 'Error generating PDF' }, { status: 500 });
  }
}