/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module '*.json' {
  const value: any;
  export default value;
}
declare interface String {
  format(str: string, ...args: string[])
}