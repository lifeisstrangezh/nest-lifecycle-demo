/**
 * 生命周期日志工具：所有组件统一通过它打印日志，
 * 一次请求即可在终端按顺序看到完整的生命周期流转。
 */
export function log(stage: string, layer: string, message: string): void {
  const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
  console.log(`${ts} | ${stage.padEnd(20)} | ${layer.padEnd(10)} | ${message}`);
}
