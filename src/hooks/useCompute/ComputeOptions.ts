export interface ComputeValue {
  entrypoint: string;
  image: string;
  tag: string;
}
export interface ComputeOption {
  name: string;
  value: ComputeValue;
}

export const computeOptions: ComputeOption[] = [
  {
    name: 'nodejs',
    value: {
      entrypoint: 'node $ALGO',
      image: 'node',
      tag: '10'
    }
  },
  {
    name: 'python3.7',
    value: {
      entrypoint: 'python $ALGO',
      image: 'oceanprotocol/algo_dockers',
      tag: 'python-panda'
    }
  }
];
