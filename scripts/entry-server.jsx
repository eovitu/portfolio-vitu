import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { ServerStyleSheet } from 'styled-components';
import App from '../src/App';
import { HomePage } from '../src/components/home/HomePage';
import { CaseStudy } from '../src/components/cases/CaseStudy';
import { NotFound } from '../src/components/routing/NotFound';

/** The build renders the same interface; browser-only motion remains in effects. */
export async function render(route) {
  const sheet = new ServerStyleSheet();
  try {
    const html = await new Promise((resolve, reject) => {
      const output = new PassThrough();
      let html = '';
      output.setEncoding('utf8');
      output.on('data', (chunk) => {
        html += chunk;
      });
      output.on('end', () => resolve(html));
      output.on('error', reject);
      const stream = renderToPipeableStream(
        sheet.collectStyles(
          <App
            initialRoute={route}
            initialLocale="pt"
            components={{ HomePage, CaseStudy, NotFound }}
          />,
        ),
        {
          onAllReady() {
            stream.pipe(output);
          },
          onError(error) {
            reject(error);
          },
        },
      );
    });
    return { html, styles: sheet.getStyleTags() };
  } finally {
    sheet.seal();
  }
}
