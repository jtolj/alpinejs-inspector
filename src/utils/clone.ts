import { js_beautify as beautify } from "js-beautify";
import cloneDeepWith from "lodash.clonedeepwith";

export default function deepClone(obj: any): { [key: string]: any } {
  const customizer = (
    value: any,
    key: number | string | undefined,
    object: object | undefined,
    stack: any
  ): any => {
    if (typeof value === "function") {
      console.log("function", key, beautify(value.toString()));
      return beautify(value.toString());
    }
    return undefined;
  };

  return cloneDeepWith(obj, customizer);
}
