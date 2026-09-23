declare module "piexifjs" {
  const piexif: {
    load: (jpegBinaryOrDataUrl: string) => Record<string, Record<string, unknown>>;
    dump: (exifObj: Record<string, unknown>) => string;
    insert: (exifBytes: string, jpegBinaryOrDataUrl: string) => string;
    remove: (jpegBinaryOrDataUrl: string) => string;
    [key: string]: unknown;
  };
  export default piexif;
}
