export type AlpineComponent = {
  id: number;
  tagName: string;
  attributes;
  state: { [key: string]: any };
};

export type Message = {
  type: string;
  data: any;
};
