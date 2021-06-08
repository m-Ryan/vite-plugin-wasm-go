async function bootstrap() {
  const { add, subtract } = await import('./test.go').then((r) => r.default);
  console.log('add', add(100, 500));
  console.log('subtract', subtract(400, 50));
}

bootstrap();
