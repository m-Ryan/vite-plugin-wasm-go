declare module '*.go' {
  const object: Promise<{ [key: string]: any }>;
  export default object;
}
