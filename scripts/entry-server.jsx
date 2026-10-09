import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { ServerStyleSheet } from 'styled-components';
import { parentPort, workerData } from 'node:worker_threads';
import App from '../src/App';

/** The build renders the same interface; browser-only motion remains in effects. */
export async function render(route) {
  const components =
    route.kind === 'home'
      ? { HomePage: (await import('../src/components/home/HomePage')).HomePage }
      : route.kind === 'case'
        ? {
            CaseStudy: await (
              await import('../src/components/cases/CaseStudy')
            ).prepareCaseStudy(route.slug),
          }
        : { NotFound: (await import('../src/components/routing/NotFound')).NotFound };
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
          <App initialRoute={route} initialLocale="pt" components={components} />,
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

if (parentPort) render(workerData).then((result) => parentPort.postMessage(result));
