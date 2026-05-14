import {
  CBI_BODY_XSD,
  CBI_PAYMENT_REQUEST_XSD,
  CBI_SGN_INF_XSD,
  type ValidationError,
} from '@sepalo/core';

// xmllint-wasm ships a browser worker + .wasm that resolve their own assets
// via `import.meta.url`. We vendor those files into /public/vendor/ and load
// the entry point with a dynamic import the bundler is told to skip — both
// `webpackIgnore` (webpack/next) and `turbopackIgnore` (turbopack) are
// honoured. This keeps everything client-side: no XML ever leaves the browser.
const VENDOR_URL = '/vendor/xmllint-wasm/index-browser.mjs';

interface XmllintModule {
  validateXML: (options: {
    xml: { fileName: string; contents: string }[];
    schema: { fileName: string; contents: string }[];
    preload?: { fileName: string; contents: string }[];
  }) => Promise<{
    valid: boolean;
    errors: { message: string; loc?: { lineNumber: number } }[];
  }>;
}

let cached: Promise<XmllintModule> | null = null;

function loadXmllint(): Promise<XmllintModule> {
  if (!cached) {
    cached = import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ VENDOR_URL
    ) as Promise<XmllintModule>;
  }
  return cached;
}

export async function validateXmlClientSide(xml: string): Promise<ValidationError[]> {
  const { validateXML } = await loadXmllint();
  const result = await validateXML({
    xml: [{ fileName: 'payment.xml', contents: xml }],
    schema: [{ fileName: 'CBIBdyPaymentRequest.00.04.01.xsd', contents: CBI_BODY_XSD }],
    preload: [
      { fileName: 'CBIPaymentRequest.00.04.01.xsd', contents: CBI_PAYMENT_REQUEST_XSD },
      { fileName: 'CBISgnInf.001.04.xsd', contents: CBI_SGN_INF_XSD },
    ],
  });
  if (result.valid) return [];
  return result.errors.map((e) => ({
    path: e.loc ? `xml:line:${e.loc.lineNumber}` : 'xml',
    code: 'XSD_VALIDATION_ERROR',
    message: e.message,
  }));
}
